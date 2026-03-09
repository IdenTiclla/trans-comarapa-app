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
| [architecture.md](architecture.md) | System architecture, tech stack, layer boundaries |
| [data-model.md](data-model.md) | Database schema, entity relationships, field details |
| [state-machines.md](state-machines.md) | Ticket, package, and trip state transitions |
| [api-reference.md](api-reference.md) | All REST API endpoints grouped by domain |

## Diagrams (Mermaid)

| File | Description |
|------|-------------|
| [domain_model.mmd](domain_model.mmd) | Domain model (conceptual class diagram) |
| [actual_class_diagram.mmd](actual_class_diagram.mmd) | Implementation class diagram (all fields & types) |
| [component_diagram.mmd](component_diagram.mmd) | System component diagram |
| [ticket_sale_activity_diagram.mmd](ticket_sale_activity_diagram.mmd) | Ticket sale workflow |

## Implementation Plans

### Active

| Plan | Status |
|------|--------|
| [srp-refactoring.plan.md](implementation-plans/srp-refactoring.plan.md) | Pending |
| [nuxt-to-react-migration.plan.md](implementation-plans/nuxt-to-react-migration.plan.md) | Ongoing |
| [react-bookings-page-redesign.plan.md](implementation-plans/react-bookings-page-redesign.plan.md) | In progress |
| [react-secretary-dashboard-redesign.plan.md](implementation-plans/react-secretary-dashboard-redesign.plan.md) | In progress |

### Archived (Completed)

| Plan |
|------|
| [react-floating-seats-panel.plan.md](implementation-plans/archive/react-floating-seats-panel.plan.md) |
| [react-ticket-sale-reservation-flow.plan.md](implementation-plans/archive/react-ticket-sale-reservation-flow.plan.md) |
| [react-seat-map-integration.plan.md](implementation-plans/archive/react-seat-map-integration.plan.md) |
| [react-trip-creation-confirm-modal.plan.md](implementation-plans/archive/react-trip-creation-confirm-modal.plan.md) |

## Project Configuration

| File | Description |
|------|-------------|
| [../CLAUDE.md](../CLAUDE.md) | AI agent instructions (conventions, commands, patterns) |
| [../README.md](../README.md) | Project overview and quick start |
| [../backend/CONTRIBUTING.md](../backend/CONTRIBUTING.md) | Backend contributing guide |
| [../frontend-react/README.md](../frontend-react/README.md) | React frontend overview |
| [../.agents/rules/best-practices.md](../.agents/rules/best-practices.md) | Cross-cutting rules for all AI agents |
| [../.agents/skills/backend-dev/SKILL.md](../.agents/skills/backend-dev/SKILL.md) | Backend development conventions |
| [../.agents/skills/frontend-dev/SKILL.md](../.agents/skills/frontend-dev/SKILL.md) | Frontend (React) development conventions |
