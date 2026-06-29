# Setup Playbook

The product follows the `.SYSTEMX/Template` gates with a Control-Llama overlay.

## Order

| Step | Gate |
| --- | --- |
| Prerequisites | Node, Git, Firebase CLI, and Ollama available |
| Project interview | Control-Llama values captured |
| Scaffold | React app builds |
| Firebase provision | Auth/Firestore/Hosting project selected |
| Environment/secrets | `.env.local` and optional `.secrets.env` created |
| Cloud/local backend | Same-machine agent handles Ollama commands |
| Security rules | Firestore rules cover settings, conversations, logs |
| Account levels | Firebase custom claims assign levels 0-5 |
| CI/CD | Lint, typecheck, and build run on PR |
| Testing | Unit and Playwright smoke tests pass |
| Deploy | Firebase Hosting serves the UI |
| Post-launch | Logs, alerts, backups, and secret rotation documented |

## Project-Specific Defaults

- Billing/Stripe: skip.
- Monitoring/Sentry: optional.
- Ollama API: `http://localhost:11434`.
- Local agent: required before enabling model pull/remove/start/stop.
- Account claim: prefer `accountLevel`, fallback compatibility claims supported.
- Production control: prefer local-agent-only unless a secure proxy is designed.
