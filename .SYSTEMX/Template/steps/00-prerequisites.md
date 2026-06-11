# Step 00 — Prerequisites

> Install and verify every CLI and runtime the rest of the build depends on.
> Nothing downstream works until all required tools report a version.

## 🎯 Goal
A workstation where Node, Git, GitHub CLI, Google Cloud CLI, and Firebase CLI are
installed, on `PATH`, and authenticated. Stripe CLI and Chrome MCP are optional
and installed only if their modules were selected.

## ✅ Preconditions
- A supported OS (macOS, Linux, or WSL2 on Windows).
- A package manager available (`brew` on macOS, `apt`/`dnf` on Linux).
- Admin/sudo rights to install global tooling.

## ❓ Operator prompts
1. Will this project use **Stripe** (payments)?  → install Stripe CLI if yes.
2. Will this project use **Chrome MCP** automation? → handled in Step 08.
3. Preferred Node version manager: **nvm** (recommended) or system installer?

## ⚡ Fastest path — one-shot bootstrap

The control menu can install, authenticate, and verify **all** tooling in one
pass (Node, Git, GitHub CLI, Google Cloud SDK, Firebase CLI, and optionally the
Stripe CLI/SDK):

```bash
bash .SYSTEMX/WSG-MENU.sh        # → 1) Setup & Tooling → 1) Full bootstrap
# or run it directly:
bash .SYSTEMX/scripts/bootstrap.sh --with-stripe      # install → auth → verify
bash .SYSTEMX/scripts/bootstrap.sh --check            # verify only (no changes)
```

`bootstrap.sh` is idempotent — re-run it any time. On macOS it installs via
Homebrew + npm; on Linux/WSL it prints the exact install commands. The manual
steps below are the same work done by hand.

## ⌨️ Commands

### Node.js + npm (via nvm, recommended)
```bash
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# restart shell, then:
nvm install 22
nvm use 22
nvm alias default 22
node -v && npm -v
```

### Git + GitHub CLI
```bash
# macOS
brew install git gh
# Debian/Ubuntu
# sudo apt-get update && sudo apt-get install -y git
# (gh: see https://github.com/cli/cli/blob/trunk/docs/install_linux.md)

git --version
gh --version
gh auth login          # authenticate to GitHub
```

### Google Cloud CLI (`gcloud`)
```bash
# macOS
brew install --cask google-cloud-sdk
# or the cross-platform installer:
# curl https://sdk.cloud.google.com | bash && exec -l $SHELL

gcloud --version
gcloud auth login
gcloud auth application-default login   # ADC for local admin SDK use
```

### Firebase CLI (`firebase-tools`)
```bash
npm install -g firebase-tools
firebase --version
firebase login --no-localhost
firebase projects:list      # confirms auth works
```

### Stripe CLI (optional — only if billing selected)
```bash
# macOS
brew install stripe/stripe-cli/stripe
# Linux: see https://docs.stripe.com/stripe-cli#install
stripe --version
stripe login                # authorizes the CLI to your Stripe account
```

### Google Chrome (for MCP automation + Playwright)
```bash
# macOS
brew install --cask google-chrome
# Playwright browsers are installed in Step 10:  npx playwright install
```

## 📄 Generated files
None. This step only installs tooling.

## 🔒 Security notes
- Use `gcloud auth application-default login` for **local development only**;
  in CI use a dedicated service account or Workload Identity Federation.
- Never paste long-lived service-account JSON into a terminal that logs history.
- Keep CLIs current — old `firebase-tools` can ship known-vulnerable deps.

## 🚦 Verification gate
All of these must print a version without error (Stripe only if billing):
```bash
node -v && npm -v && git --version && gh --version \
  && gcloud --version && firebase --version
# optional:
stripe --version

# …or let the bootstrap verify install + auth in one command:
bash .SYSTEMX/scripts/bootstrap.sh --check
```
✅ Pass → proceed to [Step 01 — Project Interview](./01-project-interview.md).
