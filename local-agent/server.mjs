import { createServer } from 'node:http'
import { execFile, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { hostname, platform, release, arch, cpus, totalmem, freemem, homedir } from 'node:os'
import { promisify } from 'node:util'

const PORT = Number(process.env.CONTROL_LLAMA_AGENT_PORT || 8787)
const HOST = process.env.CONTROL_LLAMA_AGENT_HOST || '127.0.0.1'
const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || process.env.VITE_OLLAMA_API_BASE_URL || 'http://127.0.0.1:11434'
const LOCAL_WEB_HOST = process.env.MOLC_AI_WEB_HOST || '127.0.0.1'
const LOCAL_WEB_PORT = Number(process.env.MOLC_AI_WEB_PORT || 4173)
const LOCAL_WEB_BASE_URL =
  process.env.MOLC_AI_WEB_BASE_URL || `http://${LOCAL_WEB_HOST}:${LOCAL_WEB_PORT}`
const ALLOW_SYSTEM_COMMANDS =
  process.env.MOLC_AGENT_ALLOW_SYSTEM_COMMANDS !== 'false'
const MOLC_AI_HOME = process.env.MOLC_AI_HOME || `${homedir()}/Library/Application Support/MOLC-AI`
const MOLC_AI_RUNTIME_DIR = `${MOLC_AI_HOME}/runtime`
const MOLC_AI_MENU_APP = `${homedir()}/Applications/MOLC-AI Menu.app`
const MOLC_AI_LAUNCH_AGENT = `${homedir()}/Library/LaunchAgents/com.waynetechlab.molc-ai.menubar.plist`
const MOLC_AI_LAUNCH_AGENT_LABEL = 'com.waynetechlab.molc-ai.menubar'
const execFileAsync = promisify(execFile)

const logs = []

function writeLog(level, message, meta = {}) {
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    meta,
  }
  logs.unshift(entry)
  logs.splice(200)
  console.log(`[${entry.time}] ${level.toUpperCase()} ${message}`, meta)
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  })
  res.end(JSON.stringify(body))
}

function sendText(res, status, body) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'text/plain; charset=utf-8',
  })
  res.end(body)
}

function proxyHeaders(extra = {}) {
  return {
    Accept: 'application/json, application/x-ndjson',
    'Content-Type': 'application/json',
    ...extra,
  }
}

function joinUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

function assertModelName(model) {
  if (typeof model !== 'string' || !model.trim()) {
    throw new Error('Model name is required.')
  }

  if (!/^[a-zA-Z0-9._:/@-]+$/.test(model)) {
    throw new Error('Model name contains unsupported characters.')
  }

  return model.trim()
}

