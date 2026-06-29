# Environment Variables

Client variables are public because Vite embeds `VITE_*` values into the browser
bundle. Do not place server secrets in these values.

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase | Public Firebase web config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase | Project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase | Sender/project number |
| `VITE_FIREBASE_APP_ID` | Firebase | Web app id |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional | Analytics id |
| `VITE_CONTROL_PLANE_MODE` | Yes | `direct-localhost`, `local-agent`, or `cloud-relay` |
| `VITE_OLLAMA_API_BASE_URL` | Yes | Defaults to `http://localhost:11434` |
| `VITE_LOCAL_AGENT_BASE_URL` | Optional | Same-machine agent for shell-backed controls |
| `VITE_CLOUD_CONTROL_BASE_URL` | Optional | Cloud relay / Functions endpoint for deployed web control |
| `VITE_DEFAULT_MODEL` | Optional | Preferred chat model |
| `VITE_FUNCTIONS_BASE_URL` | Optional | Future Functions/proxy base URL |
| `VITE_SENTRY_DSN` | Optional | Error monitoring |
| `VITE_ENVIRONMENT` | Yes | `development`, `staging`, or `production` |

Server-only values belong in `.secrets.env`, Firebase Functions secrets, GitHub
Actions secrets, or GCP Secret Manager.

Suggested local secret placeholders:

```bash
ADMIN_BOOTSTRAP_TOKEN=
LOCAL_AGENT_SHARED_SECRET=
SENTRY_AUTH_TOKEN=
```
