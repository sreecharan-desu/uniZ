#!/bin/bash

# This script controls whether Vercel should build a deployment.
# It is used in vercel.json under "ignoreCommand".

# 1. Always build the 'main' branch (Production)
if [ "$VERCEL_GIT_COMMIT_REF" == "main" ]; then
  echo "✅ Production branch (main) detected. Proceeding with build."
  exit 1 # Exit 1 tells Vercel: DO NOT ignore (i.e., Build)
fi

# 2. For Pull Requests, check for triggers
if [ "$VERCEL_GIT_PULL_REQUEST_ID" != "" ]; then
  
  # A) Check for [deploy] keyword in the latest commit message
  COMMIT_MSG=$(git log -1 --pretty=%B)
  if [[ "$COMMIT_MSG" == *"[deploy]"* ]]; then
    echo "✅ [deploy] keyword found in commit message. Proceeding with build."
    exit 1
  fi

  # B) Check for 'deploy' label on the PR (Requires GH_TOKEN in Vercel Env Vars)
  if [ "$GH_TOKEN" != "" ]; then
    # Fetch labels using GitHub API
    LABELS=$(curl -s -H "Authorization: token $GH_TOKEN" \
      "https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/issues/$VERCEL_GIT_PULL_REQUEST_ID/labels")
    
    if echo "$LABELS" | grep -q "\"name\": \"deploy\""; then
      echo "✅ 'deploy' label found on PR. Proceeding with build."
      exit 1
    fi
  fi

  echo "🛑 Build Ignored: No '[deploy]' tag in commit and no 'deploy' label found."
  echo "   Add '[deploy]' to your commit message or the 'deploy' label to the PR to trigger a build."
  exit 0 # Exit 0 tells Vercel: IGNORE the build
fi

# 3. For other branches (not main and not a PR), ignore by default
echo "🛑 Build ignored for non-PR branch: $VERCEL_GIT_COMMIT_REF"
exit 0
