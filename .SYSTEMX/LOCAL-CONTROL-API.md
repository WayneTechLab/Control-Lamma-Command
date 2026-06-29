# Local Control API Contract

## Purpose

The deployed webapp manages users, login, account levels, and UI state. Local
Ollama control must happen through a same-machine API boundary because browser
code cannot safely execute shell commands.

## Account Levels

| Level | Account | Access |
| --- | --- | --- |
| 0 | Guest / Public | Home page only |
| 1 | User / Member | Free dashboard, local status, chat |
| 2 | User / Pro | Paid user features |
| 3 | User / Diamond | Higher paid limits |
| 4 | Employee / Private | User support, logs, model control |
| 5 | Owner / Private | Super admin, account-level management |

Firebase custom claims should include `accountLevel: 0..5`. The app also
recognizes `plan: "pro"`, `plan: "diamond"`, `admin`, `employee`, `owner`, and
`superAdmin` as compatibility signals.

## Control Modes

- `direct-localhost`: browser calls Ollama directly at `VITE_OLLAMA_API_BASE_URL`.
- `local-agent`: browser calls `VITE_LOCAL_AGENT_BASE_URL`; the agent verifies
  Firebase ID tokens before calling Ollama or the `ollama` CLI.
- `cloud-relay`: browser calls `VITE_CLOUD_CONTROL_BASE_URL`; the local agent
  uses outbound polling/websocket/Firestore command queues to avoid inbound LAN
  exposure.

## Local macOS Runtime

For same-machine install on macOS, MOLC-AI also packages:

- local web runtime: `http://127.0.0.1:4173`
- local agent: `http://127.0.0.1:8787`
- menu bar app: `~/Applications/MOLC-AI Menu.app`
- runtime payload: `~/Library/Application Support/MOLC-AI/runtime`
- optional login item: `~/Library/LaunchAgents/com.waynetechlab.molc-ai.menubar.plist`

Installer commands:

```bash
npm run install:mac
npm run install:mac:login
```

## Request Auth

Every non-public endpoint receives:

```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

The agent verifies the token with Firebase Admin SDK, derives account level, and
rejects commands below the required level.

## Endpoints

| Endpoint | Method | Level | Body | Result |
| --- | --- | --- | --- | --- |
| `/health` | `GET` | 0 | none | agent status |
| `/system/status` | `GET` | 1 | none | local machine + install state |
| `/models` | `GET` | 1 | none | installed + running models |
| `/generate` | `POST` | 1 | `{ model, prompt, options }` | streamed response |
| `/models/start` | `POST` | 4 | `{ model }` | command receipt |
| `/models/stop` | `POST` | 4 | `{ model }` | command receipt |
| `/models/pull` | `POST` | 4 | `{ model }` | progress/receipt |
| `/models/remove` | `POST` | 4 | `{ model }` | command receipt |
| `/logs` | `GET` | 4 | none | recent logs |
| `/commands` | `POST` | 4 | `{ command, model?, source?, destination?, modelfile?, input? }` | allowlisted command output |
| `/system/start-ollama` | `POST` | 4 | none | spawn `ollama serve` |
| `/system/update-ollama` | `POST` | 4 | none | run detected update path |
| `/users/:uid/level` | `POST` | 5 | `{ accountLevel }` | claim update receipt |

## Command Guardrails

- Validate model names with an allowlist pattern before invoking CLI commands.
- Use bounded child-process timeouts and capture exit code/stdout/stderr.
- Never accept raw shell strings from the browser.
- Write command audit records to Firestore `logs/{logId}`.
- Keep Ollama localhost-only unless an operator explicitly enables a secure
  relay/tunnel mode.

Allowlisted command names: `version`, `list`, `ps`, `show`, `start`, `stop`,
`pull`, `remove`, `copy`, `create`, `push`, `embed`, `status`, `startService`,
and `updateOllama`.
