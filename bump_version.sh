#!/bin/bash

# Fetch tags from remote
git fetch --tags

# Get the latest tag
latest_tag=$(git describe --tags `git rev-list --tags --max-count=1` 2>/dev/null)

# Extract the version number and increment it
if [[ $latest_tag =~ ^v([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  major=${BASH_REMATCH[1]}
  minor=${BASH_REMATCH[2]}
  patch=${BASH_REMATCH[3]}
  new_tag="v$major.$minor.$((patch+1))"
else
  new_tag="v1.0.0"
fi

# Check if the new tag already exists
if git rev-parse "$new_tag" >/dev/null 2>&1; then
  echo "Tag $new_tag already exists. Incrementing patch version."
  patch=$((patch+1))
  new_tag="v$major.$minor.$((patch+1))"
fi

# Create a new tag
git tag $new_tag
git push origin $new_tag

echo "Created new tag: $new_tag"
