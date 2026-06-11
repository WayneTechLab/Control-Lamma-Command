#!/usr/bin/env bash
# =============================================================================
# WebApp Stack G One Point Zero — "Start Template into Production" wizard
# -----------------------------------------------------------------------------
# A single guided flow that takes a fresh clone of this template all the way to
# production, in logical, confirmed stages:
#
#   0. Tooling          verify (and optionally install/auth) all SDKs + CLIs
#   1. Project identity  name / slug captured into the answers file
#   2. Firebase config   paste your Google/Firebase config (Web/iOS/Android)
#                        OR paste a raw .env block — processed ONCE
#   3. Seed env files    write .env.local (client) + .secrets.env (server, 600)
#   4. Prompt Ingest     point at your project build-spec .md (built on top)
#   5. Verify            npm install + production build
#   6. Deploy            firebase login/project select + deploy (optional)
#   7. Security          reminder to DELETE THE AI CHAT (live keys were handled)
#
# Re-runnable and non-destructive: every stage confirms, existing env files are
# backed up before being rewritten.
#
#   bash .SYSTEMX/scripts/start-production.sh
# =============================================================================
set -uo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # .SYSTEMX/scripts
SYSTEMX_DIR="$(cd "$SCRIPTS_DIR/.." && pwd)"                   # .SYSTEMX
ROOT_DIR="$(cd "$SYSTEMX_DIR/.." && pwd)"                      # repo root (the app)
TEMPLATE_DIR="$SYSTEMX_DIR/Template"
ANSWERS="$TEMPLATE_DIR/interview.answers"
LIB="$TEMPLATE_DIR/lib/firebase-config.sh"
INGEST_DEST="$ROOT_DIR/PROMPT-INGEST.md"
cd "$ROOT_DIR"

C_RESET=$'\033[0m'; C_BOLD=$'\033[1m'; C_DIM=$'\033[2m'
C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
C_BLUE=$'\033[34m'; C_CYAN=$'\033[36m'; C_WHITE=$'\033[97m'

step()  { printf '\n%s%s━━ %s ━━%s\n' "$C_BOLD" "$C_CYAN" "$*" "$C_RESET"; }
ok()    { printf '%s  ✓ %s%s\n' "$C_GREEN" "$*" "$C_RESET"; }
warn()  { printf '%s  ! %s%s\n' "$C_YELLOW" "$*" "$C_RESET"; }
err()   { printf '%s  ✗ %s%s\n' "$C_RED" "$*" "$C_RESET" >&2; }
info()  { printf '%s  %s%s\n' "$C_DIM" "$*" "$C_RESET"; }
ask()   { local p="$1" d="${2:-}" r; if [ -n "$d" ]; then read -r -p "  $p [$d]: " r || true; printf '%s' "${r:-$d}"; else read -r -p "  $p: " r || true; printf '%s' "$r"; fi; }
confirm(){ local a; read -r -p "$(printf '%s  %s [y/N]:%s ' "$C_YELLOW" "$1" "$C_RESET")" a || true; [[ "$a" =~ ^[Yy]$ ]]; }
have()  { command -v "$1" >/dev/null 2>&1; }

# Load shared capture/seed helpers.
if [ -f "$LIB" ]; then # shellcheck source=/dev/null
  . "$LIB"
else
  err "Missing $LIB — cannot run the production wizard."; exit 1
fi

# Ensure an answers file exists (seed from template).
[ -f "$ANSWERS" ] || { [ -f "$TEMPLATE_DIR/templates/interview.answers.template" ] \
  && cp "$TEMPLATE_DIR/templates/interview.answers.template" "$ANSWERS"; : > "$ANSWERS"; }

