#!/usr/bin/env bash
set -euo pipefail

HIGHLIGHT_DIR="${HIGHLIGHT_DIR:-/tmp/mh-tools}"

if [ ! -d "$HIGHLIGHT_DIR/node_modules/highlight.js" ]; then
  echo "Installing highlight.js (one-time)..."
  npm install --prefix "$HIGHLIGHT_DIR" highlight.js --no-audit --no-fund >/dev/null
fi

NODE_PATH="$HIGHLIGHT_DIR/node_modules" node scripts/generate-screenshots.js /tmp/mh-screenshots

rm -rf /tmp/mh-png
mkdir -p /tmp/mh-png
for f in /tmp/mh-screenshots/*.svg; do
  qlmanage -t -s 1440 -o /tmp/mh-png "$f" >/dev/null 2>&1
done

mkdir -p assets/screenshots
for f in /tmp/mh-png/*.png; do
  cp "$f" "assets/screenshots/$(basename "$f" .svg.png).png"
done

echo "Screenshots updated in assets/screenshots/"