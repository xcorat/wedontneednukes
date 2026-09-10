# [ESTABLISHED] Bug Investigation and Fix Prompt

## Context
Read these files first to understand the boundaries:
- `.ai/AGENTS.md`
- `.ai/context/conventions.md`

## Bug Description
[Describe the bug, steps to reproduce, expected vs actual behavior]

## Steps
1. Attempt to reproduce the bug (via tests or local dev).
2. Trace the issue through the stack: Route -> Service -> Repository.
3. Identify the root cause and document it briefly in the issue ticket or PR.
4. Fix the bug, adhering strictly to Svelte 5 runes and strict TS rules.
5. Add a regression test to prevent recurrence.
6. Refactor if the fix introduces excessive technical debt.