banner() {
  clear 2>/dev/null || true
  printf '\n%s%s  🚀 Start Template into Production%s\n' "$C_BOLD" "$C_WHITE" "$C_RESET"
  printf '%s  WebApp Stack G One Point Zero — guided, one-time, secure setup%s\n' "$C_DIM" "$C_RESET"
  printf '%s  ──────────────────────────────────────────────────────────%s\n' "$C_DIM" "$C_RESET"
  cat <<EOF
  This wizard will, in order:
    0) verify your tooling (Node, gh, gcloud, firebase, …)
    1) capture project identity
    2) capture your Firebase / Google config (paste once)
    3) seed .env.local + .secrets.env securely
    4) ingest your project build-spec (Prompt Ingest .md)
    5) install + build
    6) deploy to Firebase (optional)
    7) security wrap-up (delete the chat — live keys!)
EOF
  printf '%s  ──────────────────────────────────────────────────────────%s\n' "$C_DIM" "$C_RESET"
}

# ── 0 · Tooling ───────────────────────────────────────────────────────────────
stage_tooling() {
  step "0 · Tooling check"
  if [ -f "$SCRIPTS_DIR/bootstrap.sh" ]; then
    bash "$SCRIPTS_DIR/bootstrap.sh" --check || {
      warn "Some tooling is missing or unauthenticated."
      confirm "Run the full bootstrap now (install + auth)?" \
        && bash "$SCRIPTS_DIR/bootstrap.sh" --with-stripe || info "Skipped — re-run later via WSG-MENU."
    }
  else
    warn "bootstrap.sh not found — verifying minimally."
    for c in node npm git firebase; do have "$c" && ok "$c" || warn "$c missing"; done
  fi
}

# ── 1 · Identity ──────────────────────────────────────────────────────────────
stage_identity() {
  step "1 · Project identity"
  local name slug desc
  name="$(ask 'Display name (e.g. Acme Portal)' "$(wsg__get_kv "$ANSWERS" DISPLAY_NAME)")"
  slug="$(ask 'Slug (kebab-case, DNS-safe)' "$(wsg__get_kv "$ANSWERS" SLUG)")"
  desc="$(ask 'One-line description' "$(wsg__get_kv "$ANSWERS" DESCRIPTION)")"
  wsg__upsert_kv "$ANSWERS" DISPLAY_NAME "$name"
  wsg__upsert_kv "$ANSWERS" SLUG "$slug"
  wsg__upsert_kv "$ANSWERS" DESCRIPTION "$desc"
  ok "Identity captured."
}

# ── 2 · Firebase / Google config ──────────────────────────────────────────────
stage_config() {
  step "2 · Firebase / Google config (one-time paste)"
  echo "  How do you want to provide your config?"
  echo "    1) Paste Firebase config per platform (Web firebaseConfig / iOS plist / Android json)"
  echo "    2) Paste a raw .env / KEY=VALUE block"
  echo "    3) Skip (already captured)"
  local mode; mode="$(ask 'Choose 1/2/3' '1')"
  case "$mode" in
    1) wsg_capture_firebase "$ANSWERS";;
    2) wsg_capture_env_paste "$ANSWERS";;
    *) info "Skipped config capture.";;
  esac
  # Optional server secrets for billing/email.
  if confirm "Add server secrets now (Stripe / email — optional)?"; then
    local sk wh
    sk="$(ask 'STRIPE_SECRET_KEY (blank to skip)' "$(wsg__get_kv "$ANSWERS" STRIPE_SECRET_KEY)")"
    wh="$(ask 'STRIPE_WEBHOOK_SECRET (blank to skip)' "$(wsg__get_kv "$ANSWERS" STRIPE_WEBHOOK_SECRET)")"
    [ -n "$sk" ] && wsg__upsert_kv "$ANSWERS" STRIPE_SECRET_KEY "$sk"
    [ -n "$wh" ] && wsg__upsert_kv "$ANSWERS" STRIPE_WEBHOOK_SECRET "$wh"
  fi
}

