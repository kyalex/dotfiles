# Skills in these dotfiles

How coding-agent skills for Claude Code and Codex are managed by this chezmoi repository. This file is listed in `.chezmoiignore`, so it is not deployed to the home directory.

## What apply restores

`chezmoi apply` restores three things, on both machine profiles:

- **Matt Pocock's published skills**, under bare names (`/tdd` in Claude Code, `$tdd` in Codex), from one pinned commit of `mattpocock/skills`. `.chezmoidata/skills.json` is the pin file: release tag, commit, and skill list. `.chezmoiexternal.toml.tmpl` turns it into one archive external per skill in each of two folders: `~/.agents/skills`, which Codex reads, and `~/.claude/skills`, which Claude Code reads.
- **pop's integration** for both agents. `.chezmoiscripts/run_onchange_after_pop-integrate.sh.tmpl` runs `pop integrate claude codex`.
- **cook on Codex.** `.chezmoiscripts/run_onchange_after_cook-codex.sh.tmpl` runs `codex plugin marketplace add ykaratkou/cook` and `codex plugin add cook@cook`.

## Updating the pinned skills

```sh
skills-bump                          # move the pin to the highest v* release tag
cd "$(chezmoi source-path)"
git diff .chezmoidata/skills.json    # review what changed
git commit -m "skills: bump pin" .chezmoidata/skills.json
chezmoi apply
```

To pin a specific release, name its tag: `skills-bump v1.3.1`.

`skills-bump` is deployed to `~/.local/bin` from `dot_local/bin/executable_skills-bump`. It prints the old and new tag and the names of the skills added and removed. It only rewrites the pin file: it never commits and never applies, and on any failure it exits non-zero and leaves the pin file untouched. `skills-bump --help` lists its options.

## Adding a custom skill

A custom skill is stored once, under the agents skills folder, and Claude Code reaches it through a relative symlink. For a skill called `my-skill`:

1. Go to the source directory:

   ```sh
   cd "$(chezmoi source-path)"
   ```

2. Write the skill at `dot_agents/exact_skills/my-skill/SKILL.md`. Use a name that is not in the pin file.

3. Add the symlink entry for Claude Code, a file holding one line:

   ```sh
   echo '../../.agents/skills/my-skill' > dot_claude/exact_skills/symlink_my-skill
   ```

4. Commit both entries, then run `chezmoi apply`.

Apply deploys the folder to `~/.agents/skills/my-skill`, which Codex reads directly, and creates the symlink `~/.claude/skills/my-skill` pointing at it, so Claude Code sees the same skill. To delete the skill, remove both entries from the source and apply.

## What is left alone and what is removed

`~/.claude/skills` and `~/.agents/skills` are exact directories (`dot_claude/exact_skills` and `dot_agents/exact_skills`). Apply removes every entry in them that the dotfiles do not declare. A skill installed by hand, for example with `npx skills`, is removed by the next apply.

Two things are left alone, both listed in `.chezmoiignore` and both in `~/.claude/skills` only:

- `pop-*` entries, the symlinks pop creates.
- The `synced` folder, which belongs to Claude Code's claude.ai skill sync.

Apply also deletes `~/.agents/.skill-lock.json`, the lock file left behind by `npx skills`. It is listed in `.chezmoiremove`.

## Installers and missing tools

pop and cook own their content. The dotfiles only run their installers, from the two scripts in `.chezmoiscripts/` named above.

- Each script runs after chezmoi has written files, and only when its rendered content changes.
- The rendered content depends on whether the tool (`pop` or `codex`) is on `PATH`. When the tool is not installed, the script does nothing and apply still succeeds. The script then runs on the first apply after the tool appears.
- A failing installer fails the apply, and chezmoi runs it again on the next apply.
- `pop integrate` rewrites `~/.claude/settings.json`. `dot_claude/settings.json` is kept in the exact form pop writes, so the rewrite changes nothing and `chezmoi status` stays quiet.

## cook on Claude Code

No script installs cook into Claude Code. `dot_claude/settings.json` declares it under `extraKnownMarketplaces` and `enabledPlugins`, and Claude Code clones `ykaratkou/cook` from GitHub over SSH. It is not pinned.

If that clone fails on a fresh laptop, for example because the laptop has no SSH key on GitHub yet, install cook by hand inside Claude Code:

```
/plugin marketplace add ykaratkou/cook
/plugin install cook@cook
```

## Why this route

- `npx skills` cannot restore a global install, and its lock file records no commit.
- The official `mattpocock-skills` plugin covers Claude Code only, prefixes every skill name, and cannot be pinned without a private catalog.

Fetching a pinned commit with chezmoi gives both agents the same bare-named skills from one reviewed commit, with no installer to re-run.
