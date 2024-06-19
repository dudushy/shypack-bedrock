#!/bin/bash

# Get the latest tag
latest_tag=$(git describe --tags `git rev-list --tags --max-count=1`)

# Extract the version number and increment it
if [[ $latest_tag =~ ^v([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
  major=${BASH_REMATCH[1]}
  minor=${BASH_REMATCH[2]}
  patch=${BASH_REMATCH[3]}
  new_tag="v$major.$minor.$((patch+1))"
else
  new_tag="v1.0.0"
fi

# Create a new tag
git tag $new_tag
git push origin $new_tag

echo "Created new tag: $new_tag"
