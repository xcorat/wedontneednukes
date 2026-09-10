# [ESTABLISHED] New Feature Development Prompt

## Context
Read these files first:
- `.ai/AGENTS.md`
- `.ai/context/conventions.md`
- `.ai/context/architecture.md`

## Task
[Describe the feature]

## Steps
1. Check if a feature module exists in `src/lib/features/`.
2. If not, create: `src/lib/features/{name}/components/`, `stores.ts`, `index.ts`.
3. Add server-side logic in `src/lib/server/services/` if needed.
4. Add repository methods if new DB operations are needed.
5. Create route(s) in `src/routes/` — keep them thin.
6. Add/update types.
7. Write tests.
8. Update docs if architecture changed.
