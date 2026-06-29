# MOLC-AI

**My Ollama Local Cloud AI** — a secure web command center for local Ollama
models on macOS, built on the WayneTechLab `webapp-stack-g1` React + TypeScript
+ Vite + Firebase foundation.

The app includes a public home page, Firebase-aware login, account levels, local
machine diagnostics, model control, chat streaming, profile memory save/export,
runtime settings, logs, and browser-based tool shells.

## Quick Start

```bash
npm install
npm run dev
npm run agent
```

Mac menu bar install:

```bash
npm run install:mac
npm run install:mac:login
```

The app defaults to `http://localhost:11434` for Ollama. If Ollama is not
reachable from the browser, the dashboard falls back to sample data so the UI
can still be reviewed. Model actions use the local agent at
`http://127.0.0.1:8787`.

The local installer also packages a self-contained browser runtime at
`http://127.0.0.1:4173`, a native menu bar controller in
`~/Applications/MOLC-AI Menu.app`, and an optional login item.

Copy Firebase config when ready:

```bash
cp .env.example .env.local
```

Fill the `VITE_FIREBASE_*` values from Firebase Project Settings. Without those
values, the app runs in setup-preview mode; with them, protected routes require
Firebase Auth.

## Runtime Contract

| Variable | Purpose |
| --- | --- |
| `VITE_CONTROL_PLANE_MODE` | `direct-localhost`, `local-agent`, or `cloud-relay` |
| `VITE_OLLAMA_API_BASE_URL` | Ollama API URL, default `http://localhost:11434` |
| `VITE_LOCAL_AGENT_BASE_URL` | Local Node agent for shell-backed commands such as pull/remove/start/stop |
| `VITE_CLOUD_CONTROL_BASE_URL` | Cloud relay / Functions endpoint for deployed web control |
| `VITE_DEFAULT_MODEL` | Preferred model for chat selection |
| `VITE_FUNCTIONS_BASE_URL` | Future Firebase Functions or proxy endpoint |

The browser can read Ollama status and generate responses only when CORS/network
settings allow it. Dangerous shell commands belong behind the local agent or a
same-machine Functions emulator, never directly in browser code.

## Product Surface

- `/` public home: account levels and deployed/local control overview.
- `/login`: Firebase email/password sign-in and registration.
- `/dashboard`: installed models, running models, refresh state, account-aware
  controls, and model details.
- `/chat`: model selection, streaming chat, save-to-profile memory, and exports.
- `/local-machine`: host detection, Ollama/tooling status, install/update info,
  and allowlisted command runner.
- `/tools`: coding and browser-tool workspace shell.
- `/settings`: Ollama URL, local agent URL, generation defaults, and LAN warning.
- `/logs`: local-agent log viewer placeholder with fallback operational notes.
- `/api-control`: control-plane modes and endpoint contract.
- `/admin/users`: Level 4+ user-management shell.

## Security Model

- Firebase Auth protects dashboard routes once Firebase config is present.
- Account access is derived from Firebase custom claims: `accountLevel: 0..5`,
  `plan`, `admin`, `employee`, `owner`, or `superAdmin`.
- Firestore rules cover `userSettings`, `conversations`, and admin-only `logs`.
- Model pull/remove/start/stop and local diagnostics are routed to
  `VITE_LOCAL_AGENT_BASE_URL` so the client never executes arbitrary shell
  commands.
- Exposing Ollama beyond localhost should require authenticated HTTPS, strong
  host controls, and an explicit operator decision.

## `.SYSTEMX`

`.SYSTEMX/` remains the operational layer from `webapp-stack-g1`: setup,
quality, deploy, versioning, hooks, and the ordered playbook. The project overlay
is tracked in [`.SYSTEMX/PROJECT-MASTER-PLAN.md`](.SYSTEMX/PROJECT-MASTER-PLAN.md)
and the local-agent API contract is tracked in
[`.SYSTEMX/LOCAL-CONTROL-API.md`](.SYSTEMX/LOCAL-CONTROL-API.md).

Useful commands:

```bash
bash .SYSTEMX/WSG-MENU.sh
npm run typecheck
npm run lint
npm run build
npm run install:mac
npm run install:mac:login
```

Agent commands:

```bash
npm run agent
curl http://127.0.0.1:8787/system/status
curl http://127.0.0.1:8787/models
```

Local runtime commands after install:

```bash
bash "$HOME/Library/Application Support/MOLC-AI/runtime/scripts/status-runtime.sh"
bash "$HOME/Library/Application Support/MOLC-AI/runtime/scripts/start-runtime.sh"
bash "$HOME/Library/Application Support/MOLC-AI/runtime/scripts/stop-runtime.sh"
```

## Build Spec

The prompt-ingest source is copied locally to `PROMPT-INGEST.md` for the setup
workflow. It is intentionally git-ignored because future specs may contain
private operational details.
