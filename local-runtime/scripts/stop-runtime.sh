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
web_pid_file="$RUN_DIR/web-server.pid"
agent_pid_file="$RUN_DIR/local-agent.pid"

stop_pid_file() {
  local label="$1"
  local pid_file="$2"

  if [ ! -f "$pid_file" ]; then
    echo "$label not running"
    return
  fi

  local pid=""
  pid="$(tr -d ' \n' < "$pid_file")"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    for _ in $(seq 1 20); do
      if ! kill -0 "$pid" 2>/dev/null; then
        break
      fi
      sleep 0.25
    done
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
    echo "Stopped $label (pid $pid)"
  else
    echo "$label pid file was stale"
  fi

  rm -f "$pid_file"
}

stop_pid_file "web runtime" "$web_pid_file"
stop_pid_file "local agent" "$agent_pid_file"
