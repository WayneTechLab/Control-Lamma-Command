import type {
  AgentCommand,
  AgentCommandResult,
  GenerationOptions,
  InstalledModel,
  MachineStatus,
  RunningModel,
} from '@/types/ollama'

type TagsResponse = {
  models?: InstalledModel[]
}

type ProcessResponse = {
  models?: RunningModel[]
}

type ControlModelsResponse = {
  installedModels?: InstalledModel[]
  runningModels?: RunningModel[]
  installed?: InstalledModel[]
  running?: RunningModel[]
  models?: InstalledModel[]
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

async function getJson<T>(baseUrl: string, path: string): Promise<T> {
  const response = await fetch(joinUrl(baseUrl, path), {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status} for ${path}`)
  }

  return response.json() as Promise<T>
}

export async function listInstalledModels(baseUrl: string) {
  const data = await getJson<TagsResponse>(baseUrl, '/api/tags')
  return data.models ?? []
}

export async function listRunningModels(baseUrl: string) {
  const data = await getJson<ProcessResponse>(baseUrl, '/api/ps')
  return data.models ?? []
}

export async function listModelsFromControlEndpoint(
  baseUrl: string,
  idToken?: string,
) {
  const response = await fetch(joinUrl(baseUrl, '/models'), {
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Control endpoint returned ${response.status} for /models`)
  }

  const data = (await response.json()) as ControlModelsResponse
  return {
    installedModels: data.installedModels ?? data.installed ?? data.models ?? [],
    runningModels: data.runningModels ?? data.running ?? [],
  }
}

export async function callLocalAgent(
  agentBaseUrl: string,
  action: 'start' | 'stop' | 'pull' | 'remove',
  model: string,
  idToken?: string,
) {
  if (!agentBaseUrl.trim()) {
    throw new Error('Local agent URL is not configured.')
  }

  const response = await fetch(joinUrl(agentBaseUrl, `/models/${action}`), {
    method: 'POST',
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Local agent returned ${response.status}`)
  }

  return response.json().catch(() => ({ ok: true })) as Promise<unknown>
}

export async function getMachineStatus(baseUrl: string, idToken?: string) {
  const response = await fetch(joinUrl(baseUrl, '/system/status'), {
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Control endpoint returned ${response.status} for status.`)
  }

  return response.json() as Promise<MachineStatus>
}

export async function runAgentCommand(
  baseUrl: string,
  command: AgentCommand,
  payload: Record<string, unknown> = {},
  idToken?: string,
) {
  const response = await fetch(joinUrl(baseUrl, '/commands'), {
    method: 'POST',
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ command, ...payload }),
  })

  const data = (await response.json().catch(() => ({
    ok: false,
    error: `Control endpoint returned ${response.status}.`,
  }))) as AgentCommandResult

  if (!response.ok) {
    throw new Error(data.error || `Command ${command} failed.`)
  }

  return data
}

export async function generateWithOllama(
  baseUrl: string,
  model: string,
  prompt: string,
  options: GenerationOptions,
  onToken: (token: string) => void,
) {
  const response = await fetch(joinUrl(baseUrl, '/api/generate'), {
    method: 'POST',
    headers: {
      Accept: 'application/x-ndjson, application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: true,
      options,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status} for generation.`)
  }

  await readGenerateStream(response, onToken)
}

export async function generateWithControlEndpoint(
  baseUrl: string,
  model: string,
  prompt: string,
  options: GenerationOptions,
  onToken: (token: string) => void,
  idToken?: string,
) {
  const response = await fetch(joinUrl(baseUrl, '/generate'), {
    method: 'POST',
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      Accept: 'application/x-ndjson, application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: true,
      options,
    }),
  })

  if (!response.ok) {
    throw new Error(`Control endpoint returned ${response.status} for generation.`)
  }

  await readGenerateStream(response, onToken)
}

async function readGenerateStream(
  response: Response,
  onToken: (token: string) => void,
) {
  if (!response.body) {
    const data = (await response.json()) as { response?: string }
    onToken(data.response ?? '')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let pending = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    pending += decoder.decode(value, { stream: true })
    const lines = pending.split('\n')
    pending = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) continue
      const chunk = JSON.parse(line) as { response?: string; done?: boolean }
      if (chunk.response) onToken(chunk.response)
      if (chunk.done) return
    }
  }

  if (pending.trim()) {
    const chunk = JSON.parse(pending) as { response?: string }
    if (chunk.response) onToken(chunk.response)
  }
}
