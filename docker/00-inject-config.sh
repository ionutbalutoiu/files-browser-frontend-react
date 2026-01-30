#!/bin/sh
# Runtime configuration injection script
# This script runs before nginx starts and replaces placeholders in runtime-config.js
# with actual environment variable values.
set -e

CONFIG_FILE="/app/dist/assets/runtime-config.js"

if [ -f "$CONFIG_FILE" ]; then
  sed -i "s|__PUBLIC_BASE_URL__|${PUBLIC_BASE_URL}|g" "$CONFIG_FILE"
  echo "Runtime config injected: PUBLIC_BASE_URL=${PUBLIC_BASE_URL}"
else
  echo "Warning: $CONFIG_FILE not found, skipping config injection"
fi
