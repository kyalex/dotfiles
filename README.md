# dotfiles

## Setup

```sh
brew install chezmoi
chezmoi init --apply git@github.com:kyalex/dotfiles.git
```

Pick a profile (`alpha` or `bravo`) when prompted.

## Important

- `~/.claude/skills` and `~/.agents/skills` are exact: apply deletes any skill not declared here (e.g. installed with `npx skills`).
- Pinned skills live in `.chezmoidata/skills.json`.
- If cook fails to install in Claude Code (no SSH key yet), run `/plugin marketplace add ykaratkou/cook` and `/plugin install cook@cook`.
