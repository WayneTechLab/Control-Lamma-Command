#!/usr/bin/env bash
# =============================================================================
# WSG-MENU — WebApp Stack G One Point Zero control panel
# -----------------------------------------------------------------------------
# One entry point to initialize the template and run the whole lifecycle:
# check/install/auth tooling, capture Firebase project info, run the guided
# setup, quality gates, version bumps, and Firebase deploys.
#
#   bash .SYSTEMX/WSG-MENU.sh
#
# Non-destructive by default: builds/deploys/commits are explicit choices and
# confirmed. Re-runnable any time.
# =============================================================================
set -uo pipefail

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # → .SYSTEMX
REPO_ROOT="$(cd "$SELF_DIR/.." && pwd)"                     # → repo root (the app)
SCRIPTS_DIR="$SELF_DIR/scripts"
HOOKS_DIR="$SELF_DIR/hooks"
VERSION_DIR="$SELF_DIR/version"
TEMPLATE_DIR="$SELF_DIR/Template"
ANSWERS="$TEMPLATE_DIR/interview.answers"
LIB="$TEMPLATE_DIR/lib/firebase-config.sh"
cd "$REPO_ROOT"

C_RESET=$'\033[0m'; C_BOLD=$'\033[1m'; C_DIM=$'\033[2m'
C_RED=$'\033[31m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'
C_BLUE=$'\033[34m'; C_MAGENTA=$'\033[35m'; C_CYAN=$'\033[36m'; C_WHITE=$'\033[97m'

clear_screen() { clear 2>/dev/null || printf '\033c'; }
divider() { printf '%s  ────────────────────────────────────────────────────────%s\n' "$C_DIM" "$C_RESET"; }
section() { printf '%s%s  %s%s\n' "$C_CYAN" "$C_BOLD" "$*" "$C_RESET"; }
ok()   { printf '%s  ✓ %s%s\n' "$C_GREEN" "$*" "$C_RESET"; }
warn() { printf '%s  ! %s%s\n' "$C_YELLOW" "$*" "$C_RESET"; }
err()  { printf '%s  ✗ %s%s\n' "$C_RED" "$*" "$C_RESET"; }
info() { printf '%s  %s%s\n' "$C_DIM" "$*" "$C_RESET"; }
pause(){ read -r -p "$(printf '%s  Press Enter to continue…%s' "$C_DIM" "$C_RESET")" _ || true; }

confirm() { local m="${1:-Are you sure?}" a; read -r -p "$(printf '%s  %s [y/N]:%s ' "$C_YELLOW" "$m" "$C_RESET")" a || true; [[ "$a" =~ ^[Yy]$ ]]; }

have() { command -v "$1" >/dev/null 2>&1; }
ver()  { "$1" --version 2>/dev/null | head -n1; }

# Source the Firebase capture library (provides wsg_capture_firebase).
[ -f "$LIB" ] && . "$LIB" || true

run_script() { # run_script <path> [args…]
  local s="$1"; shift || true
  [[ -f "$s" ]] || { err "Script not found: $s"; pause; return 1; }
  echo; printf '%s%s  ▶ %s %s%s\n' "$C_CYAN" "$C_BOLD" "$(basename "$s")" "$*" "$C_RESET"; divider
  bash "$s" "$@" || true
  divider; pause
}

