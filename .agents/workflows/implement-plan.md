---
description: Process and systematically execute a predefined implementation plan (.plan.md) from the docs/ directory.
---

# Execute an Implementation Plan

Use this workflow whenever the user provides you with an implementation plan (usually ending in `.plan.md` in the `docs/implementation-plans/` directory) and requests you to implement it.

## Prerequisites

- DO NOT start coding immediately.
- Ensure you have read the `plan-execution` skill (`.agents/skills/plan-execution/SKILL.md`) so you understand the overarching rules on how to adhere to a plan.

## Workflow Steps

1. **Read the Plan**: Use the `view_file` tool to read the entire contents of the provided `.plan.md` file. Ensure you understand the "Context", "Backend Changes", "Frontend Changes", and especially the "Implementation Order" (Orden de Implementación).

2. **Setup the Task Structure**:
   - Begin a `task_boundary` call with the Mode set to **PLANNING**. Set a clear `TaskName` regarding parsing the new plan. 
   - Translate the "Orden de Implementación" from the `.plan.md` file into actionable checklist items within your `task.md` artifact. Group them logically (e.g., Phase 1: Backend, Phase 2: Frontend).

3. **Request Permission (Optional but Recommended)**:
   - If the plan is extremely large or if you need to clarify any ambiguities regarding the architecture (e.g. you notice the plan contradicts the `.agents/skills/backend-dev` skill), use `notify_user` to get approval on your `task.md` breakdown before proceeding. If the user already told you to "just implement it", you may skip this.

4. **Execute the Plan (Step-by-Step)**:
   - Change your `task_boundary` Mode to **EXECUTION**.
   - Strictly follow the "Orden de Implementación" (Implementation Order).
   - Do **NOT** execute Step 2 until Step 1 is fully functional. 
   - After completing each step, check it off in your `task.md` and update your `task_boundary` TaskStatus and TaskSummary to reflect your progress.

5. **Cross-Skill Verification**:
   - As you execute the steps, continuously ensure your code adheres to the project conventions defined in `.agents/skills/backend-dev/SKILL.md` and `.agents/skills/frontend-dev/SKILL.md`.

6. **Final Verification**:
   - Once all execution steps are complete, change your `task_boundary` Mode to **VERIFICATION**.
   - Locate the "Verificación" section at the bottom of the `.plan.md` file.
   - Run any automated commands specified (e.g., `npm run lint`, `pytest`).
   // turbo
   ```bash
   cd /home/iden/Desktop/trans-comarapa-app/frontend
   npm run lint
   ```
   - If there are manual UI verification steps, list them clearly in a final `notify_user` message so the user can test the implementation.
