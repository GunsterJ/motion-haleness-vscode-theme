#!/usr/bin/env bash
set -euo pipefail

FONT_DIR="${1:-$HOME/Library/Fonts}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$FONT_DIR"
cp "$SCRIPT_DIR"/../assets/fonts/*.ttf "$FONT_DIR"

echo "Installed bundled fonts (Google Sans Code and Google Sans Flex) to $FONT_DIR"
echo "Restart VS Code (and any other apps) to pick them up."
