#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$RUNTIME_DIR/env.sh"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing runtime env file: $ENV_FILE" >&2
  echo "Run: npm run install:mac" >&2
  exit 1
fi

# shellcheck source=/dev/null
. "$ENV_FILE"

RUN_DIR="$RUNTIME_DIR/run"
LOG_DIR="$RUNTIME_DIR/logs"
mkdir -p "$RUN_DIR" "$LOG_DIR"

PATH="$(dirname "$MOLC_AI_NODE_PATH"):${MOLC_AI_PATH_PREFIX:-}:$PATH"
export PATH

web_pid_file="$RUN_DIR/web-server.pid"
agent_pid_file="$RUN_DIR/local-agent.pid"

is_pid_running() {
  local pid="$1"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

read_pid() {
  local pid_file="$1"
  [ -f "$pid_file" ] || return 1
  tr -d ' \n' < "$pid_file"
}

wait_for_url() {
  local url="$1"
  local attempts="${2:-40}"
  local delay="${3:-0.5}"

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done

  return 1
}

start_web_server() {
  local pid=""
  pid="$(read_pid "$web_pid_file" || true)"
  if is_pid_running "$pid"; then
    echo "Web runtime already running (pid $pid)"
    return
  fi

  nohup "$MOLC_AI_NODE_PATH" "$RUNTIME_DIR/web-server.mjs" >>"$LOG_DIR/web-server.log" 2>&1 &
  echo "$!" >"$web_pid_file"
  echo "Started web runtime (pid $(cat "$web_pid_file"))"
}

start_local_agent() {
  local pid=""
  pid="$(read_pid "$agent_pid_file" || true)"
  if is_pid_running "$pid"; then
    echo "Local agent already running (pid $pid)"
    return
  fi

  nohup \
    env \
      CONTROL_LLAMA_AGENT_HOST="$MOLC_AI_AGENT_HOST" \
      CONTROL_LLAMA_AGENT_PORT="$MOLC_AI_AGENT_PORT" \
      MOLC_AI_HOME="$MOLC_AI_HOME" \
      MOLC_AI_WEB_HOST="$MOLC_AI_WEB_HOST" \
      MOLC_AI_WEB_PORT="$MOLC_AI_WEB_PORT" \
      OLLAMA_BASE_URL="$MOLC_AI_OLLAMA_BASE_URL" \
      "$MOLC_AI_NODE_PATH" "$RUNTIME_DIR/server.mjs" >>"$LOG_DIR/local-agent.log" 2>&1 &
  echo "$!" >"$agent_pid_file"
  echo "Started local agent (pid $(cat "$agent_pid_file"))"
}

start_web_server
start_local_agent

wait_for_url "$MOLC_AI_WEB_BASE_URL/health" || {
  echo "Web runtime failed to answer on $MOLC_AI_WEB_BASE_URL" >&2
  exit 1
}

wait_for_url "$MOLC_AI_AGENT_BASE_URL/health" || {
  echo "Local agent failed to answer on $MOLC_AI_AGENT_BASE_URL" >&2
  exit 1
}

echo "MOLC-AI runtime ready"
echo "  Web:   $MOLC_AI_WEB_BASE_URL"
echo "  Agent: $MOLC_AI_AGENT_BASE_URL"
