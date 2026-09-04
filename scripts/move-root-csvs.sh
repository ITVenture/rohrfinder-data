#!/usr/bin/env bash
# Moves any *.csv from the repository root into sites/, normalizing the
# extension to lowercase. The GitHub upload page defaults to the root,
# so this makes a root upload equivalent to an upload into sites/.
# A same-named file in sites/ is replaced (that is the "replace a list"
# procedure). Uses git mv so the rename is staged for the commit step.
set -euo pipefail
shopt -s nullglob nocaseglob
mkdir -p sites
moved=0
for f in *.csv; do
  target="sites/${f%.*}.csv"
  git mv -f -- "$f" "$target"
  echo "moved $f -> $target"
  moved=1
done
[ "$moved" -eq 1 ] || echo "no root-level CSV to move"
