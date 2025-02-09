#!/usr/bin/env bash
set -euo pipefail

# 1. Check CLI args for Dokku app name and optional remote name
if [ -z "${1:-}" ]; then
  echo "Usage: $0 <dokku-app-name> [remote-name]"
  exit 1
fi

APP_NAME="$1"
# Use second argument if provided, otherwise default to "dokku-$APP_NAME"
REMOTE_NAME="${2:-dokku-$APP_NAME}"

# 2. Parse the Git remote URL from the current directory (or parent) without changing dirs yet
#    This will fail if the remote doesn't exist, so we handle that gracefully.
REMOTE_URL="$(git remote get-url "$REMOTE_NAME" 2>/dev/null || true)"
if [ -z "$REMOTE_URL" ]; then
  echo "Error: No remote named '$REMOTE_NAME' found. Please add it first."
  echo "For example: git remote add $REMOTE_NAME dokku@YOUR_DOKKU_HOST:$APP_NAME"
  exit 1
fi

# Example remote_url: "dokku@161.35.19.29:testing-tg"
# Strip off leading 'dokku@'
STRIPPED="${REMOTE_URL#dokku@}"
# Split into host and app by the colon
DOKKU_HOST="${STRIPPED%%:*}"   # 161.35.19.29
DOKKU_APP="${STRIPPED#*:}"     # testing-tg

echo "Found Dokku remote: $REMOTE_URL"
echo "DOKKU_HOST=$DOKKU_HOST  DOKKU_APP=$DOKKU_APP"

# 3. Move to the repository's top-level so Git commands work reliably
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# 4. Create a temporary worktree from HEAD (detached)
TEMP_DIR="$(mktemp -d)"
echo "Creating temporary worktree in: $TEMP_DIR"
git worktree add --detach "$TEMP_DIR" HEAD

# 5. Remove all directories under apps except the target app
cd "$TEMP_DIR"
for dir in apps/*; do
  if [ -d "$dir" ] && [ "$(basename "$dir")" != "$APP_NAME" ]; then
    rm -rf "$dir"
  fi
done

# 6. Commit that removal in the temp worktree
git add -A
git commit --allow-empty -m "Keep only apps/$APP_NAME for Dokku deployment"

# 7. Push from detached HEAD to main on the Dokku remote
#    Use a fully qualified ref on the remote side: refs/heads/main
echo "Pushing to remote '$REMOTE_NAME' -> $REMOTE_URL"
git push "$REMOTE_NAME" HEAD:refs/heads/main -f

# 8. Clean up the temporary worktree
cd "$REPO_ROOT"
git worktree remove "$TEMP_DIR"

echo "Deployment to $APP_NAME complete!"
