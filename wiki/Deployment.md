# Deployment

Ship the production build to **Firebase Hosting** (and Functions/rules), apply
security headers, and run a post-deploy smoke test.

> Detailed source:
> [Step 11 — Build & Deploy](https://github.com/WayneTechLab/webapp-stack-g1/blob/main/.SYSTEMX/Template/steps/11-build-deploy.md).

## Fastest path: the control menu

Run the control menu and use the **Deploy** submenu:

```bash
bash .SYSTEMX/WSG-MENU.sh     # → 2) Deploy
```

It drives [`.SYSTEMX/scripts/deploy.sh`](https://github.com/WayneTechLab/webapp-stack-g1/blob/main/.SYSTEMX/scripts/deploy.sh),
a generic pipeline: quality gates → build → version/changelog → commit → push →
Firebase deploy, with **smart targets** (only deploys what your `firebase.json`
defines).

### Operational scripts (`.SYSTEMX/scripts/`)

| Script | Does |
| --- | --- |
| `bootstrap.sh` | Install + authenticate + verify all SDKs/CLIs. Flags: `--check`, `--install`, `--auth`, `--with-stripe`, `--yes` |
| `deploy.sh` | Full pipeline. Flags: `--preflight`, `--fix`, `--bump <patch\|minor\|major>`, `--project <id>`, `--skip-tests`, `--skip-deploy`, `--open` |
| `deploy-hosting.sh` | Build + deploy Hosting only |
| `deploy-rules.sh` | Deploy Firestore + Storage rules only |
| `deploy-functions.sh` | Compile + deploy Cloud Functions (no-op until `functions/` exists) |
| `quality-check.sh` | Run typecheck + lint + tests (missing scripts skipped) |
| `version-bump.sh` | Bump semver + sync `.SYSTEMX/version/` |
| `firebase-setup.sh` | Firebase login + project selection (generic, no hard-coded IDs) |

```bash
# Examples
bash .SYSTEMX/scripts/deploy.sh --preflight      # gates + build, no git/deploy
bash .SYSTEMX/scripts/deploy.sh --bump patch     # bump then full deploy
bash .SYSTEMX/scripts/deploy.sh --project my-id  # override Firebase project
```

## Manual path

## Prerequisites

- Firebase CLI: `npm i -g firebase-tools && firebase login`
- A Firebase project, and `.firebaserc` pointing at it (`firebase use --add`).
- A green build locally (`npm run build`).

## One-time setup

```bash
firebase login
firebase use --add        # select/create your project (writes .firebaserc)
```

> Edit `.firebaserc` so the `default` alias is your real project ID (the starter
> ships a `YOUR_FIREBASE_PROJECT_ID` placeholder).

## Build & deploy

```bash
npm run build

# Preview channel (shareable, auto-expires) — great for PR review:
firebase hosting:channel:deploy preview-$(date +%Y%m%d) --expires 7d

# Full production deploy:
firebase deploy --only hosting,firestore:rules,storage:rules,firestore:indexes
```

With the full playbook (Functions enabled), deploy everything:

```bash
firebase deploy --only hosting,functions,firestore:rules,storage:rules,firestore:indexes
```

## Custom domain

In the Firebase console: **Hosting → Add custom domain → follow DNS steps**.
Verify the HTTPS certificate is provisioned **before** announcing.

## Post-deploy smoke test

```bash
URL="https://<your-project>.web.app"   # or your custom domain

# Headers applied?
curl -sI "$URL" | grep -i strict-transport-security
curl -sI "$URL" | grep -i content-security-policy

# Then manually: load the site, sign in, do one core action,
# and (if billing) run a test-mode checkout.
```

## Security checklist before going live

- [ ] **HSTS + CSP** present on the live response (curl checks above).
- [ ] Deployed **security rules** match the repo (no drift).
- [ ] **App Check** enforcement enabled for production backends.
- [ ] Stripe switched to **live** keys only after a passing test-mode smoke.
- [ ] No `.env*` / secret files bundled into `dist/`.

See **[Security](Security)** for the full baseline.

## CI-driven deploys (recommended)

Prefer deploying from CI (GitHub Actions) so every release is reproducible and
gated by lint/typecheck/test. The starter ships a CI workflow
(`.github/workflows/ci.yml`) that runs **lint · typecheck · build**; extend it
with a deploy job using a Firebase service-account secret. See
[Step 09 — CI/CD](Setup-Playbook).

## Hosting config reference

`firebase.json` controls hosting:

- `public: "dist"` — the Vite build output.
- `rewrites: [{ "source": "**", "destination": "/index.html" }]` — SPA routing.
- `headers` — the hardened security header set (see **[Security](Security)**).
- `assets/**` gets long-lived immutable caching.
