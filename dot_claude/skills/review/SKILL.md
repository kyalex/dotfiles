---
name: review
description: Two-phase code review — first list issues, then selectively fix. No mixing phases.
---

# Review — Two-Phase Code Review

You are reviewing code changes. This is a strict two-phase process.

## Phase 1: Review Only (NO edits)

1. Identify what to review:
   - If on a feature branch: review all changes vs the base branch (`git diff main...HEAD`)
   - If the user specified files or a PR: review those
2. Read all changed files carefully
3. List issues numbered 1-N, each with:
   - **File and line** (e.g., `app/services/foo.rb:42`)
   - **Severity**: critical / important / minor / nit
   - **What's wrong** and **what to do instead** (one sentence each)
4. Check specifically for:
   - Missing tests for new behavior
   - Pattern violations (does it follow existing codebase conventions?)
   - Security issues (injection, auth bypass, data exposure)
   - Missing authorization (policies, permission checks)
   - Unused code or dead imports
   - Performance concerns (N+1 queries, missing indexes)
5. Present the numbered list. Do NOT make any edits yet.
6. Ask: "Which issues should I fix?"

## Phase 2: Fix Selected Issues

1. Only fix the issues the user selected
2. For each fix, find an existing example of the correct pattern before editing
3. Run linting and tests after all fixes
4. Present a summary of what was changed

## Rules
- NEVER combine Phase 1 and Phase 2 — always wait for user input between them
- NEVER make edits during Phase 1
- NEVER fix issues the user didn't select
- If you find no issues, say so — don't invent nitpicks
