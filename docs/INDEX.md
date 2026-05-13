# Documentation Index - Trans Comarapa

> Master index of all project documentation. Start here.

## Product & Strategy

| Document | Description |
|----------|-------------|
| [pvm.md](pvm.md) | Product Vision Map — strategic goals, target users, roadmap |
| [prd.md](prd.md) | Product Requirements Document — functional & non-functional requirements |

## Architecture & Design

| Document | Description |
|----------|-------------|
| [architecture/overview.md](architecture/overview.md) | System architecture, tech stack, layer boundaries, RBAC |
| [architecture/data-model.md](architecture/data-model.md) | Database schema, entity relationships, field details |
| [architecture/state-machines.md](architecture/state-machines.md) | Ticket, package, and trip state transitions |
| [architecture/api-reference.md](architecture/api-reference.md) | All REST API endpoints grouped by domain |

## Diagrams (Mermaid)

| File | Description |
|------|-------------|
| [diagrams/domain_model.mmd](diagrams/domain_model.mmd) | Domain model (conceptual class diagram) |
| [diagrams/actual_class_diagram.mmd](diagrams/actual_class_diagram.mmd) | Implementation class diagram (all fields & types) |
| [diagrams/component_diagram.mmd](diagrams/component_diagram.mmd) | System component diagram |
| [diagrams/ticket_sale_activity_diagram.mmd](diagrams/ticket_sale_activity_diagram.mmd) | Ticket sale workflow |

## Guides

| Document | Description |
|----------|-------------|
| [guides/environment-setup.md](guides/environment-setup.md) | Setup, Docker, env vars, troubleshooting |
| [guides/conventions.md](guides/conventions.md) | Naming patterns + step-by-step to add a new entity (backend & frontend) |
| [guides/ui-conventions.md](guides/ui-conventions.md) | UI / a11y / file-size / typing rules (enforced by ESLint) |
| [guides/fluid-responsive-design.md](guides/fluid-responsive-design.md) | Fluid & adaptive responsive layout — reglas obligatorias |
| [guides/testing.md](guides/testing.md) | Testing philosophy, patterns, and commands |

## Test Plans

| Document | Description |
|----------|-------------|
| [test-plans/manual-test-plan-a11y.md](test-plans/manual-test-plan-a11y.md) | Plan de pruebas manuales — Accesibilidad WCAG 2.2 AA |
| [test-plans/archive/](test-plans/archive/) | Resultados de ejecuciones pasadas y planes históricos (Clean Architecture, a11y results) |

## Lessons Learned

| Lesson | Summary |
|--------|---------|
| [001](lessons/001-python-set-unhashable-websocket.md) | Python `set` + WebSocket objects = unhashable error |
| [002](lessons/002-toFixed-on-undefined-api-fields.md) | Never call methods directly on API response fields |
| [003](lessons/003-unit-vs-integration-tests.md) | Unit tests must not require a database |
| [004](lessons/004-react-router-vs-react-router-dom.md) | Use `react-router`, not `react-router-dom` |
| [005](lessons/005-no-any-in-typescript.md) | Never use `any` in React/TS |
| [006](lessons/006-hardcoded-navigate-onClose.md) | Use `navigate(-1)` in modal onClose callbacks |
| [007](lessons/007-business-logic-in-routes-and-models.md) | No business logic in routes or models |
| [008](lessons/008-no-datetime-compare-for-status.md) | Don't compare timestamps to derive entity status |
| [009](lessons/009-radix-dialog-renders-children-when-closed.md) | Wrap Radix `Dialog` with `{data && <Dialog>}` |
| [010](lessons/010-no-custom-modal-overlays.md) | Use `Dialog`/`DialogContent`, never custom overlays |
| [011](lessons/011-session-expiry-without-warning.md) | Show accessible toast before redirecting on session expiry |

## Implementation Plans

### Active

| Plan | Status |
|------|--------|
| [thermal-printer-support](implementation-plans/thermal-printer-support.plan.md) | Pending |

### Archived (Completed)

Located in [implementation-plans/archive/](implementation-plans/archive/). Includes: accessibility WCAG 2.2 AA, authentication improvement, auto cash register opening, codebase cleanup & hardcode audit, fix architecture leaks, frontend clean architecture, MVP phase 1, Nuxt → React migration, owner settlements redesign, package emission a11y/UI-UX, package flow office collections, package loading & bokeh overlay, packages manifest, react bookings page redesign, react bus creation with seats, react floating seats panel, react seat-map integration, react secretary dashboard redesign, react ticket details page, react ticket sale & reservation flow, react trip creation confirm modal, SRP refactoring, testing & architecture standardization, trip detail tabs optimization, UI component standardization, UI sidebar redesign, UI standardization.

## Project Configuration

| File | Description |
|------|-------------|
| [../CLAUDE.md](../CLAUDE.md) | AI agent instructions (conventions, commands, patterns) |
| [../.agents/rules/best-practices.md](../.agents/rules/best-practices.md) | Cross-cutting rules for all AI agents |
| [../.agents/skills/backend-dev/SKILL.md](../.agents/skills/backend-dev/SKILL.md) | Backend development conventions |
| [../.agents/skills/frontend-dev/SKILL.md](../.agents/skills/frontend-dev/SKILL.md) | Frontend (React) development conventions |
