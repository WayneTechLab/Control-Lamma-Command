import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const HOST = process.env.MOLC_AI_WEB_HOST || '127.0.0.1'
const PORT = Number(process.env.MOLC_AI_WEB_PORT || 4173)

const scriptDir = dirname(fileURLToPath(import.meta.url))
const distCandidates = [
  process.env.MOLC_AI_WEB_ROOT,
  join(scriptDir, 'dist'),
  join(scriptDir, '../dist'),
].filter(Boolean)

const DIST_DIR = distCandidates.find((candidate) => existsSync(candidate)) || join(scriptDir, '../dist')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function sanitizePath(pathname) {
  const decoded = decodeURIComponent(pathname)
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, '')
  const safePath = normalized.replace(/^[/\\]+/, '')
  return safePath || 'index.html'
}

async function resolveAsset(pathname) {
  const requested = sanitizePath(pathname)
  const candidate = join(DIST_DIR, requested)
  try {
    const details = await stat(candidate)
    if (details.isDirectory()) {
      return join(candidate, 'index.html')
    }
    return candidate
  } catch {
    return join(DIST_DIR, 'index.html')
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`)

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, {
        ok: true,
        service: 'molc-ai-web-runtime',
        root: DIST_DIR,
        url: `http://${HOST}:${PORT}`,
      })
      return
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { ok: false, error: 'Method not allowed' })
      return
    }

    const assetPath = await resolveAsset(url.pathname)
    const body = await readFile(assetPath)
    const ext = extname(assetPath)
    const contentType = contentTypes[ext] || 'application/octet-stream'

    res.writeHead(200, {
      'Cache-Control': assetPath.endsWith('index.html') ? 'no-store' : 'public, max-age=31536000, immutable',
      'Content-Type': contentType,
    })

    if (req.method === 'HEAD') {
      res.end()
      return
    }

    res.end(body)
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown runtime error',
    })
  }
})

server.listen(PORT, HOST, () => {
  console.log(
    JSON.stringify({
      level: 'info',
      service: 'molc-ai-web-runtime',
      host: HOST,
      port: PORT,
      root: DIST_DIR,
    }),
  )
})
