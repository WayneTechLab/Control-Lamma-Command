# Deployment

## Browser App

```bash
npm run build
firebase deploy --only hosting,firestore:rules,storage:rules
```

Firebase Hosting serves the UI and security headers from `firebase.json`.

## Local Control Backend

Ollama control requires a backend on the same macOS machine as Ollama. The first
production-safe path is a local Node service or Firebase Functions emulator that:

- verifies Firebase ID tokens,
- checks Level 4+ account claims before shell-backed commands,
- runs bounded Ollama commands,
- exposes `/models/start`, `/models/stop`, `/models/pull`, `/models/remove`,
  and `/logs`,
- writes command audit records to Firestore.

Do not deploy shell-command Functions to cloud unless they call back into a
secured local agent.

## Account Claims

Preferred claim shape:

```json
{ "accountLevel": 5 }
```

Compatibility claims such as `admin`, `employee`, `owner`, `superAdmin`,
`plan: "pro"`, and `plan: "diamond"` are recognized by the client, but server
code should normalize them before enforcing access.

## Smoke Checks

- Dashboard loads over HTTPS.
- Firebase sign-in works.
- Firestore rules reject unauthenticated reads.
- Ollama status reads from the expected host.
- Command buttons remain disabled until a local agent URL is configured.
