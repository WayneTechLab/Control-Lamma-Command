#!/usr/bin/env bash
# .SYSTEMX/scripts/version-bump.sh — Bump semver and sync .SYSTEMX/version files.
# Usage: version-bump.sh patch|minor|major
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SYSTEMX_DIR="$ROOT_DIR/.SYSTEMX"
cd "$ROOT_DIR"

KIND="${1:-}"
if [[ -z "$KIND" || ! "$KIND" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: $0 <patch|minor|major>"; exit 1
fi

VERSION_JSON="$SYSTEMX_DIR/version/version.json"
VERSION_FILE="$SYSTEMX_DIR/version/app-version.txt"

OLD_VERSION=$(node -e 'console.log(require("./package.json").version)')
npm version "$KIND" --no-git-tag-version >/dev/null
NEW_VERSION=$(node -e 'console.log(require("./package.json").version)')

mkdir -p "$(dirname "$VERSION_FILE")"
printf '%s\n' "$NEW_VERSION" > "$VERSION_FILE"

if [[ -f "$VERSION_JSON" ]]; then
  node -e "
    const fs=require('fs');
    const v=JSON.parse(fs.readFileSync('$VERSION_JSON','utf8'));
    v.app=v.app||{};
    v.app.previousVersion='$OLD_VERSION';
    v.app.version='$NEW_VERSION';
    v.app.lastUpdated=new Date().toISOString();
    fs.writeFileSync('$VERSION_JSON', JSON.stringify(v,null,2)+'\n');
  "
fi

echo "Bumped $OLD_VERSION → $NEW_VERSION ($KIND)"
