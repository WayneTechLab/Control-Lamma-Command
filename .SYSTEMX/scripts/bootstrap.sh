#!/usr/bin/env bash
# =============================================================================
# WebApp Stack G One Point Zero — Tooling Bootstrap
# -----------------------------------------------------------------------------
# Installs, authenticates, and verifies every SDK + CLI the template depends on:
#
#   • Node.js + npm        (runtime + package manager)
#   • Git                  (version control)
#   • GitHub CLI (gh)      (repo + secrets automation)
#   • Google Cloud SDK     (gcloud — the GCP/Firebase platform CLI)
#   • Firebase CLI         (firebase-tools — provisioning + deploy)
#   • Stripe CLI           (optional — payments module)
#
# Plus the app-level SDKs:
#   • Firebase Web SDK     (npm: firebase — already in package.json)
#   • Stripe SDK           (optional: @stripe/stripe-js + stripe)
#
# Usage:
#   bash .SYSTEMX/scripts/bootstrap.sh                 # install → auth → verify
#   bash .SYSTEMX/scripts/bootstrap.sh --check         # verify only (no changes)
#   bash .SYSTEMX/scripts/bootstrap.sh --install       # install only
#   bash .SYSTEMX/scripts/bootstrap.sh --auth          # authenticate only
#   bash .SYSTEMX/scripts/bootstrap.sh --with-stripe   # include Stripe CLI/SDK
#   bash .SYSTEMX/scripts/bootstrap.sh --yes           # assume yes (non-interactive)
#   bash .SYSTEMX/scripts/bootstrap.sh --help
#
# Idempotent and safe to re-run: each step checks before acting.
# =============================================================================
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

C_RESET=$'\033[0m'; C_BOLD=$'\033[1m'; C_DIM=$'\033[2m'
C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_CYAN=$'\033[36m'

hdr()  { printf '\n%s%s▸ %s%s\n' "$C_CYAN" "$C_BOLD" "$*" "$C_RESET"; }
ok()   { printf '%s  ✓ %s%s\n' "$C_GREEN" "$*" "$C_RESET"; }
info() { printf '%s  • %s%s\n' "$C_DIM" "$*" "$C_RESET"; }
warn() { printf '%s  ! %s%s\n' "$C_YELLOW" "$*" "$C_RESET"; }
err()  { printf '%s  ✗ %s%s\n' "$C_RED" "$*" "$C_RESET" >&2; }

DO_INSTALL=1; DO_AUTH=1; CHECK_ONLY=0; WITH_STRIPE=0; ASSUME_YES=0; READY=1

print_help() { sed -n '2,33p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }
confirm() { [[ $ASSUME_YES -eq 1 ]] && return 0; local a; read -r -p "  $1 [y/N]: " a || true; [[ "$a" =~ ^[Yy]$ ]]; }
have() { command -v "$1" >/dev/null 2>&1; }
ver()  { "$1" --version 2>/dev/null | head -n1; }
is_macos() { [ "$(uname -s)" = "Darwin" ]; }
is_linux() { [ "$(uname -s)" = "Linux" ]; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check) CHECK_ONLY=1; DO_INSTALL=0; DO_AUTH=0; shift;;
    --install) DO_AUTH=0; shift;;
    --auth) DO_INSTALL=0; shift;;
    --with-stripe) WITH_STRIPE=1; shift;;
    --yes|-y) ASSUME_YES=1; shift;;
    --help|-h) print_help; exit 0;;
    *) warn "Unknown flag: $1"; shift;;
  esac
done

# -----------------------------------------------------------------------------
# Install helpers (per-OS)
# -----------------------------------------------------------------------------
brew_install()      { have brew && brew install "$@" >/dev/null 2>&1; }
brew_cask_install() { have brew && brew install --cask "$@" >/dev/null 2>&1; }