version_str() { [[ -f "$VERSION_DIR/app-version.txt" ]] && cat "$VERSION_DIR/app-version.txt" || node -e 'process.stdout.write(require("./package.json").version)' 2>/dev/null || echo "?"; }
git_branch()  { git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A"; }
git_dirty()   { local n; n=$(git status --short 2>/dev/null | wc -l | tr -d ' '); [[ "$n" -eq 0 ]] && printf '%sclean%s' "$C_GREEN" "$C_RESET" || printf '%s%s change(s)%s' "$C_YELLOW" "$n" "$C_RESET"; }

print_header() {
  clear_screen
  echo
  printf '  %s%s WebApp Stack G One Point Zero %s %s· WSG-MENU%s\n' "$C_BOLD" "$C_CYAN" "$C_RESET" "$C_DIM" "$C_RESET"
  printf '  %sv%s%s  %s|%s  branch: %s%s%s  %s|%s  repo: %s\n' \
    "$C_CYAN" "$(version_str)" "$C_RESET" "$C_DIM" "$C_RESET" \
    "$C_MAGENTA" "$(git_branch)" "$C_RESET" "$C_DIM" "$C_RESET" "$(git_dirty)"
  divider
}

# ── 1 · Setup & tooling ───────────────────────────────────────────────────────
capture_firebase() {
  section "Capture Firebase project info (Web / iOS / Android)"; echo
  declare -F wsg_capture_firebase >/dev/null 2>&1 || { err "Capture lib not loaded ($LIB)"; pause; return; }
  [[ -f "$ANSWERS" ]] || { [[ -f "$TEMPLATE_DIR/templates/interview.answers.template" ]] && cp "$TEMPLATE_DIR/templates/interview.answers.template" "$ANSWERS" && info "Seeded $ANSWERS"; }
  wsg_capture_firebase "$ANSWERS"
  pause
}

seed_env() {
  section "Seed .env files from captured config"; echo
  declare -F wsg_seed_env_files >/dev/null 2>&1 || { err "Seed lib not loaded ($LIB)"; pause; return; }
  [[ -f "$ANSWERS" ]] || { err "No captured config yet — run 'Capture Firebase project info' first."; pause; return; }
  local environment; read -r -p "  Runtime environment [production]: " environment || true
  wsg_seed_env_files "$ANSWERS" "$REPO_ROOT" "${environment:-production}"
  info "Files are git-ignored. .secrets.env is chmod 600."
  pause
}

menu_setup() {
  while true; do
    print_header; section "2 › SETUP & TOOLING"; echo
    printf '  1) 🚀 Start Template into Production  %s(the full guided wizard)%s\n' "$C_DIM" "$C_RESET"
    printf '  2) Full bootstrap          %s(install + auth + verify all SDKs/CLIs)%s\n' "$C_DIM" "$C_RESET"
    echo "  3) Doctor — check prerequisites (versions + auth)"
    echo "  4) Install / update tooling (node, gh, gcloud, firebase, stripe)"
    echo "  5) Authenticate tooling (gh, gcloud, firebase, stripe)"
    echo "  6) Capture Firebase project info (Web / iOS / Android)  ← paste config"
    echo "  7) Seed .env files from captured config"
    echo "  8) Run guided setup (steps 00 → 12)"
    echo "  9) Firebase setup (login + select project)"
    echo " 10) Install git hooks (pre-push / post-merge / post-checkout)"
    echo " 11) Install the 'WSG-MENU' terminal command"
    echo; echo "  0) Back"; echo
    read -r -p "$(printf '  %sChoice:%s ' "$C_CYAN" "$C_RESET")" c || break
    case "$c" in
      1) [[ -f "$SCRIPTS_DIR/start-production.sh" ]] && bash "$SCRIPTS_DIR/start-production.sh" || err "start-production.sh missing"; pause;;
      2) confirm "Run full tooling bootstrap (include Stripe)?" \
           && run_script "$SCRIPTS_DIR/bootstrap.sh" --with-stripe \
           || run_script "$SCRIPTS_DIR/bootstrap.sh";;
      3) run_script "$SCRIPTS_DIR/bootstrap.sh" --check;;
      4) run_script "$SCRIPTS_DIR/bootstrap.sh" --install --with-stripe;;
      5) run_script "$SCRIPTS_DIR/bootstrap.sh" --auth --with-stripe;;
      6) capture_firebase;;
      7) seed_env;;
      8) [[ -f "$TEMPLATE_DIR/setup.sh" ]] && ( cd "$TEMPLATE_DIR" && bash setup.sh ) || err "Template/setup.sh missing"; pause;;
      9) run_script "$SCRIPTS_DIR/firebase-setup.sh";;
      10) confirm "Install git hooks?" && run_script "$HOOKS_DIR/install-hooks.sh";;
      11) confirm "Install the 'WSG-MENU' terminal command?" && run_script "$SCRIPTS_DIR/install-command.sh";;
      0|q|Q) break;;
      *) warn "Invalid option";;
    esac
  done
}

