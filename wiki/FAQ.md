# FAQ

## Why does the dashboard show sample models?

The browser could not reach Ollama at `VITE_OLLAMA_API_BASE_URL`. Start Ollama or
adjust the URL in Settings.

## Why are command buttons disabled?

Pull, remove, start, stop, and logs need a same-machine local agent. Set
`VITE_LOCAL_AGENT_BASE_URL` after that agent exists.

## Is the Firebase web API key secret?

No. It is public client config. Security comes from Auth, rules, App Check, and
server-side checks.

## Can this run purely from Firebase Cloud Functions?

Only if Functions can safely reach the machine running Ollama. For local macOS
control, a local agent or Functions emulator is the safer default.

## How do admins work?

Set a Firebase custom claim with `admin: true`. Non-admin signed-in users are
viewers.
