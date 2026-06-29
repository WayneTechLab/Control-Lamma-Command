# TODO — Control-Llama-Command

Backlog for the product overlay. Check items off or move to
[IN_PROGRESS.md](IN_PROGRESS.md) → [DONE.md](DONE.md).

## Next up

- [ ] Add Firebase Admin SDK endpoint/script to assign `accountLevel` claims
- [ ] Persist settings to `userSettings/{uid}` and chat history to `conversations/{id}`
- [ ] Persist local-agent command audit records to `logs/{id}`
- [ ] Add Vitest coverage for Ollama services and auth/settings context
- [ ] Add Playwright smoke tests for dashboard, chat, settings, and login

## Backlog

- [ ] Configure Firebase project, Auth providers, and admin custom claims
- [ ] Implement cloud-relay command queue for deployed web control
- [ ] Add function/local-agent ID-token verification
- [ ] Add Sentry wiring once monitoring is selected
- [ ] Add preview-channel deploy helper (`firebase hosting:channel:deploy`)

## Future

- [ ] Runtime abstraction for LM Studio and llama.cpp
- [ ] Model import/export and fine-tuning workflow
