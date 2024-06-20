#!/bin/bash

set -e

# Fetch tags from remote
git fetch --tags

# Get the current version from package.json
current_version=$(grep -oP '"version": "\K[0-9]+\.[0-9]+\.[0-9]+' package.json)

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

# Update the version in package.json
sed -i.bak -E "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" package.json
rm package.json.bak

# Update the version in package-lock.json (first two occurrences)
sed -i.bak -E "0,/\"version\": \"$current_version\"/s//\"version\": \"$new_version\"/2" package-lock.json
rm package-lock.json.bak

# Commit the version bump
git add package.json package-lock.json
git commit -m "Bump version to $new_version"

git push origin main

# Create a new tag
new_tag="v$new_version"

# Create the new tag
git tag $new_tag
git push origin $new_tag

echo "Bumped version to $new_version and created tag: $new_tag"