# ── 3 · Seed env files ────────────────────────────────────────────────────────
stage_seed() {
  step "3 · Seed environment files (secure, one-time)"
  local environment; environment="$(ask 'Runtime environment for .env.local' 'production')"
  if confirm "Write .env.local (+ .secrets.env if secrets present) now?"; then
    wsg_seed_env_files "$ANSWERS" "$ROOT_DIR" "$environment"
    info "These files are git-ignored. .secrets.env is chmod 600."
  else
    info "Skipped env seeding."
  fi
}

# ── 4 · Prompt Ingest ─────────────────────────────────────────────────────────
stage_ingest() {
  step "4 · Prompt Ingest — your project build-spec"
  echo "  Point at the Markdown file describing WHAT to build on top of this"
  echo "  template (features, data model, pages, integrations). It is copied to"
  echo "  $(basename "$INGEST_DEST") at the repo root for your AI agent to use."
  local path; path="$(ask 'Path to your Prompt Ingest .md (blank to skip)' '')"
  if [ -z "$path" ]; then info "Skipped — add PROMPT-INGEST.md later."; return; fi
  if [ -f "$path" ]; then
    cp "$path" "$INGEST_DEST"
    ok "Ingested → $INGEST_DEST ($(wc -l < "$INGEST_DEST" | tr -d ' ') lines)"
    info "Hand this file to your agent: \"build per PROMPT-INGEST.md on this template.\""
  else
    warn "File not found: $path — skipped."
  fi
}

# ── 5 · Verify (install + build) ──────────────────────────────────────────────
stage_verify() {
  step "5 · Verify — install + production build"
  if confirm "Run npm install + build now?"; then
    npm install --no-audit --no-fund || { err "npm install failed"; return 1; }
    npm run -s build || { err "Build failed — fix before deploying."; return 1; }
    ok "Build succeeded."
  else
    info "Skipped install/build."
  fi
}

# ── 6 · Deploy ────────────────────────────────────────────────────────────────
stage_deploy() {
  step "6 · Deploy to Firebase (optional)"
  if ! confirm "Deploy to Firebase now?"; then info "Skipped deploy — run later via WSG-MENU → Deploy."; return; fi
  [ -f "$SCRIPTS_DIR/firebase-setup.sh" ] && bash "$SCRIPTS_DIR/firebase-setup.sh" || warn "firebase-setup.sh missing"
  [ -f "$SCRIPTS_DIR/deploy.sh" ] && bash "$SCRIPTS_DIR/deploy.sh" || warn "deploy.sh missing"
}

# ── 7 · Security wrap-up ──────────────────────────────────────────────────────
stage_security() {
  step "7 · Security wrap-up"
  cat <<EOF

  ${C_BOLD}${C_RED}┌────────────────────────────────────────────────────────────┐${C_RESET}
  ${C_BOLD}${C_RED}│  ⚠  DELETE THIS AI CHAT / SESSION NOW                       │${C_RESET}
  ${C_BOLD}${C_RED}└────────────────────────────────────────────────────────────┘${C_RESET}

  You just handled ${C_BOLD}live keys and secrets${C_RESET} during this setup. To keep them
  safe from any AI transcript or history:

    • ${C_BOLD}Delete the AI chat / conversation${C_RESET} you used to drive this setup.
    • Confirm ${C_BOLD}.env.local${C_RESET} and ${C_BOLD}.secrets.env${C_RESET} are git-ignored (they are by default).
    • Never paste ${C_BOLD}server secrets${C_RESET} (Stripe secret, webhook secret) back into a chat.
    • If a secret may have been exposed, ${C_BOLD}rotate it${C_RESET} in the provider console.
    • Store production secrets in Firebase Functions secrets / GCP Secret Manager.

EOF
  ok "Setup complete. Your template is ready for production."
  info "Re-open the control panel any time: WSG-MENU  (or bash .SYSTEMX/WSG-MENU.sh)"
}

main() {
  banner
  confirm "Begin the production setup?" || { info "Aborted."; exit 0; }
  stage_tooling
  stage_identity
  stage_config
  stage_seed
  stage_ingest
  stage_verify
  stage_deploy
  stage_security
}

main "$@"
