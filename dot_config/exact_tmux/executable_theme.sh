#!/bin/sh
# Detect macOS appearance and publish theme colors as tmux global env vars.
# Referenced from tmux.conf via #{E:STATUS_*}. Re-runs on each status redraw
# (status-interval) because it's invoked from a #(...) in status-left.

if defaults read -g AppleInterfaceStyle 2>/dev/null | grep -qi dark; then
  # Catppuccin Mocha
  bg=#1e1e2e fg=#cdd6f4 accent=#89b4fa green=#a6e3a1 yellow=#f9e2af inactive=#6c7086 border=#313244
else
  # Catppuccin Latte
  bg=#eff1f5 fg=#4c4f69 accent=#1e66f5 green=#40a02b yellow=#df8e1d inactive=#9ca0b0 border=#ccd0da
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
