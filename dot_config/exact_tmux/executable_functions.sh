#!/bin/sh

toggle_mouse() {
  old=$(tmux show -gv mouse)
  new=""

  if [ "$old" = "on" ]; then
    new="off"
  else
    new="on"
  fi

  tmux set -g mouse $new
  tmux display-message "Mouse mode: $new"
}

maximize_pane() {
  current_session=${1:-$(tmux display -p '#{session_name}')}
  current_pane=${2:-$(tmux display -p '#{pane_id}')}

  dead_panes=$(tmux list-panes -s -t "$current_session" -F '#{pane_dead} #{pane_id} #{pane_start_command}' | grep -E -o '^1 %.+maximized.+$' || true)
  restore=$(printf "%s" "$dead_panes" | sed -n -E -e "s/^1 $current_pane .+maximized.+'(%[0-9]+)'\"?$/tmux swap-pane -s \1 -t $current_pane \; kill-pane -t $current_pane/p"\
                                           -e "s/^1 (%[0-9]+) .+maximized.+'$current_pane'\"?$/tmux swap-pane -s \1 -t $current_pane \; kill-pane -t \1/p")

  if [ -z "$restore" ]; then
    [ "$(tmux list-panes -t "$current_session:" | wc -l | sed 's/^ *//g')" -eq 1 ] && tmux display "Can't maximize with only one pane" && return
    info=$(tmux new-window -t "$current_session:" -F "#{session_name}:#{window_index}.#{pane_id}" -P "maximized... 2>/dev/null & \"$TMUX_PROGRAM\" ${TMUX_SOCKET:+-S \"$TMUX_SOCKET\"} setw -t \"$current_session:\" remain-on-exit on; printf \"\\033[\$(tput lines);0fPane has been maximized, press <prefix>+ to restore\n\" '$current_pane'")
    session_window=${info%.*}
    new_pane=${info#*.}

    retry=20
    while [ "$("$TMUX_PROGRAM" ${TMUX_SOCKET:+-S "$TMUX_SOCKET"} list-panes -t "$session_window" -F '#{session_name}:#{window_index}.#{pane_id} #{pane_dead}' 2>/dev/null)" != "$info 1" ] && [ "$retry" -ne 0 ]; do
      sleep 0.1
      retry=$((retry - 1))
    done
    if [ "$retry" -eq 0 ]; then
      tmux display 'Unable to maximize pane'
    fi

    tmux setw -t "$session_window" remain-on-exit off \; swap-pane -s "$current_pane" -t "$new_pane"
  else
    $restore || tmux kill-pane
  fi
}

[ "$1" = "toggle_mouse" ] && toggle_mouse
[ "$1" = "maximize_pane" ] && maximize_pane
