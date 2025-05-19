#!/usr/bin/env bash
set -euo pipefail

root="../packages"      # look only under ./packages
npm_tag="latest"

# helper: read "name" and "version" from package.json
read_pkg_field () {
  jq -r ".$1" < "$1"
}

find "$root" -type f -name package.json | while read -r pkg; do
  dir=$(dirname "$pkg")
  echo "➜ Processing $dir"

  # skip private packages
  if grep -q '"private"[[:space:]]*:[[:space:]]*true' "$pkg"; then
    echo "   ⚠️  Skipped (private package)"
    continue
  fi

  name=$(jq -r '.name' < "$pkg")
  version=$(jq -r '.version' < "$pkg")
  git_tag="${name/v/@}-$version"      # e.g. @scope/pkg -> v@scope/pkg-1.2.3
  release_title="$name $version"

  (
    cd "$dir"

    echo "   📦 npm publish --tag $npm_tag"
    npm publish --tag "$npm_tag"

    echo "   🏷️  git tag $git_tag"
    git tag -a "$git_tag" -m "$release_title"
    git push origin "$git_tag"
  )

  echo "   🚀 gh release create $git_tag"
  gh release create "$git_tag" \
    --title "$release_title" \
    --notes "Automated release for **$name** version **$version** (npm tag: \`$npm_tag\`)."
done
