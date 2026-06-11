# WebApp Stack G One Point Zero

> **A reusable, enterprise-grade, vendor-neutral blueprint for spinning up a
> TypeScript + React + Vite + Firebase + Stripe web application — the same way,
> every time.**

[![CI](https://github.com/WayneTechLab/webapp-stack-g1/actions/workflows/ci.yml/badge.svg)](https://github.com/WayneTechLab/webapp-stack-g1/actions)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![React](https://img.shields.io/badge/React-19-149eca)
![Vite](https://img.shields.io/badge/Vite-7-646cff)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

This repository is **two things at once**:

1. **A runnable starter app** — the files at the repo root (`src/`, `package.json`,
   `vite.config.ts`, `firebase.json`, …) are a production-ready React + Firebase
   app that boots out of the box. Click **“Use this template”** to start a new
   project from it.
2. **A full setup playbook** — [`.SYSTEMX/Template/`](.SYSTEMX/Template/) contains
   an ordered, gated, AI-agent-friendly system (`steps/00` → `steps/12`) that
   takes you from a bare machine to a deployed, monitored, billing-enabled
   product.

📖 **Full documentation lives in the [Project Wiki](https://github.com/WayneTechLab/webapp-stack-g1/wiki).**

---

## Use this template

```bash
# Start a new private repo straight from the live template:
gh repo create my-app --template WayneTechLab/webapp-stack-g1 --private --clone
cd my-app
```

…or click the green **“Use this template”** button on GitHub.

## Quick start

```bash
# 1. Install + run — the app boots even before Firebase is configured:
npm install
npm run dev               # → http://localhost:5173

# 2. Add your Firebase web config, then build:
cp .env.example .env.local   # fill VITE_FIREBASE_* from the Firebase console
npm run build

# 3. (optional) Deploy to Firebase Hosting:
firebase use --add           # select/create your project
firebase deploy --only hosting,firestore:rules,storage:rules
```

## One-command tooling setup

Get every SDK + CLI installed, authenticated, and verified in one pass — Node,
Git, GitHub CLI (`gh`), Google Cloud SDK (`gcloud`), Firebase CLI, and optionally
Stripe:

```bash
bash .SYSTEMX/WSG-MENU.sh                          # → 1) 🚀 Start Template into Production
# …or directly:
bash .SYSTEMX/scripts/bootstrap.sh --with-stripe   # install → auth → verify
bash .SYSTEMX/scripts/bootstrap.sh --check         # verify only (no changes)
```

[`WSG-MENU.sh`](.SYSTEMX/WSG-MENU.sh) is the control panel for the whole
lifecycle (tooling, Firebase config capture, guided setup, quality, version,
deploy). See the [operational system](.SYSTEMX/README.md).

### 🚀 Start Template into Production (menu option #1)

The fastest path from a fresh clone to a live app — a single guided, **one-time,
secure** wizard:

```bash
bash .SYSTEMX/WSG-MENU.sh        # → 1) 🚀 Start Template into Production
```

It walks you through, in order:

1. **Tooling** — verify (and optionally install/auth) every SDK + CLI
2. **Identity** — project name / slug
3. **Firebase / Google config** — paste your `firebaseConfig`, a raw `.env`
   block, or point at `GoogleService-Info.plist` / `google-services.json`
   (processed **once**)
4. **Seed env files** — writes `.env.local` (client) + `.secrets.env` (server,
   `chmod 600`) securely
5. **Prompt Ingest** — point at your project build-spec `.md`; it's copied to
   `PROMPT-INGEST.md` for your AI agent to build on top of the template
6. **Verify** — `npm install` + production build
7. **Deploy** — Firebase login/project select + deploy (optional)
8. **Security wrap-up** — reminds you to **delete the AI chat** since live keys
   were handled

### Type `WSG-MENU` anywhere

Install a shell command so you can open the control panel from any terminal:

```bash
bash .SYSTEMX/scripts/install-command.sh   # adds WSG-MENU to your ~/.zshrc / ~/.bashrc
# then, in a new terminal:
WSG-MENU
```

## What's inside

- ⚛️ **React 19** + **TypeScript** (strict) + **Vite 7**
- 🎨 **Tailwind CSS 4** with light/dark support
- 🧭 **React Router 7** with a shared layout (Navbar + Footer)
- 🔥 **Firebase** client config (Auth, Firestore, Storage) — boots even before
  you add credentials
- 🛡️ Deploy-ready **Firebase Hosting** config with security headers + rules
- ✅ **ESLint** flat config + **GitHub Actions** CI (lint · typecheck · build)
- 📄 Base pages: **Home**, **Features**, **About**, **Contact**, **404**
- 🧰 A complete **setup playbook** under `.SYSTEMX/Template/` for the full path
  (provisioning, Stripe, Cloud Functions, CI/CD secrets, testing, monitoring)

## The stack at a glance

| Layer | Default choice |
| --- | --- |
| Language | TypeScript (strict) |
| UI runtime | React 19 |
| Build / dev server | Vite 7 |
| Styling | Tailwind CSS 4 |
| Auth / DB / Storage | Firebase (Auth, Firestore, Storage) |
| Serverless backend | Firebase Cloud Functions (Node 22) — *playbook* |
| Payments | Stripe (optional) — *playbook* |
| Hosting | Firebase Hosting |
| Errors / tracing | Sentry (optional) — *playbook* |
| Lint | ESLint 9 (flat config) |
| CI/CD | GitHub Actions |

> Full version pins and rationale live in
> [`.SYSTEMX/Template/WEBAPP-STACK-G1.0.md`](.SYSTEMX/Template/WEBAPP-STACK-G1.0.md)
> and the [wiki](https://github.com/WayneTechLab/webapp-stack-g1/wiki/Architecture-and-Stack).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript checks |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with autofix |

## Project structure

```
.
├── index.html                # Vite entry HTML
├── package.json              # scripts + dependencies
├── vite.config.ts            # Vite + React + Tailwind + @ alias
├── tsconfig.json             # strict TypeScript config
├── eslint.config.js          # ESLint flat config
├── firebase.json             # Hosting + rules + security headers
├── firestore.rules           # Firestore security rules
├── storage.rules             # Storage security rules
├── .env.example              # VITE_FIREBASE_* client config template
├── src/
│   ├── main.tsx              # entry + RouterProvider
│   ├── router.tsx            # routes
│   ├── index.css             # Tailwind entry
│   ├── config/firebase.ts    # Firebase client init (lazy/guarded)
│   ├── components/layout/     # Layout, Navbar, Footer
│   └── pages/                # Home, Features, About, Contact, 404
└── .SYSTEMX/                  # operational system + setup playbook
    ├── WSG-MENU.sh           # ⭐ control panel (tooling, setup, deploy)
    ├── scripts/              # bootstrap · deploy · quality · version · firebase
    ├── hooks/                # git hooks (version tracking, dep reminders)
    ├── version/              # app-version.txt · version.json · CHANGELOG.md
    ├── status/               # TODO · IN_PROGRESS · DONE
    └── Template/             # the full setup playbook (steps 00 → 12)
        ├── WEBAPP-STACK-G1.0.md  # master playbook
        ├── setup.sh              # interactive orchestrator
        └── steps/                # ordered, gated setup guides
```

## The full setup playbook

The runnable app at the root is **Step 02 (scaffold)** of a larger, ordered
system. When you need the complete path — Firebase provisioning, Stripe, Cloud
Functions, security rules, CI/CD secrets, testing, and monitoring — follow the
playbook:

```bash
cd .SYSTEMX/Template
bash setup.sh               # interactive — walks every step with verification gates
# ...or open WEBAPP-STACK-G1.0.md and work steps/00 → steps/12 in order.
```

| Mode | When to use | Entry point |
| --- | --- | --- |
| ⚡ Fast start | You want a running app now | This repo root → `npm install` → `npm run dev` |
| Guided (agent) | You're driving an AI coding agent | Feed it `.SYSTEMX/Template/WEBAPP-STACK-G1.0.md`, then the `steps/` files |
| Guided (human) | Building by hand | Read the master playbook, work `steps/00` → `steps/12` |
| Scripted | Interactive bootstrap | `bash .SYSTEMX/Template/setup.sh` |

## Documentation

The [**Project Wiki**](https://github.com/WayneTechLab/webapp-stack-g1/wiki) is the
deep-dive home for:

- [Quick Start](https://github.com/WayneTechLab/webapp-stack-g1/wiki/Quick-Start)
- [Architecture & Stack](https://github.com/WayneTechLab/webapp-stack-g1/wiki/Architecture-and-Stack)
- [Project Structure](https://github.com/WayneTechLab/webapp-stack-g1/wiki/Project-Structure)
- [Environment Variables](https://github.com/WayneTechLab/webapp-stack-g1/wiki/Environment-Variables)
- [Security Baseline](https://github.com/WayneTechLab/webapp-stack-g1/wiki/Security)
- [Setup Playbook (Steps 00–12)](https://github.com/WayneTechLab/webapp-stack-g1/wiki/Setup-Playbook)
- [Deployment](https://github.com/WayneTechLab/webapp-stack-g1/wiki/Deployment)
- [Testing & QA](https://github.com/WayneTechLab/webapp-stack-g1/wiki/Testing-and-QA)
- [FAQ](https://github.com/WayneTechLab/webapp-stack-g1/wiki/FAQ)

## Versioning

`G One Point Zero` = **Generation 1.0**. Bump the generation for a breaking
change to the step order or baseline stack (e.g. swapping the build tool); patch
individual step files freely.

---

Built to ship fast. Replace this content with your product and go.
