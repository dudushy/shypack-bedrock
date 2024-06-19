#!/bin/bash

set -e

# Fetch tags from remote
git fetch --tags

# Get the current version from package.json
current_version=$(jq -r '.version' package.json)

# Extract the version number and increment the patch version
if [[ $current_version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  major=${BASH_REMATCH[1]}
  minor=${BASH_REMATCH[2]}
  patch=${BASH_REMATCH[3]}
  new_version="$major.$minor.$((patch+1))"
else
  echo "Invalid version format in package.json"
  exit 1
fi

# Update the version in package.json and package-lock.json
jq --arg new_version "$new_version" '.version = $new_version' package.json > package.json.tmp && mv package.json.tmp package.json
jq --arg new_version "$new_version" '.version = $new_version' package-lock.json > package-lock.json.tmp && mv package-lock.json.tmp package-lock.json

# Commit the version bump
git add package.json package-lock.json
git commit -m "Bump version to $new_version [skip ci]"

# Create a new tag
new_tag="v$new_version"
git tag $new_tag
git push origin $new_tag
git push origin main

echo "Bumped version to $new_version and created tag: $new_tag"