ensure_node() {
  if have node && have npm; then ok "node $(ver node) · npm $(ver npm)"; return; fi
  warn "Node.js/npm not found"
  if is_macos; then brew_install node && ok "installed node" || err "install node manually (https://nodejs.org)"
  else info "Install Node 22 via nvm: https://github.com/nvm-sh/nvm"; READY=0; fi
}

ensure_git() {
  if have git; then ok "git $(ver git)"; return; fi
  warn "git not found"
  if is_macos; then brew_install git && ok "installed git" || err "install git manually"
  elif is_linux; then info "sudo apt-get install -y git  (or your distro's package)"; READY=0
  fi
}

ensure_gh() {
  if have gh; then ok "gh $(ver gh)"; return; fi
  warn "GitHub CLI (gh) not found"
  if is_macos; then brew_install gh && ok "installed gh" || err "install gh manually (https://cli.github.com)"
  else info "Install gh: https://cli.github.com"; READY=0; fi
}

ensure_gcloud() {
  if have gcloud; then ok "gcloud $(gcloud --version 2>/dev/null | head -n1)"; return; fi
  warn "Google Cloud SDK (gcloud) not found"
  if is_macos; then brew_cask_install google-cloud-sdk && ok "installed google-cloud-sdk" \
      || err "install manually (https://cloud.google.com/sdk/docs/install)"
  else info "Install: https://cloud.google.com/sdk/docs/install"; READY=0; fi
}

ensure_firebase() {
  if have firebase; then ok "firebase $(ver firebase)"; return; fi
  warn "Firebase CLI (firebase-tools) not found"
  if have npm; then npm install -g firebase-tools >/dev/null 2>&1 && ok "installed firebase-tools" \
      || err "npm install -g firebase-tools failed (try: sudo npm i -g firebase-tools)"
  else info "Install Node first, then: npm install -g firebase-tools"; READY=0; fi
}

ensure_stripe() {
  [[ $WITH_STRIPE -eq 1 ]] || { info "stripe CLI skipped (pass --with-stripe to include)"; return; }
  if have stripe; then ok "stripe $(ver stripe)"; return; fi
  warn "Stripe CLI not found"
  if is_macos; then brew_install stripe/stripe-cli/stripe && ok "installed stripe" \
      || err "install manually (https://docs.stripe.com/stripe-cli)"
  else info "Install: https://docs.stripe.com/stripe-cli#install"; fi
}

stage_install() {
  hdr "Install — SDKs & CLIs"
  ensure_node
  ensure_git
  ensure_gh
  ensure_gcloud
  ensure_firebase
  ensure_stripe
}

# -----------------------------------------------------------------------------
# App SDKs (npm)
# -----------------------------------------------------------------------------
stage_app_sdks() {
  hdr "App SDKs — npm dependencies"
  if [[ -d node_modules ]]; then ok "root node_modules present"
  elif [[ $CHECK_ONLY -eq 1 ]]; then warn "root deps not installed (run npm install)"
  elif confirm "Run npm install (root)?"; then
    npm install --no-audit --no-fund && ok "root dependencies installed" || { err "npm install failed"; READY=0; }
  fi
  # Firebase Web SDK ships in package.json already.
  node -e "require('firebase/app')" >/dev/null 2>&1 && ok "firebase Web SDK resolvable" || info "firebase SDK loads after npm install"
  # Firebase CLI (firebase-tools) is a project devDependency — local emulators/deploy.
  if [[ -x node_modules/.bin/firebase ]]; then
    ok "firebase-tools (local dev) → $(node_modules/.bin/firebase --version 2>/dev/null | head -1)"
  elif [[ $CHECK_ONLY -eq 1 ]]; then warn "firebase-tools (local) not installed (run npm install)"
  else info "firebase-tools installs with npm install (project devDependency)"; fi
  if [[ $WITH_STRIPE -eq 1 && $CHECK_ONLY -eq 0 ]]; then
    if confirm "Add Stripe SDK (@stripe/stripe-js + stripe)?"; then
      npm install @stripe/stripe-js stripe --save >/dev/null 2>&1 && ok "Stripe SDK installed" || warn "Stripe SDK install skipped/failed"
    fi
  fi
  if [[ -f functions/package.json && $CHECK_ONLY -eq 0 ]]; then
    if [[ ! -d functions/node_modules ]] && confirm "Install Cloud Functions deps?"; then
      npm --prefix functions install --no-audit --no-fund && ok "functions deps installed" || warn "functions install failed"
    fi
  fi
}

