# WebApp Stack G One Point Zero — Starter

A fast, opinionated **TypeScript + React + Vite + Tailwind + Firebase** starter
template. Use it to spin up a new production-ready web app in minutes.

> This repository is a **GitHub template**. Click **“Use this template”** (or
> `gh repo create <name> --template WayneTechLab/webapp-stack-g1`) to start a new
> project from it.

## What's inside

- ⚛️ **React 19** + **TypeScript** (strict) + **Vite 7**
- 🎨 **Tailwind CSS 4** with light/dark support
- 🧭 **React Router 7** with a shared layout (Navbar + Footer)
- 🔥 **Firebase** client config (Auth, Firestore, Storage) — boots even before
  you add credentials
- 🛡️ Deploy-ready **Firebase Hosting** config with security headers + rules
- ✅ **ESLint** flat config + **GitHub Actions** CI (lint, typecheck, build)
- 📄 Base pages: **Home**, **Features**, **About**, **Contact**, **404**

## Quick start

```bash
# 1. Create your project from this template (UI button or CLI):
gh repo create my-app --template WayneTechLab/webapp-stack-g1 --private --clone
cd my-app

# 2. Install + run
npm install
npm run dev          # http://localhost:5173

# 3. Add Firebase config
cp .env.example .env.local
#   fill VITE_FIREBASE_* from your Firebase project's web app config
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript checks |
| `npm run lint` | ESLint |

## Project structure

```
src/
├── main.tsx                 # entry + RouterProvider
├── router.tsx               # routes
├── index.css                # Tailwind entry
├── config/firebase.ts       # Firebase client init (lazy/guarded)
├── components/layout/        # Layout, Navbar, Footer
└── pages/                    # HomePage, FeaturesPage, AboutPage, ContactPage, NotFoundPage
```

## Deploy to Firebase Hosting

```bash
# one-time:
npm i -g firebase-tools && firebase login
firebase use --add               # select/create your project
# update .firebaserc default to your project id

npm run build
firebase deploy --only hosting,firestore:rules,storage:rules
```

## Next steps

This starter is the runtime of **WebApp Stack G One Point Zero**. For the full
ordered setup playbook (provisioning, Stripe, Cloud Functions, CI/CD secrets,
testing, monitoring), follow the step guides in the parent template's
`WEBAPP-STACK-G1.0.md`.

---

Built to ship fast. Replace this content with your product and go.
