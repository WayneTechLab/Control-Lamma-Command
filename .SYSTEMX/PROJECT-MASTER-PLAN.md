# MOLC-AI — Project Master Plan

## Summary

MOLC-AI, short for **My Ollama Local Cloud AI**, is a secure cloud webapp plus
same-machine local agent for managing Ollama models, chat memory, coding tools,
and Firebase-backed user profiles. It uses the `webapp-stack-g1` baseline for
React, TypeScript, Vite, Firebase Auth, Firestore rules, Hosting, CI, and the
`.SYSTEMX` operational playbook. Stripe is out of scope for the initial build.

## Product Goals

- Show installed models from `GET /api/tags` and running models from
  `GET /api/ps`.
- Provide admin-only controls for model pull, remove, start, and stop through a
  same-machine backend boundary.
- Stream chat responses through `POST /api/generate` with configurable
  temperature and context length.
- Persist user settings, conversations, exports, and profile memory in Firestore.
- Detect local machine state, Ollama install/API state, and required tooling.
- Provide browser-based coding/tool shells backed by selected local models.
- Keep logs and command audit trails admin-only.
- Make LAN exposure an explicit, warned setting rather than a silent default.

## Architecture Decisions

- The browser reads model status from `VITE_OLLAMA_API_BASE_URL`, defaulting to
  `http://localhost:11434`.
- Shell-backed commands must call `VITE_LOCAL_AGENT_BASE_URL`; browser code must
  not spawn or encode shell commands.
- Firebase Auth protects routes once Firebase config is present. Without config,
  the app remains usable in setup-preview mode for UI review.
- Role-based access uses Firebase custom claims and six account levels:
  guest/public `0`, member `1`, pro `2`, diamond `3`, employee/admin `4`, and
  owner/super-admin `5`.
- Firestore collections are `userSettings/{uid}`, `conversations/{id}`, and
  `logs/{id}`.
- Local control follows [LOCAL-CONTROL-API.md](LOCAL-CONTROL-API.md), with
  direct-localhost, local-agent, and cloud-relay modes.

## Execution Plan

1. Ingest and track the build spec.
   - Local copy: `PROMPT-INGEST.md` (git-ignored).
   - Tracked summary: this master plan.
2. Convert the starter app into the Control-Llama shell.
   - Dashboard, chat, settings, logs, auth route, runtime env contract.
   - Direct Ollama read/generate client with sample-data fallback.
3. Add the local command backend.
   - Node 22 service or Firebase Functions emulator running on the macOS host.
   - Endpoints: `/models/start`, `/models/stop`, `/models/pull`,
     `/models/remove`, `/logs`.
   - Verify Firebase ID tokens and admin claims before dangerous actions.
4. Persist product data.
   - Settings to `userSettings/{uid}`.
   - Conversation transcripts to `conversations/{id}` with `ownerUid`.
   - Command output and errors to `logs/{id}`.
5. Harden and deploy.
   - Keep Ollama localhost-only by default.
   - Use Firebase Hosting for the UI.
   - Use local backend or emulator for same-machine Ollama control; do not deploy
     shell-command Functions to cloud unless they target a secured local agent.

## Current Implementation

- Product package metadata and root documentation are updated.
- React routes now cover dashboard, chat, settings, logs, and login.
- Firebase-aware auth provider supports setup preview and account levels 0-5.
- Ollama status and generation clients are typed.
- Firestore rules include settings, conversations, and admin logs.
- Local agent supports model control, command allowlisting, install/update
  status, and runtime diagnostics.
- Local machine UI surfaces tooling detection for Ollama, Firebase CLI, gcloud,
  Swift tools, and the macOS menu bar runtime install state.
- macOS local install now packages a menu bar app, local web runtime, login
  LaunchAgent, and runtime start/stop scripts.
- `.SYSTEMX` keeps the original webapp-stack operational scripts and now links
  this product overlay.

## Next Gates

- Add Firebase Admin SDK endpoint/script to assign `accountLevel` claims and
  enforce local-agent auth for privileged commands.
- Add Firestore persistence for settings and command audit trails.
- Add Vitest tests for services/context and Playwright smoke tests for the main
  routes.
- Configure Firebase project, Auth providers, and custom admin claims.
- Decide whether production control is local-agent-only or cloud-relay backed.
