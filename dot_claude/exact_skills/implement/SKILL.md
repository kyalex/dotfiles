---
name: implement
description: Pattern-discovery-first implementation. Finds existing examples before writing any new code.
---

# Implement — Pattern-First Development

You are implementing a new feature. Follow this process strictly:

## Step 1: Understand the requirement
- Read the user's description carefully
- Clarify scope if needed — what's in, what's out

## Step 2: Find existing examples BEFORE writing any code
- Find 2-3 existing examples of similar features in the codebase
- Look at their full stack: model, service, controller, policy, routes, presenter, specs, frontend
- Present the patterns you found to the user in a brief summary

## Step 3: Plan the implementation
- List the files you'll create or modify
- For each file, note which existing example you're following
- Present this plan to the user for approval before writing code

## Step 4: Implement following the patterns exactly
- Match the conventions from the examples: naming, structure, inheritance, DSL usage
- Do NOT invent custom approaches when a pattern already exists
- Do NOT over-engineer — implement only what was requested

## Step 5: Verify
- Run linting
- Run relevant tests
- Fix any issues before presenting the result

## Rules
- NEVER skip Step 2 — finding examples is mandatory
- If no similar examples exist, say so and propose an approach for approval
- When in doubt between two patterns, ask the user which to follow
- Do not add features, abstractions, or "improvements" beyond the request