# ── 2 · Deploy ────────────────────────────────────────────────────────────────
menu_deploy() {
  while true; do
    print_header; section "3 › DEPLOY"; echo
    printf '  1) Full auto-deploy        %s(gates → build → commit → push → deploy)%s\n' "$C_DIM" "$C_RESET"
    printf '  2) Preflight only          %s(gates + build, no git/deploy)%s\n' "$C_DIM" "$C_RESET"
    echo "  3) Deploy — Hosting only"
    printf '  4) Deploy — Rules only     %s(Firestore + Storage)%s\n' "$C_DIM" "$C_RESET"
    echo "  5) Deploy — Functions only"
    echo "  6) Full deploy + ESLint --fix"
    echo "  7) Bump patch + full deploy"
    printf '  8) Skip tests + deploy     %s(⚠ use with caution)%s\n' "$C_DIM" "$C_RESET"
    echo; echo "  0) Back"; echo
    read -r -p "$(printf '  %sChoice:%s ' "$C_CYAN" "$C_RESET")" c || break
    case "$c" in
      1) confirm "Run full deploy?" && run_script "$SCRIPTS_DIR/deploy.sh";;
      2) run_script "$SCRIPTS_DIR/deploy.sh" --preflight;;
      3) confirm "Deploy hosting only?" && run_script "$SCRIPTS_DIR/deploy-hosting.sh";;
      4) confirm "Deploy rules only?" && run_script "$SCRIPTS_DIR/deploy-rules.sh";;
      5) confirm "Deploy functions only?" && run_script "$SCRIPTS_DIR/deploy-functions.sh";;
      6) confirm "Full deploy with ESLint --fix?" && run_script "$SCRIPTS_DIR/deploy.sh" --fix;;
      7) confirm "Bump patch and deploy?" && run_script "$SCRIPTS_DIR/deploy.sh" --bump patch;;
      8) confirm "⚠ Skip tests and deploy?" && run_script "$SCRIPTS_DIR/deploy.sh" --skip-tests;;
      0|q|Q) break;;
      *) warn "Invalid option";;
    esac
  done
}

# ── 3 · Quality ───────────────────────────────────────────────────────────────
menu_quality() {
  while true; do
    print_header; section "4 › QUALITY CHECKS"; echo
    printf '  1) TypeScript check   %s(npm run typecheck)%s\n' "$C_DIM" "$C_RESET"
    printf '  2) ESLint             %s(npm run lint)%s\n' "$C_DIM" "$C_RESET"
    echo "  3) ESLint --fix"
    printf '  4) Tests              %s(npm run test, if present)%s\n' "$C_DIM" "$C_RESET"
    printf '  5) Full quality gate  %s(typecheck + lint + tests)%s\n' "$C_DIM" "$C_RESET"
    printf '  6) npm audit          %s(dependency vulnerabilities)%s\n' "$C_DIM" "$C_RESET"
    echo; echo "  0) Back"; echo
    read -r -p "$(printf '  %sChoice:%s ' "$C_CYAN" "$C_RESET")" c || break
    case "$c" in
      1) echo; divider; npm run -s typecheck --if-present || true; divider; pause;;
      2) echo; divider; npm run -s lint --if-present || true; divider; pause;;
      3) confirm "Run ESLint --fix?" && { echo; divider; npm run -s lint:fix --if-present || true; divider; pause; };;
      4) echo; divider; npm run -s test --if-present || true; divider; pause;;
      5) run_script "$SCRIPTS_DIR/quality-check.sh";;
      6) echo; divider; npm audit || true; divider; pause;;
      0|q|Q) break;;
      *) warn "Invalid option";;
    esac
  done
}

# ── 4 · Version ───────────────────────────────────────────────────────────────
menu_version() {
  while true; do
    print_header; section "5 › VERSION MANAGEMENT"; echo
    printf '  %sCurrent:%s %sv%s%s\n\n' "$C_DIM" "$C_RESET" "$C_CYAN$C_BOLD" "$(version_str)" "$C_RESET"
    printf '  1) Bump patch  %s(x.x.+1)%s\n' "$C_DIM" "$C_RESET"
    printf '  2) Bump minor  %s(x.+1.0)%s\n' "$C_DIM" "$C_RESET"
    printf '  3) Bump major  %s(+1.0.0)%s\n' "$C_DIM" "$C_RESET"
    echo "  4) View version files"
    echo "  5) View CHANGELOG"
    echo; echo "  0) Back"; echo
    read -r -p "$(printf '  %sChoice:%s ' "$C_CYAN" "$C_RESET")" c || break
    case "$c" in
      1) confirm "Bump PATCH?" && run_script "$SCRIPTS_DIR/version-bump.sh" patch;;
      2) confirm "Bump MINOR?" && run_script "$SCRIPTS_DIR/version-bump.sh" minor;;
      3) confirm "Bump MAJOR?" && run_script "$SCRIPTS_DIR/version-bump.sh" major;;
      4) echo; divider; echo "app-version.txt:"; cat "$VERSION_DIR/app-version.txt" 2>/dev/null || echo "(none)"; echo; echo "version.json:"; cat "$VERSION_DIR/version.json" 2>/dev/null || echo "(none)"; divider; pause;;
      5) echo; divider; head -60 "$VERSION_DIR/CHANGELOG.md" 2>/dev/null || warn "CHANGELOG.md not found"; divider; pause;;
      0|q|Q) break;;
      *) warn "Invalid option";;
    esac
  done
}

