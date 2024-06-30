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

# Update the version in package-lock.json (only the first two occurrences)
counter=0
while IFS= read -r line; do
    if [[ $line =~ ^([[:space:]]*)\"version\":\ \"$current_version\" ]]; then
        if [ $counter -lt 2 ]; then
            leading_whitespace="${BASH_REMATCH[1]}"
            line="${leading_whitespace}\"version\": \"$new_version\","
            ((counter++))
        fi
    fi
    echo "$line"
done < package-lock.json > package-lock.json.tmp && mv package-lock.json.tmp package-lock.json

# Commit the version bump
git add package.json package-lock.json
git commit -m "Bump version to $new_version"

# git push origin main