function assertSafeName(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required.`)
  }

  if (!/^[a-zA-Z0-9._:/@-]+$/.test(value)) {
    throw new Error(`${label} contains unsupported characters.`)
  }

  return value.trim()
}

async function readJson(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  if (!raw.trim()) return {}
  return JSON.parse(raw)
}

async function ollamaJson(path, init) {
  const response = await fetch(joinUrl(OLLAMA_BASE_URL, path), init)
  const text = await response.text()
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text

  if (!response.ok) {
    throw new Error(
      typeof body === 'string' && body
        ? body
        : `Ollama returned ${response.status} for ${path}`,
    )
  }

  return body
}

async function runCommand(command, args = [], options = {}) {
  const startedAt = Date.now()
  writeLog('info', 'command started', { command, args })
  try {
    const result = await execFileAsync(command, args, {
      timeout: options.timeout ?? 120000,
      maxBuffer: options.maxBuffer ?? 1024 * 1024 * 10,
      env: {
        ...process.env,
        OLLAMA_HOST: OLLAMA_BASE_URL.replace(/^https?:\/\//, ''),
      },
    })
    const body = {
      ok: true,
      command,
      args,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: Date.now() - startedAt,
    }
    writeLog('info', 'command completed', {
      command,
      args,
      durationMs: body.durationMs,
    })
    return body
  } catch (error) {
    const body = {
      ok: false,
      command,
      args,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      error: error.message,
      code: error.code,
      durationMs: Date.now() - startedAt,
    }
    writeLog('error', 'command failed', {
      command,
      args,
      error: body.error,
      code: body.code,
    })
    return body
  }
}

async function findCommand(command) {
  const result = await runCommand('/bin/zsh', ['-lc', `command -v ${command}`], {
    timeout: 10000,
  })
  return {
    name: command,
    installed: result.ok && Boolean(result.stdout.trim()),
    path: result.stdout.trim(),
  }
}

async function getOllamaVersion() {
  const result = await runCommand('ollama', ['--version'], { timeout: 10000 })
  return {
    installed: result.ok,
    version: result.stdout.trim() || result.stderr.trim(),
    path: (await findCommand('ollama')).path,
  }
}

async function probeHttp(url) {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2000),
    })

    return {
      online: response.ok,
      status: response.status,
      error: response.ok ? '' : `HTTP ${response.status}`,
    }
  } catch (error) {
    return {
      online: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Offline',
    }
  }
}

async function getLocalRuntimeStatus() {
  const [webRuntime, launchAgentState] = await Promise.all([
    probeHttp(joinUrl(LOCAL_WEB_BASE_URL, '/health')),
    existsSync(MOLC_AI_LAUNCH_AGENT)
      ? runCommand(
          '/bin/launchctl',
          ['print', `gui/${process.getuid()}/${MOLC_AI_LAUNCH_AGENT_LABEL}`],
          { timeout: 10000 },
        )
      : Promise.resolve({ ok: false }),
  ])

  return {
    installDir: MOLC_AI_HOME,
    runtimeDir: MOLC_AI_RUNTIME_DIR,
    menuAppPath: MOLC_AI_MENU_APP,
    launchAgentPath: MOLC_AI_LAUNCH_AGENT,
    webBaseUrl: LOCAL_WEB_BASE_URL,
    webOnline: webRuntime.online,
    webError: webRuntime.error,
    menuAppInstalled: existsSync(MOLC_AI_MENU_APP),
    runtimeInstalled: existsSync(MOLC_AI_RUNTIME_DIR),
    launchAgentInstalled: existsSync(MOLC_AI_LAUNCH_AGENT),
    launchAgentLoaded: launchAgentState.ok === true,
  }
}

async function getSystemStatus() {
  const [ollama, brew, git, node, firebase, gcloud, swiftc, localRuntime] = await Promise.all([
    getOllamaVersion(),
    findCommand('brew'),
    findCommand('git'),
    findCommand('node'),
    findCommand('firebase'),
    findCommand('gcloud'),
    findCommand('swiftc'),
    getLocalRuntimeStatus(),
  ])

  let ollamaApi = {
    online: false,
    baseUrl: OLLAMA_BASE_URL,
    error: '',
  }
  let modelSummary = {
    installedCount: 0,
    runningCount: 0,
  }

  try {
    const models = await listModels()
    ollamaApi = {
      online: true,
      baseUrl: OLLAMA_BASE_URL,
      error: '',
    }
    modelSummary = {
      installedCount: models.installedModels.length,
      runningCount: models.runningModels.length,
    }
  } catch (error) {
    ollamaApi.error = error instanceof Error ? error.message : 'Ollama API offline'
  }

  return {
    machine: {
      hostname: hostname(),
      platform: platform(),
      release: release(),
      arch: arch(),
      cpuCount: cpus().length,
      totalMemory: totalmem(),
      freeMemory: freemem(),
      homeDir: homedir(),
      nodeVersion: process.version,
    },
    agent: {
      online: true,
      host: HOST,
      port: PORT,
      allowSystemCommands: ALLOW_SYSTEM_COMMANDS,
    },
    requirements: {
      ollama,
      brew,
      git,
      node,
      firebase,
      gcloud,
      swiftc,
    },
    ollamaApi,
    modelSummary,
    localRuntime,
    install: {
      macApp: 'https://ollama.com/download/mac',
      brewInstall: 'brew install ollama',
      brewUpdate: 'brew upgrade ollama',
      startService: 'ollama serve',
      menuBarInstaller: 'npm run install:mac',
      menuBarInstallerLogin: 'npm run install:mac:login',
      firebaseInstall: 'npm install -g firebase-tools',
      gcloudInstall: 'brew install --cask google-cloud-sdk',
      swiftTools: 'xcode-select --install',
    },
  }
}

async function listModels() {
  const [tags, running] = await Promise.all([
    ollamaJson('/api/tags', { headers: proxyHeaders() }),
    ollamaJson('/api/ps', { headers: proxyHeaders() }),
  ])

  return {
    installedModels: tags.models || [],
    runningModels: running.models || [],
  }
}

async function startModel(model) {
  return ollamaJson('/api/generate', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({
      model,
      prompt: '',
      stream: false,
      keep_alive: '30m',
    }),
  })
}

async function stopModel(model) {
  return ollamaJson('/api/generate', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({
      model,
      prompt: '',
      stream: false,
      keep_alive: 0,
    }),
  })
}

async function pullModel(model) {
  return ollamaJson('/api/pull', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({
      name: model,
      stream: false,
    }),
  })
}

async function removeModel(model) {
  return ollamaJson('/api/delete', {
    method: 'DELETE',
    headers: proxyHeaders(),
    body: JSON.stringify({ name: model }),
  })
}

async function copyModel(source, destination) {
  return ollamaJson('/api/copy', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({ source, destination }),
  })
}

async function showModel(model) {
  return ollamaJson('/api/show', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({ model }),
  })
}

async function createModel(name, modelfile) {
  return ollamaJson('/api/create', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({
      name,
      modelfile,
      stream: false,
    }),
  })
}

async function pushModel(model) {
  return ollamaJson('/api/push', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({
      name: model,
      stream: false,
    }),
  })
}

async function embedModel(model, input) {
  return ollamaJson('/api/embed', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({
      model,
      input,
    }),
  })
}

function startOllamaService() {
  if (!ALLOW_SYSTEM_COMMANDS) {
    throw new Error('System commands are disabled for this agent.')
  }

  const child = spawn('ollama', ['serve'], {
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      OLLAMA_HOST: OLLAMA_BASE_URL.replace(/^https?:\/\//, ''),
    },
  })
  child.unref()
  writeLog('info', 'ollama serve spawned', { pid: child.pid })
  return { ok: true, pid: child.pid }
}

async function updateOllama() {
  if (!ALLOW_SYSTEM_COMMANDS) {
    throw new Error('System commands are disabled for this agent.')
  }

  const brew = await findCommand('brew')
  if (brew.installed) {
    return runCommand('brew', ['upgrade', 'ollama'], {
      timeout: 1000 * 60 * 20,
      maxBuffer: 1024 * 1024 * 20,
    })
  }

  return {
    ok: false,
    error:
      'Homebrew was not found. Install/update Ollama manually from https://ollama.com/download/mac.',
  }
}

async function proxyGenerate(req, res) {
  const body = await readJson(req)
  const model = assertModelName(body.model)

  writeLog('info', 'generate requested', { model })
  const response = await fetch(joinUrl(OLLAMA_BASE_URL, '/api/generate'), {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({
      ...body,
      model,
      stream: body.stream !== false,
    }),
  })

  res.writeHead(response.status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': response.headers.get('content-type') || 'application/x-ndjson',
  })

  if (!response.body) {
    res.end()
    return
  }

  for await (const chunk of response.body) {
    res.write(chunk)
  }
  res.end()
}

async function handleAction(action, req, res) {
  const { model: rawModel } = await readJson(req)
  const model = assertModelName(rawModel)
  writeLog('info', `${action} requested`, { model })

  const handlers = {
    start: startModel,
    stop: stopModel,
    pull: pullModel,
    remove: removeModel,
  }
  const result = await handlers[action](model)

  writeLog('info', `${action} completed`, { model })
  sendJson(res, 200, {
    ok: true,
    action,
    model,
    result,
  })
}

async function handleNamedCommand(req, res) {
  const body = await readJson(req)
  const command = String(body.command || '')

  const commands = {
    version: () => runCommand('ollama', ['--version'], { timeout: 10000 }),
    list: () => runCommand('ollama', ['list'], { timeout: 30000 }),
    ps: () => runCommand('ollama', ['ps'], { timeout: 30000 }),
    show: async () => showModel(assertModelName(body.model)),
    start: async () => startModel(assertModelName(body.model)),
    stop: async () => stopModel(assertModelName(body.model)),
    pull: async () => pullModel(assertModelName(body.model)),
    remove: async () => removeModel(assertModelName(body.model)),
    create: async () =>
      createModel(
        assertSafeName(body.model, 'Model name'),
        String(body.modelfile || ''),
      ),
    push: async () => pushModel(assertModelName(body.model)),
    embed: async () =>
      embedModel(
        assertModelName(body.model),
        typeof body.input === 'string' ? body.input : String(body.input || ''),
      ),
    copy: async () =>
      copyModel(
        assertSafeName(body.source, 'Source model'),
        assertSafeName(body.destination, 'Destination model'),
      ),
    status: () => getSystemStatus(),
    startService: () => startOllamaService(),
    updateOllama: () => updateOllama(),
  }

  if (!commands[command]) {
    sendJson(res, 400, {
      ok: false,
      error: `Unsupported command: ${command}`,
      allowed: Object.keys(commands),
    })
    return
  }

  const result = await commands[command]()
  sendJson(res, result?.ok === false ? 500 : 200, {
    ok: result?.ok !== false,
    command,
    result,
  })
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      sendText(res, 204, '')
      return
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`)

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, {
        ok: true,
        service: 'molc-ai-local-agent',
        ollamaBaseUrl: OLLAMA_BASE_URL,
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/system/status') {
      sendJson(res, 200, await getSystemStatus())
      return
    }

    if (req.method === 'GET' && url.pathname === '/models') {
      sendJson(res, 200, await listModels())
      return
    }

    if (req.method === 'GET' && url.pathname === '/logs') {
      sendText(
        res,
        200,
        logs
          .map((entry) => `${entry.time} ${entry.level.toUpperCase()} ${entry.message} ${JSON.stringify(entry.meta)}`)
          .join('\n'),
      )
      return
    }

    if (req.method === 'POST' && url.pathname === '/generate') {
      await proxyGenerate(req, res)
      return
    }

    if (req.method === 'POST' && url.pathname === '/commands') {
      await handleNamedCommand(req, res)
      return
    }

    if (req.method === 'POST' && url.pathname === '/system/start-ollama') {
      sendJson(res, 200, await startOllamaService())
      return
    }

    if (req.method === 'POST' && url.pathname === '/system/update-ollama') {
      const result = await updateOllama()
      sendJson(res, result.ok === false ? 500 : 200, result)
      return
    }

    const actionMatch = url.pathname.match(/^\/models\/(start|stop|pull|remove)$/)
    if (req.method === 'POST' && actionMatch) {
      await handleAction(actionMatch[1], req, res)
      return
    }

    sendJson(res, 404, { ok: false, error: 'Not found' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown agent error'
    writeLog('error', message)
    sendJson(res, 500, { ok: false, error: message })
  }
})

server.listen(PORT, HOST, () => {
  writeLog('info', 'local agent listening', {
    url: `http://${HOST}:${PORT}`,
    ollamaBaseUrl: OLLAMA_BASE_URL,
  })
})
