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
| [guides/naming-conventions.md](guides/naming-conventions.md) | Backend and frontend naming patterns |
| [guides/adding-features.md](guides/adding-features.md) | Step-by-step for adding new entities |

## Lessons Learned

| Lesson | Summary |
|--------|---------|
| [lessons/001](lessons/001-python-set-unhashable-websocket.md) | Python `set` + WebSocket objects = unhashable error |
| [lessons/002](lessons/002-toFixed-on-undefined-api-fields.md) | Never call methods directly on API response fields |

## Implementation Plans

### Active

| Plan | Status |
|------|--------|
| [srp-refactoring](implementation-plans/srp-refactoring.plan.md) | Pending |
| [nuxt-to-react-migration](implementation-plans/nuxt-to-react-migration.plan.md) | Ongoing |
| [react-bookings-page-redesign](implementation-plans/react-bookings-page-redesign.plan.md) | In progress |
| [react-secretary-dashboard-redesign](implementation-plans/react-secretary-dashboard-redesign.plan.md) | In progress |
| [package-loading-and-bokeh-overlay](implementation-plans/package-loading-and-bokeh-overlay.plan.md) | Pending |
| [mvp-phase1](implementation-plans/mvp-phase1.plan.md) | In progress |

### Archived (Completed)

| Plan |
|------|
| [react-floating-seats-panel](implementation-plans/archive/react-floating-seats-panel.plan.md) |
| [react-ticket-sale-reservation-flow](implementation-plans/archive/react-ticket-sale-reservation-flow.plan.md) |
| [react-seat-map-integration](implementation-plans/archive/react-seat-map-integration.plan.md) |
| [react-trip-creation-confirm-modal](implementation-plans/archive/react-trip-creation-confirm-modal.plan.md) |

## Project Configuration

| File | Description |
|------|-------------|
| [../CLAUDE.md](../CLAUDE.md) | AI agent instructions (conventions, commands, patterns) |
| [../.agents/rules/best-practices.md](../.agents/rules/best-practices.md) | Cross-cutting rules for all AI agents |
| [../.agents/skills/backend-dev/SKILL.md](../.agents/skills/backend-dev/SKILL.md) | Backend development conventions |
| [../.agents/skills/frontend-dev/SKILL.md](../.agents/skills/frontend-dev/SKILL.md) | Frontend (React) development conventions |
