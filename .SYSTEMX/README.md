# .SYSTEMX — Control-Llama-Command operational system

This directory is the **operational control layer** for Control-Llama-Command:
the launcher menu, setup/deploy/quality scripts, git hooks, version tracking,
the full `webapp-stack-g1` guided playbook, and the project-specific master plan.

> The runnable app lives at the **repo root**. `.SYSTEMX/` is the tooling that
> sets it up, deploys it, and keeps it healthy.

Project overlay: [PROJECT-MASTER-PLAN.md](PROJECT-MASTER-PLAN.md).

## Layout

```
.SYSTEMX/
├── WSG-MENU.sh              # ⭐ the control panel — start here
├── scripts/
│   ├── start-production.sh # 🚀 guided one-time setup → live (menu option #1)
│   ├── bootstrap.sh        # install + auth + verify ALL SDKs/CLIs
│   ├── install-command.sh  # add the `WSG-MENU` terminal command to your shell
│   ├── deploy.sh           # full deploy pipeline (smart Firebase targets)
│   ├── deploy-hosting.sh   # hosting only
│   ├── deploy-rules.sh     # Firestore + Storage rules only
│   ├── deploy-functions.sh # Cloud Functions only
│   ├── quality-check.sh    # typecheck + lint + tests
│   ├── version-bump.sh     # semver bump + version files
│   └── firebase-setup.sh   # firebase login + project selection
├── hooks/                  # git hooks (install-hooks.sh, pre-push, post-merge, post-checkout)
├── version/                # app-version.txt, version.json, CHANGELOG.md
├── status/                 # TODO.md, IN_PROGRESS.md, DONE.md (this template's build log)
└── Template/               # the guided playbook (steps 00→12, setup.sh, starter/, lib/)
    └── lib/firebase-config.sh  # paste/seed helpers (config capture + .env seeding)
```

## Start here

```bash
bash .SYSTEMX/WSG-MENU.sh
```

Or make it typeable in any terminal:

```bash
bash .SYSTEMX/scripts/install-command.sh   # then just type: WSG-MENU
```

| Menu | What it does |
| --- | --- |
| 1 · 🚀 Start into Production | Guided one-time wizard: tooling → config → seed env → ingest spec → build → deploy → security |
| 2 · Setup & Tooling | Bootstrap, doctor, capture Firebase config, seed env, guided setup, hooks, install command |
| 3 · Deploy | Full / hosting / rules / functions / preflight / bump+deploy |
| 4 · Quality Checks | TypeScript · ESLint · tests · audit |
| 5 · Version | Bump patch/minor/major · changelog |
| 6 · Firebase | Login · projects · emulator · indexes · setup |
| 7 · Git | Status · pull · commit · push |
| 8 · Dev & App | Install · dev · build · preview |
| 9 · Project Info | Versions · repo · recent commits |

## Tooling the bootstrap guarantees

| Tool | Type | Purpose |
| --- | --- | --- |
| Node.js + npm | runtime | Build/dev + package manager |
| Git | CLI | Version control |
| GitHub CLI (`gh`) | CLI | Repo + secrets automation |
| Google Cloud SDK (`gcloud`) | SDK/CLI | GCP/Firebase platform |
| Firebase CLI (`firebase-tools`) | CLI | Provisioning + deploy |
| Firebase Web SDK (`firebase`) | SDK | App auth/data/storage (in `package.json`) |
| Stripe CLI (`stripe`) | CLI | Payments (optional) |
| Stripe SDK (`@stripe/stripe-js`, `stripe`) | SDK | Payments (optional) |

See [status/](status/TODO.md) for the build log and [version/CHANGELOG.md](version/CHANGELOG.md).
