#!/bin/bash
# Claude Code status line. Managed by chezmoi (dot_claude/executable_statusline.sh).
# Receives session JSON on stdin; see https://code.claude.com/docs/en/statusline.md
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name // "?"')
DIR=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // ""')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
DURATION_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')

CYAN='\033[36m'; GREEN='\033[32m'; YELLOW='\033[33m'; RED='\033[31m'; DIM='\033[2m'; RESET='\033[0m'

# Context bar colour: green < 70%, yellow < 90%, red above.
if [ "$PCT" -ge 90 ]; then BAR_COLOR="$RED"
elif [ "$PCT" -ge 70 ]; then BAR_COLOR="$YELLOW"
else BAR_COLOR="$GREEN"; fi

FILLED=$((PCT / 10)); EMPTY=$((10 - FILLED))
printf -v FILL "%${FILLED}s"; printf -v PAD "%${EMPTY}s"
BAR="${FILL// /█}${PAD// /░}"

MINS=$((DURATION_MS / 60000)); SECS=$(((DURATION_MS % 60000) / 1000))

BRANCH=""
if git rev-parse --git-dir >/dev/null 2>&1; then
  B=$(git branch --show-current 2>/dev/null)
  [ -n "$B" ] && BRANCH=" ${DIM}|${RESET} 🌿 $B"
fi

COST_FMT=$(printf '$%.2f' "$COST")

echo -e "${CYAN}[$MODEL]${RESET} 📁 ${DIR##*/}$BRANCH"
echo -e "${BAR_COLOR}${BAR}${RESET} ${PCT}% ctx ${DIM}|${RESET} ${YELLOW}${COST_FMT}${RESET} ${DIM}|${RESET} ⏱️ ${MINS}m ${SECS}s"
