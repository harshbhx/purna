#!/usr/bin/env bash
# Creates priority/owner labels and one GitHub issue per task row in docs/04-TASKS.md.
# Usage (from the repo root): bash tools/create-issues.sh        (DRY_RUN=1 to only print)
set -euo pipefail

TASKS="docs/04-TASKS.md"
[ -f "$TASKS" ] || { echo "Run from the repo root ($TASKS not found)"; exit 1; }

run() { if [ "${DRY_RUN:-0}" = "1" ]; then echo "+ $*"; else "$@"; fi; }

if [ "${DRY_RUN:-0}" != "1" ]; then
  command -v gh >/dev/null || { echo "Install the GitHub CLI (gh) first"; exit 1; }
  gh auth status >/dev/null || { echo "Run: gh auth login"; exit 1; }
fi

run gh label create P0 --color B60205 --description "Ships or we don't submit" --force
run gh label create P1 --color FBCA04 --description "Makes it win" --force
run gh label create P2 --color C5DEF5 --description "Only if time is left" --force
run gh label create owner:harsh --color 5319E7 --description "Needs Harsh" --force
run gh label create owner:clad --color 1D76DB --description "CLAD in Lens Studio (laptop)" --force
run gh label create owner:agent --color 0E8A16 --description "Coding agent" --force

# Table rows look like: | T11 | title | A | P0 | 2 h | acceptance |
grep -E '^\| T[0-9]+ \|' "$TASKS" | grep -v '✅' | while IFS='|' read -r _ id title owner pri est acc _; do
  trim() { printf '%s' "$1" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'; }
  id="$(trim "$id")"; title="$(trim "$title")"; owner="$(trim "$owner")"
  pri="$(trim "$pri")"; est="$(trim "$est")"; acc="$(trim "$acc")"
  case "$owner" in
    H) olabel="owner:harsh" ;;
    C) olabel="owner:clad" ;;
    *) olabel="owner:agent" ;;
  esac
  body="$(printf 'From docs/04-TASKS.md.\n\n**Estimate:** %s\n\n**Acceptance:** %s\n\nDefinition of done: AGENTS.md rules 2 and 5.' "$est" "$acc")"
  run gh issue create --title "$id $title" --label "$pri" --label "$olabel" --body "$body"
done
echo "Done."
