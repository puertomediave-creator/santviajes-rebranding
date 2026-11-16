#!/usr/bin/env bash
# Exporta cada pieza HTML a PNG 1080x1350 con Chrome sin interfaz.
cd "$(dirname "$0")"
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
mkdir -p png
for f in 0*.html; do
  out="png/${f%.html}.png"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1080,1350 --virtual-time-budget=4000 \
    --screenshot="$(cygpath -w "$PWD/$out")" "file:///$(cygpath -m "$PWD/$f")" >/dev/null 2>&1
  echo "$out"
done