# -----------------------------------------------------------------------------
# Authentication
# -----------------------------------------------------------------------------
stage_auth() {
  hdr "Authenticate — sign in to each CLI"

  if have gh; then
    if gh auth status >/dev/null 2>&1; then ok "gh authenticated"
    elif confirm "Sign in to GitHub (gh auth login)?"; then gh auth login || warn "gh login skipped"; fi
  else warn "gh not installed — skipping"; fi

  if have gcloud; then
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q .; then
      ok "gcloud authenticated ($(gcloud config get-value account 2>/dev/null))"
    elif confirm "Sign in to Google Cloud (gcloud auth login)?"; then
      gcloud auth login || warn "gcloud login skipped"
    fi
    if confirm "Set up Application Default Credentials (local dev)?"; then
      gcloud auth application-default login || warn "ADC login skipped"
    fi
  else warn "gcloud not installed — skipping"; fi

  if have firebase; then
    if firebase projects:list >/dev/null 2>&1; then ok "firebase authenticated"
    elif confirm "Sign in to Firebase (firebase login)?"; then firebase login --no-localhost || warn "firebase login skipped"; fi
  else warn "firebase not installed — skipping"; fi

  if [[ $WITH_STRIPE -eq 1 ]] && have stripe; then
    if confirm "Sign in to Stripe (stripe login)?"; then stripe login || warn "stripe login skipped"; fi
  fi
}

# -----------------------------------------------------------------------------
# Verify
# -----------------------------------------------------------------------------
stage_verify() {
  hdr "Verify — versions & auth status"
  local required=(node npm git gh gcloud firebase)
  for c in "${required[@]}"; do
    if have "$c"; then ok "$c → $(ver "$c")"; else err "$c MISSING"; READY=0; fi
  done
  if have stripe; then ok "stripe → $(ver stripe)"; else info "stripe (optional) not installed"; fi
  if [[ -x node_modules/.bin/firebase ]]; then ok "firebase-tools (local dev) → $(node_modules/.bin/firebase --version 2>/dev/null | head -1)"; else info "firebase-tools (local) installs with npm install"; fi

  echo
  if have gh && gh auth status >/dev/null 2>&1; then ok "gh: signed in"; else warn "gh: not signed in"; fi
  if have gcloud && gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q .; then
    ok "gcloud: $(gcloud config get-value account 2>/dev/null)"; else warn "gcloud: not signed in"; fi
  if have firebase && firebase projects:list >/dev/null 2>&1; then ok "firebase: signed in"; else warn "firebase: not signed in"; fi
}

main() {
  local mode="FULL"; [[ $CHECK_ONLY -eq 1 ]] && mode="CHECK"
  printf '%s%sWSG Bootstrap%s %s· tooling SDKs + CLIs · mode: %s%s\n' "$C_BOLD" "$C_CYAN" "$C_RESET" "$C_DIM" "$mode" "$C_RESET"

  [[ $DO_INSTALL -eq 1 ]] && { stage_install; stage_app_sdks; }
  [[ $DO_AUTH -eq 1 ]] && stage_auth
  stage_verify

  echo
  if [[ $READY -eq 1 ]]; then
    ok "Bootstrap complete — the template tooling is ready."
    info "Next: capture Firebase config (WSG-MENU → 1 → 4) or run the guided setup."
  else
    warn "Bootstrap finished with gaps — resolve the ✗ items above and re-run."
    [[ $CHECK_ONLY -eq 1 ]] && exit 1
  fi
}

main "$@"
