---
name: bugfix
description: Hypothesis-first debugging with constrained exploration. Prevents endless code archaeology.
---

# Bugfix — Scoped Debugging

You are fixing a bug. Follow this process strictly:

## Step 1: Understand the problem (NO code reading yet)
- Read the user's description carefully
- Ask clarifying questions if the problem is vague

## Step 2: Hypothesize FIRST
- Based on the description alone, form your top 2-3 hypotheses
- State them to the user before reading any code

## Step 3: Validate with minimal exploration
- Read at most 5 files to validate your hypotheses
- Focus on the files most likely to contain the bug
- If the user pointed you to specific files, start there — do NOT explore elsewhere first

## Step 4: Propose the fix
- Prefer the simplest possible fix (one-liner if possible)
- Do NOT refactor surrounding code
- Do NOT add extra error handling, logging, or comments
- Show the user what you plan to change before applying

## Step 5: Verify
- Run relevant tests after applying the fix
- If tests fail, iterate — but stay scoped to the original hypothesis

## Rules
- If you've read 5 files without a clear direction, STOP and ask the user for hints
- Never do an exhaustive codebase exploration for a bug — it's almost always localized
- If the user gives you a hypothesis, trust it and validate it first before exploring alternatives
