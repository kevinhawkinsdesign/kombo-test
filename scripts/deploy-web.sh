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

# Record the current JS bundle hash so the app can auto-refresh when a newer
# deploy is available (see the version check in index.html).
BUNDLE_HASH="$(grep -oE 'index-[A-Za-z0-9_-]+\.js' dist/index.html | head -1 | sed -E 's/index-(.*)\.js/\1/')"
printf '%s\n' "$BUNDLE_HASH" > ../app/version.txt

# Keep the 40 most-recently-modified asset files; drop older ones.
ls -1t ../app/assets | tail -n +41 | while IFS= read -r f; do
  rm -f "../app/assets/$f"
done

echo "Deployed to app/ (kept $(ls -1 ../app/assets | wc -l | tr -d ' ') asset files)"
# Pages build-frequency note: if deploys start showing deployment_queued timeouts,
# after a burst of merges, wait ~20-30 min for GitHub's Pages build queue to clear,
# then push any small change to trigger a fresh pages-build-deployment run.
