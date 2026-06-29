# DONE — Control-Llama-Command

Completed work. Newest first.

## 2026-06-11

- ✅ Synced local checkout to `WayneTechLab/Control-Lamma-Command`.
- ✅ Ingested the Control-Llama-Command build spec locally as `PROMPT-INGEST.md`.
- ✅ Added product master plan at `.SYSTEMX/PROJECT-MASTER-PLAN.md`.
- ✅ Converted the starter shell into a dashboard/chat/settings/logs/auth app.
- ✅ Added typed Ollama client, Firebase-aware auth state, runtime settings, and
  sample-data fallback.
- ✅ Updated Firestore rules for `userSettings`, `conversations`, and admin-only
  `logs`.
- ✅ Restored Step 04 environment/secrets guide and added a server secrets
  template.
- ✅ Added six-level account model, public home route, login → dashboard flow,
  admin users shell, and local/cloud control API contract.
- ✅ Added MOLC-AI branding, local machine diagnostics/control page, safe agent
  command runner, chat memory save/export, and browser tools shell.
- ✅ Added macOS local packaging for MOLC-AI: local web runtime, native Swift
  menu bar app, installer command, runtime scripts, and optional start-at-login.

## 2026-06-08

- ✅ **Start Template into Production wizard** — `.SYSTEMX/scripts/start-production.sh`,
  now **menu option #1**. Guided one-time flow: tooling check → identity →
  Firebase/Google config (paste once) → secure `.env` seeding → Prompt Ingest
  `.md` → install/build → deploy → **delete-the-chat security reminder**.
- ✅ **One-time secure env seeding** — `wsg_capture_env_paste` + `wsg_seed_env_files`
  write `.env.local` (client) and `.secrets.env` (server, `chmod 600`), with
  backups; all git-ignored.
- ✅ **Prompt Ingest** — wizard ingests a project build-spec `.md` to
  `PROMPT-INGEST.md` (git-ignored) for the AI agent to build on top of.
- ✅ **`WSG-MENU` terminal command** — `.SYSTEMX/scripts/install-command.sh` adds
  a shell function to `~/.zshrc` / `~/.bashrc` so you can type `WSG-MENU` in any
  terminal (idempotent install/uninstall).
- ✅ **Tooling bootstrap** — `.SYSTEMX/scripts/bootstrap.sh` installs,
  authenticates, and verifies all SDKs + CLIs (Node, Git, gh, gcloud, Firebase,
  optional Stripe) plus app SDKs.
- ✅ **WTL integration** — pulled the generic operational layer out of the WTL
  system into `.SYSTEMX/`: rich submenu `WSG-MENU.sh`, `deploy.sh` (smart Firebase
  targets), focused deploy scripts, `quality-check.sh`, `version-bump.sh`,
  `firebase-setup.sh`, git hooks, and `version/` tracking. Stripped all
  WTL-specific bits (hardcoded project, WTL-AGI, SupportX, admin migration).
- ✅ **WTL folder removed** — `.SYSTEMX/WTL/` deleted after extraction.
- ✅ **WSG-MENU control panel** — one launcher for tooling, Firebase config
  capture (Web/iOS/Android), guided setup, quality, version, Firebase, git, dev.
- ✅ **Firebase project capture** — `Template/lib/firebase-config.sh` lets the
  operator paste per-platform config (Web `firebaseConfig`, iOS
  `GoogleService-Info.plist`, Android `google-services.json`).
- ✅ **Guided playbook** — `Template/` steps 00→12, `setup.sh`, `starter/`.
- ✅ **Docs** — root README, `Template/README.md`, and the GitHub wiki updated.
- ✅ **Git hygiene** — `interview.answers`, `logs/`, `deploy-count.txt`, secrets
  are git-ignored.
