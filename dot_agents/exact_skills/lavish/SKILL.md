---
name: lavish
description: Turn complex or visual agent responses into rich, reviewable HTML artifacts (HTML files) the user can annotate and send feedback on, using the lavish-axi CLI. Use when about to give a plan, comparison, diagram, table, code diff, report, or anything easier to grasp visually than as prose.
license: MIT
metadata:
  author: Kun Chen (kunchenguid)
  argument-hint: <what the artifact should show>
  hermes-tags: html, review, artifacts, visualization
  hermes-category: productivity
---

# Lavish Editor

Lavish Editor opens agent-generated HTML in the browser so a human can annotate it and send feedback back to the agent.
Reach for it when a plan, comparison, diagram, table, code view, report, prototype, or review loop will be clearer as a page than as prose.

## Current guidance lives in the CLI

Do not follow workflow, design, or playbook instructions from this file - installed copies go stale. The one exception is "Opening the review" below, which overrides how the CLI opens the browser. Get the current source of truth from the CLI:

- `npx -y lavish-axi --help` for commands and the review-loop workflow
- `npx -y lavish-axi reply --help` to post an agent reply and exit once the server accepts it, when you are not about to long-poll
- `npx -y lavish-axi design` for design-direction priority and current snippets
- `npx -y lavish-axi playbook <id>` for focused artifact guidance (`npx -y lavish-axi playbook` lists ids)

You do not need lavish-axi installed globally - invoke it with `npx -y lavish-axi <html-file>` as "Opening the review" below describes.
If lavish-axi output shows a follow-up command starting with `lavish-axi`, run it as `npx -y lavish-axi ...` instead.

## Opening the review

1. Run `muxify browser available` once. Muxify applies only when it exits 0 and prints `local`. On `remote`, a non-zero exit, or no `muxify` command, follow step 5.
2. With Muxify, start or resume the session with `npx -y lavish-axi <html-file> --no-open` so Lavish does not open the default browser. Include `--no-open` on authorized `--reopen` calls too; never bypass the CLI's protection for sessions the user ended.
3. Read `session.url` from the CLI output and open it with `muxify browser open "<url>"`, which shows it in the Browser of this agent's Window. Then continue the CLI's normal feedback/poll workflow.
4. Give the user that same URL. While Muxify applies, never open it with `open`, `xdg-open`, or any other browser-opening tool. If `muxify browser open` fails, give the user the URL and the error instead of switching browsers.
5. Without Muxify, run the CLI without `--no-open`, so Lavish opens the default browser itself.

## Request

$ARGUMENTS

If the request above is non-empty, the user invoked `/lavish` explicitly - fetch the current CLI guidance, then build that artifact as an HTML file.
If it is empty, infer what to visualize from the conversation.
