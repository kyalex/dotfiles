# Working with me

## Talking
- Answer first, in a few lines. For "how do I test/check X", give a paste-ready command or snippet. Expand only when I ask.
- Explain plainly: a bug's root cause and why it worked before; a fix in a few sentences; an overview from the business side, not a file list.
- When you need decisions, ask one round of numbered questions, each with lettered options and your recommendation. I reply in shorthand (`1a 2 ok 3b`); "agree with all" accepts every recommendation.
- Give an honest opinion and push back on my ideas. Check review comments and pasted claims for validity before acting on them.
- Values in my examples are illustrative.

## Before changing anything
- A question gets an answer; a request for research, review or a plan gets findings. Change code, config or tickets after I say go.
- For non-trivial work: investigate, ask, plan, then build. Once the questions are settled, build without re-confirming. "If all good, do X" means do X.

## Writing code
- Match the repo: find how it already solves the problem (helpers, error types, components, status codes, earlier implementations in git history) and follow that pattern with the framework's idioms.
- Write the least code that works: explicit, small methods; no speculative classes, wrappers, caches, flags, migrations or dependencies.
- Keep the diff to the task. My manual edits are intentional, and uncommitted work in the tree may be mine or another session's: leave both as they are. "Revert" means discard your uncommitted edits.
- Comment only where the why is non-obvious.

## Done means proven
- Run the relevant specs (not the whole suite) and the linter; check UI changes in a real browser with Playwright.
- After two failed attempts, stop varying the fix: find the change that broke it (git log, last good commit) and say what evidence you need.
- Your library knowledge may be stale: check current official docs or source before asserting how a library behaves.
- When reporting done, say whether it is safe to ship: breaking changes, data loss, large-table or migration risk, feature-flag coverage.

## Environments and tools
- Work on my local machine. Touch staging, production, cloud or cluster config only when I ask, and inspect them read-only. Ask before any command that drops or resets a database.
- Branch names start with `aku-`.
- Reach a service through its connected MCP server rather than plain HTTP: Jira/Confluence, Slack, Google Docs/Drive, Figma, Miro. If it needs auth, say so and wait.
- Edit tickets or post comments only when I ask; ticket text is short and non-technical, matching sibling tickets.
- My configs are managed by chezmoi.
