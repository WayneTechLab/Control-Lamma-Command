# Project Structure

```text
.
├── src/
│   ├── components/        # layout, auth guard, model cards, chat/log surfaces
│   ├── context/           # Firebase auth and runtime settings providers
│   ├── data/              # sample Ollama data for offline UI review
│   ├── hooks/             # Ollama polling/status hook
│   ├── lib/               # formatting helpers
│   ├── pages/             # dashboard, chat, settings, logs, auth, 404
│   ├── services/          # Ollama/local-agent API client
│   └── types/             # shared model/settings/chat types
├── firestore.rules        # Auth, settings, conversations, logs rules
├── firebase.json          # Hosting, rules, emulators, security headers
├── .env.example           # Public client env contract
├── .SYSTEMX/              # operational scripts, playbook, project master plan
└── wiki/                  # GitHub wiki source
```

The reusable upstream starter remains under `.SYSTEMX/Template/starter/` so the
original generation-one playbook can still be referenced.