# ── 5 · Firebase ──────────────────────────────────────────────────────────────
fb() { if have firebase; then firebase "$@"; elif have npx; then npx --yes firebase-tools "$@"; else err "Firebase CLI not found"; return 1; fi; }
menu_firebase() {
  while true; do
    print_header; section "6 › FIREBASE"; echo
    echo "  1) Login status / whoami"
    echo "  2) List projects"
    echo "  3) Show active project (.firebaserc)"
    echo "  4) Start emulator suite"
    echo "  5) Deploy Firestore indexes"
    echo "  6) Firebase setup (login + select project)"
    echo; echo "  0) Back"; echo
    read -r -p "$(printf '  %sChoice:%s ' "$C_CYAN" "$C_RESET")" c || break
    case "$c" in
      1) echo; divider; fb login:list 2>/dev/null || fb login || true; divider; pause;;
      2) echo; divider; fb projects:list || true; divider; pause;;
      3) echo; divider; cat "$REPO_ROOT/.firebaserc" 2>/dev/null || warn ".firebaserc not found"; divider; pause;;
      4) warn "Starting emulator — Ctrl+C to stop."; fb emulators:start || true; pause;;
      5) confirm "Deploy Firestore indexes?" && { echo; divider; fb deploy --only firestore:indexes || true; divider; pause; };;
      6) run_script "$SCRIPTS_DIR/firebase-setup.sh";;
      0|q|Q) break;;
      *) warn "Invalid option";;
    esac
  done
}

# ── 6 · Git ───────────────────────────────────────────────────────────────────
menu_git() {
  while true; do
    print_header; section "7 › GIT"; echo
    echo "  1) Status"
    echo "  2) Pull (fast-forward)"
    echo "  3) Log (last 15, graph)"
    echo "  4) Diff --stat"
    printf '  5) Add all + commit  %s(prompts for message)%s\n' "$C_DIM" "$C_RESET"
    echo "  6) Push current branch"
    echo; echo "  0) Back"; echo
    read -r -p "$(printf '  %sChoice:%s ' "$C_CYAN" "$C_RESET")" c || break
    case "$c" in
      1) echo; divider; git status; divider; pause;;
      2) confirm "git pull?" && { echo; divider; git pull --ff-only || git pull; divider; pause; };;
      3) echo; divider; git --no-pager log --oneline --decorate --graph -15; divider; pause;;
      4) echo; divider; git --no-pager diff --stat; divider; pause;;
      5) read -r -p "$(printf '  %sCommit message:%s ' "$C_CYAN" "$C_RESET")" m; [[ -z "$m" ]] && { warn "Empty — aborted."; pause; continue; }; echo; divider; git add -A && git commit -m "$m"; divider; pause;;
      6) confirm "Push $(git_branch)?" && { echo; divider; git push origin "$(git_branch)"; divider; pause; };;
      0|q|Q) break;;
      *) warn "Invalid option";;
    esac
  done
}

# ── 7 · Dev & app ─────────────────────────────────────────────────────────────
menu_dev() {
  while true; do
    print_header; section "8 › DEV & APP"; echo
    echo "  1) Install dependencies (npm install)"
    echo "  2) Start dev server (npm run dev)"
    echo "  3) Build for production (npm run build)"
    echo "  4) Preview production build (npm run preview)"
    echo; echo "  0) Back"; echo
    read -r -p "$(printf '  %sChoice:%s ' "$C_CYAN" "$C_RESET")" c || break
    case "$c" in
      1) echo; divider; npm install; divider; pause;;
      2) info "Ctrl+C to stop the dev server."; echo; divider; npm run dev || true; divider; pause;;
      3) echo; divider; npm run build || true; divider; pause;;
      4) info "Ctrl+C to stop the preview server."; echo; divider; npm run preview || true; divider; pause;;
      0|q|Q) break;;
      *) warn "Invalid option";;
    esac
  done
}

