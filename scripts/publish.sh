#!/usr/bin/env bash
set -euo pipefail

root="../packages"      # look only under ./packages
tag="latest"

find "$root" -type f -name package.json | while read -r pkg; do
  dir=$(dirname "$pkg")
  echo "➜ Publishing $dir"
  (
    cd "$dir"
    # Skip if "private": true
    if grep -q '"private"[[:space:]]*:[[:space:]]*true' package.json; then
      echo "   ⚠️  Skipped (private package)"
      exit 0
    fi

    # Build first if you rely on dist files
    # npm run build

    npm publish --access public --tag "$tag"
  )
done
