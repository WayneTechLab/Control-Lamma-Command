# Step 04 — Environment and Secrets

## Goal

Create the local environment files required to run the app without committing
real credentials or host secrets.

## Preconditions

- Step 01 interview answers are complete.
- Step 03 Firebase web config values are available.
- `.env.example` or `Template/templates/env.template` exists.

## Commands

```bash
cp .env.example .env.local
```

Fill the public client values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_CONTROL_PLANE_MODE=local-agent
VITE_OLLAMA_API_BASE_URL=http://localhost:11434
VITE_LOCAL_AGENT_BASE_URL=http://127.0.0.1:8787
VITE_CLOUD_CONTROL_BASE_URL=
VITE_DEFAULT_MODEL=
VITE_ENVIRONMENT=development
```

If server secrets are needed, create `.secrets.env` locally and keep it
git-ignored:

```bash
touch .secrets.env
chmod 600 .secrets.env
```

## Security Notes

- Firebase web config is public by design; Security Rules and App Check protect
  data access.
- Server secrets, API tokens, service-account JSON, and local machine credentials
  never go in `.env.local`, Firestore, or Git.
- Ollama should stay on localhost unless the operator intentionally enables a
  secured LAN/tunnel workflow.

## Verification Gate

```bash
npm run typecheck
npm run build
```
