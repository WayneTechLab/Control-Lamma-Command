# Architecture & Stack

## Runtime

- React 19 + TypeScript + Vite 7.
- Tailwind CSS 4 for the dashboard UI.
- Firebase Auth for identity and custom-claim RBAC.
- Firestore for user settings, conversations, and logs.
- Firebase Hosting for the browser app.
- Ollama API for local model status and generation.

## Control Boundary

The browser may read Ollama status and stream generation responses from
`VITE_OLLAMA_API_BASE_URL` when the local host allows it. Shell-backed actions
such as pull, remove, start, and stop go through `VITE_LOCAL_AGENT_BASE_URL`.

That agent must run on the macOS machine that owns Ollama, verify Firebase ID
tokens, require admin claims for dangerous commands, and write command logs.

## Current App Modules

- Dashboard: model inventory, running state, details, and RBAC-aware controls.
- Chat: `POST /api/generate` streaming with temperature/context options.
- Settings: runtime URLs, default model, refresh cadence, LAN warning.
- Logs: local-agent log reader placeholder.
- Auth: Firebase email/password sign-in and setup-preview mode.
- Home/API: public landing page plus deployed/local control architecture.
- Admin users: Level 4+ user-management shell; Level 5 owns account changes.

## Data Model

- `userSettings/{uid}` stores per-user runtime preferences.
- `conversations/{id}` stores chat transcripts with `ownerUid`.
- `logs/{id}` stores admin-only command and runtime logs.

## Account Levels

| Level | Account | Access |
| --- | --- | --- |
| 0 | Guest / Public | Home page only |
| 1 | User / Member | Free dashboard, local status, chat |
| 2 | User / Pro | Paid account features |
| 3 | User / Diamond | Higher paid limits |
| 4 | Employee / Private | User support, logs, local model control |
| 5 | Owner / Private | Super admin and account-level management |
