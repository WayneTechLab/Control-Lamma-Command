#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INSTALL_DIR="$HOME/Library/Application Support/MOLC-AI"
RUNTIME_DIR="$INSTALL_DIR/runtime"
SCRIPTS_DIR="$RUNTIME_DIR/scripts"
APP_DIR="$HOME/Applications/MOLC-AI Menu.app"
APP_EXECUTABLE="$APP_DIR/Contents/MacOS/MOLCAIMenuBar"
LAUNCH_AGENT_PATH="$HOME/Library/LaunchAgents/com.waynetechlab.molc-ai.menubar.plist"
START_AT_LOGIN=false
OPEN_APP=true

while [ $# -gt 0 ]; do
  case "$1" in
    --start-at-login)
      START_AT_LOGIN=true
      ;;
    --no-open)
      OPEN_APP=false
      ;;
    *)
      echo "Unknown flag: $1" >&2
      exit 1
      ;;
  esac
  shift
done

if [ "$(uname -s)" != "Darwin" ]; then
  echo "The macOS installer only runs on Darwin." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node 22+ and re-run this installer." >&2
  exit 1
fi

NODE_PATH="$(command -v node)"
PATH_PREFIXS=(
  "$(dirname "$NODE_PATH")"
)

if command -v brew >/dev/null 2>&1; then
  PATH_PREFIXS+=("$(dirname "$(command -v brew)")")
fi

if command -v ollama >/dev/null 2>&1; then
  PATH_PREFIXS+=("$(dirname "$(command -v ollama)")")
fi

PATH_PREFIX="$(printf '%s:' "${PATH_PREFIXS[@]}")"
PATH_PREFIX="${PATH_PREFIX%:}"
OLLAMA_BASE_URL="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"
MOLC_AI_WEB_HOST="${MOLC_AI_WEB_HOST:-127.0.0.1}"
MOLC_AI_WEB_PORT="${MOLC_AI_WEB_PORT:-4173}"
MOLC_AI_AGENT_HOST="${MOLC_AI_AGENT_HOST:-127.0.0.1}"
MOLC_AI_AGENT_PORT="${MOLC_AI_AGENT_PORT:-8787}"
MOLC_AI_WEB_BASE_URL="http://$MOLC_AI_WEB_HOST:$MOLC_AI_WEB_PORT"
MOLC_AI_AGENT_BASE_URL="http://$MOLC_AI_AGENT_HOST:$MOLC_AI_AGENT_PORT"

echo "Installing MOLC-AI local runtime..."
cd "$ROOT_DIR"
npm run build

mkdir -p "$RUNTIME_DIR" "$SCRIPTS_DIR" "$RUNTIME_DIR/logs" "$RUNTIME_DIR/run" "$HOME/Library/LaunchAgents"
rm -rf "$RUNTIME_DIR/dist"
cp -R "$ROOT_DIR/dist" "$RUNTIME_DIR/dist"
cp "$ROOT_DIR/local-agent/server.mjs" "$RUNTIME_DIR/server.mjs"
cp "$ROOT_DIR/local-runtime/web-server.mjs" "$RUNTIME_DIR/web-server.mjs"
cp "$ROOT_DIR/local-runtime/scripts/start-runtime.sh" "$SCRIPTS_DIR/start-runtime.sh"
cp "$ROOT_DIR/local-runtime/scripts/stop-runtime.sh" "$SCRIPTS_DIR/stop-runtime.sh"
cp "$ROOT_DIR/local-runtime/scripts/status-runtime.sh" "$SCRIPTS_DIR/status-runtime.sh"
chmod +x "$SCRIPTS_DIR/"*.sh

cat >"$RUNTIME_DIR/env.sh" <<EOF
#!/usr/bin/env bash
export MOLC_AI_HOME="$INSTALL_DIR"
export MOLC_AI_RUNTIME_DIR="$RUNTIME_DIR"
export MOLC_AI_NODE_PATH="$NODE_PATH"
export MOLC_AI_PATH_PREFIX="$PATH_PREFIX"
export MOLC_AI_OLLAMA_BASE_URL="$OLLAMA_BASE_URL"
export MOLC_AI_WEB_HOST="$MOLC_AI_WEB_HOST"
export MOLC_AI_WEB_PORT="$MOLC_AI_WEB_PORT"
export MOLC_AI_WEB_BASE_URL="$MOLC_AI_WEB_BASE_URL"
export MOLC_AI_WEB_ROOT="$RUNTIME_DIR/dist"
export MOLC_AI_AGENT_HOST="$MOLC_AI_AGENT_HOST"
export MOLC_AI_AGENT_PORT="$MOLC_AI_AGENT_PORT"
export MOLC_AI_AGENT_BASE_URL="$MOLC_AI_AGENT_BASE_URL"
EOF
chmod +x "$RUNTIME_DIR/env.sh"

MOLC_AI_APP_DIR="$APP_DIR" bash "$ROOT_DIR/local-runtime/scripts/build-menubar-app.sh"

defaults write com.waynetechlab.molc-ai-menubar AutoStartServices -bool true >/dev/null

bash "$SCRIPTS_DIR/start-runtime.sh"

if [ "$START_AT_LOGIN" = true ]; then
  cat >"$LAUNCH_AGENT_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.waynetechlab.molc-ai.menubar</string>
  <key>ProgramArguments</key>
  <array>
    <string>$APP_EXECUTABLE</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
  <key>WorkingDirectory</key>
  <string>$INSTALL_DIR</string>
</dict>
</plist>
EOF
  launchctl bootout "gui/$(id -u)" "$LAUNCH_AGENT_PATH" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$(id -u)" "$LAUNCH_AGENT_PATH"
  echo "Enabled start at login."
fi

if [ "$OPEN_APP" = true ]; then
  if ! pgrep -f "$APP_EXECUTABLE" >/dev/null 2>&1; then
    nohup "$APP_EXECUTABLE" >/dev/null 2>&1 &
  fi
fi

echo
echo "MOLC-AI installed."
echo "  Menu app: $APP_DIR"
echo "  Dashboard: $MOLC_AI_WEB_BASE_URL/dashboard"
echo "  Local machine: $MOLC_AI_WEB_BASE_URL/local-machine"
echo
echo "Useful commands:"
echo "  npm run install:mac"
echo "  npm run install:mac:login"
echo "  bash '$SCRIPTS_DIR/status-runtime.sh'"
echo "  bash '$SCRIPTS_DIR/stop-runtime.sh'"
