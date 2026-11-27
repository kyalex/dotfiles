---
name: feature-design
description: Feature design page, a published artifact where a team records decisions on a feature's open questions next to its tasks, API, data and build order. Use to create one for a new feature, or to update one after decisions (a grilling session, answers given in chat) or a design change.
---

# Feature design

A feature design page is one artifact of three files: `index.html` (shell and styles), `app.js` (the renderer, shared by every page) and `data.js` (this feature's content). Viewers record decisions on the page; they live in the artifact's db collection `decisions`, one document per question slug, and survive every republish.

Skill files: `assets/index.html`, `assets/app.js`, `scripts/fd.mjs` (check and open-question list), [`references/data-format.md`](references/data-format.md) (every `data.js` field). Read the data format before writing or editing `data.js`.

The working copy is `W = <scratchpad>/feature-design/<slug>/`. The published artifact is the durable copy: `update` always rebuilds `W` from it.

## create

1. **Intake.** Ask the user, in one message, for: the feature name; the systems involved and each one's repo (local path or GitHub `owner/repo`); who decides (product, backend, client, design …); sources (spec or design doc, tracker epic, parent artifacts, docs, meeting notes); what is already agreed; what is out of scope. Done when every system has a repo and there is at least one source or a stated reason there is none.
2. **Read.** Pin each repo: `git -C <path> rev-parse --short HEAD`, or `gh repo clone <owner/repo> <scratchpad>/repos/<name> -- --depth 1` for one not checked out. Read sources through their connector (the wiki's or tracker's MCP server, the Artifact tool for artifacts). For a large codebase, send one background Explore agent per system asking for facts with file paths. Done when every question you will draft rests on facts with paths, and you know where each fact came from.
3. **Draft `data.js`** in `W` per the data format. Copy `assets/index.html` and `assets/app.js` into `W` and set `<title>` in `W/index.html` to the feature's title. Questions carry the facts, two or three options each with its cost, a recommendation and why, and `needs` where one answer depends on another. Chunks carry `waits`, the building system and an engineer-day range. Put every fact with its path on the Code facts tab and every term that goes by several names in the glossary. All questions start open: recommendations are drafts for the team.
4. **Check and look**, as in [Check and look](#check-and-look).
5. **Publish** with the Artifact tool: `file_path: W/index.html`, `files: {"app.js": "W/app.js", "data.js": "W/data.js"}`, a one-word `icon` (`plan`), a one-sentence `description`, and `capabilities: {"db": {}, "user": {"scopes": ["profile"]}}`. Then run `ArtifactData list` on collection `decisions` once to confirm the db answers. Give the user the link.

## update

1. **Rebuild `W`.** `Artifact read` the URL, then read `data.js` with `path` and `out_dir: W`. Copy the current `assets/index.html` and `assets/app.js` into `W` and set `<title>` from `data.js`; they render older `data.js` files unchanged.
2. **Pull decisions.** `ArtifactData list` collection `decisions` with `out_dir: W/db` (pages through `next_cursor`). Keep the listing: it gives each document's `version`, which every write pins.
3. **List open questions.** `node <skill>/scripts/fd.mjs open W/data.js W/db/decisions` prints the open questions, the ready ones first (their `needs` are all decided), with facts, options and recommendation. This list is the input for whichever grilling skill the user runs, or ask the questions yourself in that order. Record only answers the user gave.
4. **Record answers** in one `ArtifactData batch`: one `set` per answered question on collection `decisions`, doc id = slug, `if_version` = the version from step 2 (omit it for a first decision):

   ```json
   { "state": "decided", "opt": "a", "note": "one-line why, or empty", "by": "<user id>", "at": "<now, ISO 8601>",
     "history": ["…the old history, then the old top-level {state, opt, note, by, at}; keep the last 20"] }
   ```

   The user id comes from `ArtifactData list` on collection `data/users/me`: the result names what `me` resolved to. A refused pin means someone changed that decision meanwhile: re-read it, show the user both, and redo the write on their word. Reopening writes `"state": "open", "opt": null`.
5. **Apply consequences** to `W/data.js`: for every new decision, edit what it changes (chunk text, size and `waits`; API and data samples; agreed pills; gaps; deliverables). Leave the question's options as they were offered: they are the record of the choice. Keep every slug; a question no longer relevant is deleted from `data.js`, and its saved record is then ignored. Done when no chunk, sample or table on the page contradicts a recorded decision.
6. **Check, look, republish**: [Check and look](#check-and-look), then publish with the same `file_path: W/index.html`, the same `files`, and `url` set to the artifact. Leave out `capabilities` and `icon` so the stored ones carry over.

A design change without decisions runs steps 1, 5 and 6.

## Check and look

1. `node <skill>/scripts/fd.mjs check W/data.js` until it prints `OK`.
2. Wrap the fragment for a local preview and serve it in the background:
   `{ printf '<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>'; cat W/index.html; printf '</body></html>'; } > W/preview.html` and `python3 -m http.server 8765 --directory W`.
3. With Playwright, open `http://localhost:8765/preview.html`. Screenshot Overview, Decisions with one question expanded, and Tasks, in light and dark (`browser_emulate_media`), at desktop width and at 390px. Done when the console has no errors, no text overflows at 390px, and every tab in the nav opens. "Open this page in Claude to see and record decisions" is expected locally.
