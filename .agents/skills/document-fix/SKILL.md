---
name: document-fix
description: MANDATORY skill that MUST be automatically triggered AFTER fixing any bug, error, or unexpected behavior - even if the user doesn't ask for documentation. This skill MUST be used proactively whenever you fix, resolve, correct, or solve ANY issue in the codebase. Do NOT skip this skill. It runs automatically after bug fixes to prevent repeating the same mistake. Keywords that MUST trigger this skill: fix, fixed, error, bug, solved, resolved, corrected, issue, mistake, unexpected behavior, doesn't work, not working, broken, failed.
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
argument-hint: [short description of what was fixed]
---

# Document Fix as Lesson Learned

You just fixed a bug or unexpected behavior. Document it so the same mistake is never repeated.

## Instructions

1. **Determine the next lesson number:**
   - Read `docs/lessons/` to find existing lessons
   - Use the next sequential number (e.g., if `002` exists, use `003`)

2. **Create the lesson file** at `docs/lessons/NNN-short-description.md` using this exact template:

```markdown
# Lesson NNN: [Short title in Spanish]

**Fecha:** [today's date YYYY-MM-DD]
**Contexto:** [Brief context of what was being built/changed]

## Error

[Describe the incorrect code pattern with a code example marked `// MAL`]

**Resultado:** [The exact error message or unexpected behavior]

## Causa raíz

[1-2 sentences explaining WHY it happened — not just what, but why the assumption was wrong]

## Solución

[Show the corrected code pattern marked `// BIEN`]

## Regla

[One clear, actionable rule to follow. Start with "Nunca..." or "Siempre..."]
```

3. **Update `CLAUDE.md`** — find the "Current lessons:" list under "## Lessons Learned" and add a new bullet:
   ```
   - `NNN`: [One-line English summary of the rule]
   ```

4. **Verify** that the lesson number is unique and the CLAUDE.md entry matches the lesson file.

## Context from arguments

The fix that was just applied: $ARGUMENTS

If no arguments are provided, review the recent conversation to identify what bug was fixed, what the root cause was, and what the correct pattern is.

## Important

- Keep lessons SHORT and focused (under 40 lines)
- Write the lesson content in Spanish (matching existing lessons)
- Write the CLAUDE.md summary in English (matching existing format)
- Include concrete code examples showing MAL (wrong) vs BIEN (correct)
- The "Regla" must be a single, memorable sentence
