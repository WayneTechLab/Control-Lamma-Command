# Quick Start

## Run MOLC-AI

```bash
npm install
npm run dev
npm run agent
```

Open the Vite URL printed by the dev server.

## Start Ollama

```bash
ollama serve
ollama pull llama3.2
```

The app reads status from `http://localhost:11434` by default. If the browser
cannot reach Ollama, the dashboard shows sample data while the UI remains usable.

## Configure Firebase

```bash
cp .env.example .env.local
```

Fill `VITE_FIREBASE_*` values from Firebase Project Settings. Once configured,
protected routes require Firebase Auth.

The public route is `/`; successful login lands on `/dashboard`.

## Optional local agent

Set `VITE_LOCAL_AGENT_BASE_URL` when a same-machine Node/Firebase-emulator agent
exists for pull/remove/start/stop/log operations. The default local agent URL is
`http://127.0.0.1:8787`.

The local machine page uses:

```bash
curl http://127.0.0.1:8787/system/status
```

For deployed web control, use `VITE_CONTROL_PLANE_MODE=local-agent` or
`VITE_CONTROL_PLANE_MODE=cloud-relay`.

## Verify

```bash
npm run typecheck
npm run lint
npm run build
```
