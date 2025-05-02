#!/bin/sh

# toggle_mouse() {
#   old=$(tmux show -gv mouse)
#   new=""
#
#   if [ "$old" = "on" ]; then
#     new="off"
#   else
#     new="on"
#   fi
#
#   tmux set -g mouse $new
# }

toggle_mouse() {
    tmux show-options -gqv mouse | grep -q on \
      && tmux set -g mouse off \
      || tmux set -g mouse on

    tmux display-message "Mouse mode: $(tmux show -gqv mouse | tr a-z A-Z)"
}

[ "$1" = "toggle_mouse" ] && toggle_mouse
