#!/bin/sh
# Detect macOS appearance and publish theme colors as tmux global env vars.
# Referenced from tmux.conf via #{E:STATUS_*}. Re-runs on each status redraw
# (status-interval) because it's invoked from a #(...) in status-left.

if defaults read -g AppleInterfaceStyle 2>/dev/null | grep -qi dark; then
  bg=#282c34 fg=#abb2bf accent=#61afef green=#98c379 yellow=#e5c07b inactive=#5c6370 border=#3e4451
else
  bg=#eeeeee fg=#383a42 accent=#4078f2 green=#50a14f yellow=#c18401 inactive=#a0a1a7 border=#e5e5e6
fi

tmux set-environment -g STATUS_BG       "$bg"
tmux set-environment -g STATUS_FG       "$fg"
tmux set-environment -g STATUS_ACCENT   "$accent"
tmux set-environment -g STATUS_GREEN    "$green"
tmux set-environment -g STATUS_YELLOW   "$yellow"
tmux set-environment -g STATUS_INACTIVE "$inactive"
tmux set-environment -g STATUS_BORDER   "$border"

# Style options aren't format-expanded, so set them with resolved values.
# status-bg/status-fg are deprecated but still take precedence over
# status-style for rendering, and don't auto-sync across source-file reloads.
tmux set -g status-bg                "$bg"
tmux set -g status-fg                "$fg"
tmux set -g status-style             "bg=$bg,fg=$fg"
tmux set -g pane-border-style        "fg=$border"
tmux set -g pane-active-border-style "fg=$accent"
