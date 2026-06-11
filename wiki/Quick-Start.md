# Quick Start

Get a running app in minutes. The starter boots **even before** Firebase is
configured, so you can see it work immediately.

## Prerequisites

- **Node.js** ≥ 20 (22 recommended) + npm
- **Git**
- *(optional, for deploy)* [Firebase CLI](https://firebase.google.com/docs/cli):
  `npm i -g firebase-tools`
- *(optional)* [GitHub CLI](https://cli.github.com/) `gh`

See **[Setup Playbook → Step 00](Setup-Playbook)** for the full prerequisite list
(gcloud, Stripe CLI, etc.).

## One-command tooling bootstrap

Instead of installing each tool by hand, let the bootstrap install, authenticate,
and verify everything (Node, Git, `gh`, `gcloud`, Firebase CLI, optional Stripe):

```bash
bash .SYSTEMX/WSG-MENU.sh                          # → 1) 🚀 Start Template into Production
# …or directly:
bash .SYSTEMX/scripts/bootstrap.sh --with-stripe   # install → auth → verify
bash .SYSTEMX/scripts/bootstrap.sh --check         # verify only (no changes)
```

It's idempotent — safe to re-run any time. On macOS it installs via Homebrew +
npm; on Linux/WSL it prints the exact install commands.

## 🚀 Start Template into Production (recommended)

The fastest path from a fresh clone to a live app is **menu option #1** — a
single guided, **one-time, secure** wizard:

```bash
bash .SYSTEMX/WSG-MENU.sh        # → 1) 🚀 Start Template into Production
```

Stages, in order:

1. **Tooling** — verify (and optionally install/auth) every SDK + CLI
2. **Identity** — project name / slug
3. **Firebase / Google config** — paste your `firebaseConfig`, a raw `.env`
   block, or point at `GoogleService-Info.plist` / `google-services.json`
   (processed **once**)
4. **Seed env files** — writes `.env.local` (client) + `.secrets.env`
   (server, `chmod 600`) securely
5. **Prompt Ingest** — point at your project build-spec `.md`; it's copied to
   `PROMPT-INGEST.md` for your AI agent to build on top of the template
6. **Verify** — `npm install` + production build
7. **Deploy** — Firebase login/project select + deploy (optional)
8. **Security wrap-up** — reminds you to **delete the AI chat** (live keys handled)

### Make `WSG-MENU` typeable

```bash
bash .SYSTEMX/scripts/install-command.sh   # adds WSG-MENU to ~/.zshrc / ~/.bashrc
# then, in a new terminal:
WSG-MENU
```

## Option A — Use this template (recommended)

```bash
gh repo create my-app --template WayneTechLab/webapp-stack-g1 --private --clone
cd my-app
npm install
npm run dev          # → http://localhost:5173
```

…or click the green **“Use this template”** button on the
[repo page](https://github.com/WayneTechLab/webapp-stack-g1).

## Option B — Clone and run

```bash
git clone https://github.com/WayneTechLab/webapp-stack-g1.git my-app
cd my-app
npm install
npm run dev          # → http://localhost:5173
```

## Add your Firebase config

The app runs without Firebase, but Auth/Firestore/Storage stay dormant until you
add credentials:

```bash
cp .env.example .env.local
# Fill VITE_FIREBASE_* from:
#   Firebase console → Project settings → General → Your apps → SDK setup & config
```

See **[Environment Variables](Environment-Variables)** for the full contract.

## Build & preview

```bash
npm run build        # production build → dist/
npm run preview      # serve the production build locally
```

## Deploy (optional)

```bash
firebase use --add   # select/create your Firebase project
firebase deploy --only hosting,firestore:rules,storage:rules
```

Full details in **[Deployment](Deployment)**.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript checks (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with autofix |
| `npm run ci:lint` | ESLint with `--max-warnings=0` (CI gate) |
| `npm run ci:build` | Production build (CI gate) |

## Next steps

- Want the **full guided build** (Stripe, Functions, CI, monitoring)? Go to the
  **[Setup Playbook](Setup-Playbook)**.
- Curious about the tech choices? See **[Architecture & Stack](Architecture-and-Stack)**.
