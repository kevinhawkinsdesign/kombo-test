#!/usr/bin/env bash
# Build the web app for GitHub Pages (hash router, relative base) and publish it
# into ../app. Old hashed bundles are kept alongside the new one so an
# index.html cached by the GitHub Pages CDN during the deploy window still
# resolves its (older) bundle instead of 404-ing to a blank page. We prune to
# the most recent files so app/assets doesn't grow without bound.
set -euo pipefail

cd "$(dirname "$0")/../webapp"

VITE_ROUTER=hash npm run build -- --base=./

mkdir -p ../app/assets
# Merge new assets in; do NOT delete existing hashed bundles.
cp -r dist/assets/. ../app/assets/
cp dist/index.html ../app/index.html

# Keep the 40 most-recently-modified asset files; drop older ones.
ls -1t ../app/assets | tail -n +41 | while IFS= read -r f; do
  rm -f "../app/assets/$f"
done

echo "Deployed to app/ (kept $(ls -1 ../app/assets | wc -l | tr -d ' ') asset files)"
