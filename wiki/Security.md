# Security

## Baseline

- Firebase Auth protects routes once Firebase config is present.
- Account access uses Firebase custom claims. Preferred: `accountLevel: 0..5`.
  Compatibility claims: `plan`, `admin`, `employee`, `owner`, `superAdmin`.
- Firestore rules deny by default and explicitly allow user-owned settings and
  conversations.
- Logs and model control are Level 4+.
- Account-level changes are Level 5.
- Model control commands are never executed in browser code.

## Ollama Host Safety

Keep Ollama bound to localhost by default. If the operator exposes Ollama on a
LAN host, require authenticated HTTPS or a tunnel, verify identities at the local
agent, and log every command.

## Command Safety

The local agent must:

- Accept only known actions: start, stop, pull, remove, logs.
- Verify Firebase bearer tokens and require Level 4+ for model commands.
- Validate model names against a strict allowlist pattern.
- Verify Firebase ID tokens and admin claims for dangerous actions.
- Run commands with bounded timeouts and controlled environment variables.
- Write stdout/stderr and exit status to admin-only logs.

## Secrets

Never commit server secrets, service account JSON, API tokens, or local machine
credentials. Use `.secrets.env`, Firebase Functions secrets, GitHub Actions
secrets, or GCP Secret Manager.
