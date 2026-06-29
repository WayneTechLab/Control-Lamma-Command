#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE_DIR="$ROOT_DIR/local-runtime/macos"
APP_DIR="${MOLC_AI_APP_DIR:-$HOME/Applications/MOLC-AI Menu.app}"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"
EXECUTABLE="$MACOS_DIR/MOLCAIMenuBar"

mkdir -p "$HOME/Applications" "$MACOS_DIR" "$RESOURCES_DIR"

if ! command -v swiftc >/dev/null 2>&1; then
  echo "swiftc not found. Install Xcode Command Line Tools with: xcode-select --install" >&2
  exit 1
fi

cp "$SOURCE_DIR/Info.plist" "$CONTENTS_DIR/Info.plist"
swiftc -parse-as-library "$SOURCE_DIR/MOLCAIMenuBar.swift" -o "$EXECUTABLE"
chmod +x "$EXECUTABLE"

echo "Built menu bar app:"
echo "  $APP_DIR"