# ── 8 · Info ──────────────────────────────────────────────────────────────────
menu_info() {
  print_header; section "9 › PROJECT INFO"; echo
  echo "  Repo:    $(git remote get-url origin 2>/dev/null || echo 'N/A')"
  echo "  Branch:  $(git_branch)"
  echo "  Version: v$(version_str)"
  echo "  Node:    $(node --version 2>/dev/null || echo N/A)   npm: $(npm --version 2>/dev/null || echo N/A)"
  echo "  Firebase:$(firebase --version 2>/dev/null || echo ' not installed (npx fallback)')"
  echo "  Root:    $REPO_ROOT"
  echo; divider; info "Last 5 commits:"; git --no-pager log --oneline --decorate -5 2>/dev/null || echo "  (none)"; divider
  pause
}

# ── Main ──────────────────────────────────────────────────────────────────────
main_menu() {
  while true; do
    print_header
    printf '  %s%sMain Menu%s\n\n' "$C_BOLD" "$C_WHITE" "$C_RESET"
    printf '  %s%s1)%s %s🚀 Start Template into Production%s  %sguided one-time setup → live%s\n' "$C_GREEN" "$C_BOLD" "$C_RESET" "$C_BOLD" "$C_RESET" "$C_DIM" "$C_RESET"
    divider
    printf '  %s%s2)%s %sSetup & Tooling%s   %sbootstrap · auth · capture Firebase · guided setup%s\n' "$C_YELLOW" "$C_BOLD" "$C_RESET" "$C_BOLD" "$C_RESET" "$C_DIM" "$C_RESET"
    printf '  %s%s3)%s %sDeploy%s            %sFull · hosting · rules · functions · preflight%s\n' "$C_BLUE" "$C_BOLD" "$C_RESET" "$C_BOLD" "$C_RESET" "$C_DIM" "$C_RESET"
    printf '  %s%s4)%s %sQuality Checks%s    %sTypeScript · ESLint · tests · audit%s\n' "$C_GREEN" "$C_BOLD" "$C_RESET" "$C_BOLD" "$C_RESET" "$C_DIM" "$C_RESET"
    printf '  %s%s5)%s %sVersion%s           %sBump patch/minor/major · changelog%s\n' "$C_MAGENTA" "$C_BOLD" "$C_RESET" "$C_BOLD" "$C_RESET" "$C_DIM" "$C_RESET"
    printf '  %s%s6)%s %sFirebase%s          %sLogin · projects · emulator · indexes%s\n' "$C_RED" "$C_BOLD" "$C_RESET" "$C_BOLD" "$C_RESET" "$C_DIM" "$C_RESET"
    printf '  %s%s7)%s %sGit%s               %sStatus · pull · commit · push%s\n' "$C_CYAN" "$C_BOLD" "$C_RESET" "$C_BOLD" "$C_RESET" "$C_DIM" "$C_RESET"
    printf '  %s8)%s %sDev & App%s         %sInstall · dev · build · preview%s\n' "$C_BOLD" "$C_RESET" "$C_BOLD" "$C_RESET" "$C_DIM" "$C_RESET"
    printf '  %s%s9)%s %sProject Info%s      %sVersions · repo · recent commits%s\n' "$C_DIM" "$C_BOLD" "$C_RESET" "$C_BOLD" "$C_RESET" "$C_DIM" "$C_RESET"
    echo; divider; printf '  %s0)%s Exit\n' "$C_BOLD" "$C_RESET"; echo
    read -r -p "$(printf '  %s%s▸ Choose:%s ' "$C_CYAN" "$C_BOLD" "$C_RESET")" c || exit 0
    case "$c" in
      1) [[ -f "$SCRIPTS_DIR/start-production.sh" ]] && bash "$SCRIPTS_DIR/start-production.sh" || err "start-production.sh missing"; pause;;
      2) menu_setup;;
      3) menu_deploy;;
      4) menu_quality;;
      5) menu_version;;
      6) menu_firebase;;
      7) menu_git;;
      8) menu_dev;;
      9) menu_info;;
      0|q|Q|exit|quit) clear_screen; printf '  %sWebApp Stack G1 — see you next time.%s\n\n' "$C_CYAN" "$C_RESET"; exit 0;;
      *) warn "Invalid option — pick 1-9 or 0.";;
    esac
  done
}

main_menu "$@"
