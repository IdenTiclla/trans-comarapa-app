---
name: Plan Execution conventions
description: Core conventions and rules for executing implementation plans provided in markdown files within the `docs/implementation-plans/` directory.
---

# Plan Execution & Implementation

This skill dictates how AI agents must process and execute implementation plans (`.plan.md` files) provided by the user.

## 1. Strict Adherence

- **Follow the Plan**: The implementation plan is the source of truth. Do NOT deviate from the architecture, state machines, endpoints, or file structures outlined in the plan unless explicitly instructed by the user.
- **Cross-Skill Synergy**: While executing a plan, you MUST simultaneously adhere to the rules defined in `backend-dev/SKILL.md` and `frontend-dev/SKILL.md`. For example:
  - If the plan says "Create an endpoint", ensure it follows the Service-Repository pattern from `backend-dev/SKILL.md` and uses Dependency Injection.
  - If the plan mentions "Add status to component", ensure you use Pinia Composition API and Composables as defined in `frontend-dev/SKILL.md`.

## 2. Execution Phases

Implementation plans generally consist of the following standard phases. Always process them systematically:

1. **Context Analysis**: Read the plan fully before beginning execution. Understand the "why" to avoid breaking related functionality.
2. **Backend Phase**: Execute all backend steps first. This ensures APIs, DB models, schemas, and Logic (Services/Repos) are ready.
3. **Frontend Phase**: Execute frontend steps sequentially. Connect to the (now ready) backend.
4. **Bug Fixing / Refactoring Phase**: Handle existing bug fixes or minor adjustments alongside new features if instructed.

## 3. The Implementation Order

If the plan includes a section named **"Orden de Implementación" (Implementation Order)** or similar:
- You MUST follow this order strictly step-by-step.
- Start at Step 1, complete it, and DO NOT proceed to Step 2 until Step 1 is fully functional and validated (locally or via tests).
- Update the `task.md` file regularly to track progress against this specific order.

## 4. Verification

After execution, follow the **"Verificación" (Verification)** section of the plan.
- If it dictates running `pytest`, you must run it.
- If it dictates linting the frontend, run `npm run lint`.
- If it outlines manual UI steps, instruct the user to test them, and verify the backend behavior via logs if necessary.
