# Testing & QA

## Current Gates

```bash
npm run typecheck
npm run lint
npm run build
```

## Needed Coverage

- Unit tests for Ollama API parsing and stream handling.
- Unit tests for auth/setup-preview behavior.
- Unit tests for settings persistence.
- Playwright smoke tests for dashboard, chat, settings, logs, and login.
- Firestore rules tests for `userSettings`, `conversations`, and `logs`.

## Manual QA

- Run with Ollama down and confirm sample-data fallback.
- Run with Ollama up and confirm live status.
- Attempt chat streaming against a running model.
- Confirm command buttons are disabled without `VITE_LOCAL_AGENT_BASE_URL`.
- Confirm Firebase-configured builds redirect unauthenticated users to `/login`.
