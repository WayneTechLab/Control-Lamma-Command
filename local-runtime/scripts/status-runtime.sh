#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$RUNTIME_DIR/env.sh"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing runtime env file: $ENV_FILE" >&2
  exit 1
fi

# shellcheck source=/dev/null
. "$ENV_FILE"

RUN_DIR="$RUNTIME_DIR/run"

print_service() {
  local label="$1"
  local pid_file="$2"
  local url="$3"
  local pid="missing"
  local state="stopped"
  local health="offline"

  if [ -f "$pid_file" ]; then
    pid="$(tr -d ' \n' < "$pid_file")"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      state="running"
    else
      state="stale-pid"
    fi
  fi

  if curl -fsS "$url" >/dev/null 2>&1; then
    health="online"
  fi

  printf '%-12s state=%-10s pid=%-8s health=%s\n' "$label" "$state" "$pid" "$health"
}

echo "MOLC-AI runtime status"
print_service "web" "$RUN_DIR/web-server.pid" "$MOLC_AI_WEB_BASE_URL/health"
print_service "agent" "$RUN_DIR/local-agent.pid" "$MOLC_AI_AGENT_BASE_URL/health"
echo "dashboard=$MOLC_AI_WEB_BASE_URL/dashboard"
echo "local_machine=$MOLC_AI_WEB_BASE_URL/local-machine"
