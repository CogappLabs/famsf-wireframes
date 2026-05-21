#!/usr/bin/env bash
# Refresh sample collection documents from the ETL pipeline output.
#
# Usage:
#   npm run sync:samples
#   # or directly:
#   ./scripts/sync-sample-docs.sh [SOURCE_DIR]
#
# SOURCE_DIR defaults to the sibling collection-flow-famsf repo output.
# Override when your pipeline output lives elsewhere:
#   ./scripts/sync-sample-docs.sh /path/to/output/sample_docs

set -euo pipefail

SRC="${1:-$(dirname "$0")/../../collection-flow-famsf/output/sample_docs}"
DEST="$(dirname "$0")/../src/data/sample-docs"

if [ ! -d "$SRC" ]; then
  echo "ERROR: source directory not found: $SRC" >&2
  echo "Run the FAMSF pipeline (colflow launch --job famsf_pipeline) first, or pass the path as an argument." >&2
  exit 1
fi

mkdir -p "$DEST"

# Copy all JSON files from the source directory (covers minimal_*, median_*,
# maximal_*, named_*, and any future variants).
for SRC_FILE in "$SRC"/*.json; do
  [ -f "$SRC_FILE" ] || continue
  f="$(basename "$SRC_FILE")"
  cp "$SRC_FILE" "$DEST/$f"
  echo "  Synced $f"
done

echo "Done. Sample docs updated in src/data/sample-docs/"
