#!/bin/sh
# start.sh - choose correct built index.js path and exec node
set -e

for p in "/app/indexer/dist/index.js" "/app/indexer/indexer/dist/index.js" "./dist/index.js"; do
  if [ -f "$p" ]; then
    echo "Starting node at: $p"
    exec node "$p"
  fi
done

echo "Error: built entry not found in any expected path" >&2
exit 1
