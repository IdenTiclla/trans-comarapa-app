# Documentation Index - Trans Comarapa

> Master index of all project documentation. Start here.

## Quick Reference

| Document | Description |
|----------|-------------|
| [../CLAUDE.md](../CLAUDE.md) | AI agent instructions (conventions, commands, patterns) |
| [../README.md](../README.md) | Project overview, setup, and getting started |
| [../README-Docker.md](../README-Docker.md) | Docker setup and commands |

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
| [domain_model.mmd](domain_model.mmd) | Domain model class diagram |
| [actual_class_diagram.mmd](actual_class_diagram.mmd) | Implementation class diagram |
| [component_diagram.mmd](component_diagram.mmd) | System component diagram |
| [ticket_sale_activity_diagram.mmd](ticket_sale_activity_diagram.mmd) | Ticket sale flow |

## Implementation Plans

Active plans for features in development:

| Plan | Status |
|------|--------|
| [react-bookings-page-redesign.plan.md](implementation-plans/react-bookings-page-redesign.plan.md) | In progress |
| [react-secretary-dashboard-redesign.plan.md](implementation-plans/react-secretary-dashboard-redesign.plan.md) | In progress |
| [react-floating-seats-panel.plan.md](implementation-plans/react-floating-seats-panel.plan.md) | Completed |
| [react-ticket-sale-reservation-flow.plan.md](implementation-plans/react-ticket-sale-reservation-flow.plan.md) | Completed |
| [react-seat-map-integration.plan.md](implementation-plans/react-seat-map-integration.plan.md) | Completed |
| [react-trip-creation-confirm-modal.plan.md](implementation-plans/react-trip-creation-confirm-modal.plan.md) | Completed |
| [nuxt-to-react-migration.plan.md](implementation-plans/nuxt-to-react-migration.plan.md) | Ongoing |

## Agent Configuration

| File | Description |
|------|-------------|
| [../.agents/rules/best-practices.md](../.agents/rules/best-practices.md) | Cross-cutting rules for all AI agents |
| [../.agents/skills/backend-dev/SKILL.md](../.agents/skills/backend-dev/SKILL.md) | Backend development conventions |
| [../.agents/skills/frontend-dev/SKILL.md](../.agents/skills/frontend-dev/SKILL.md) | Frontend development conventions (Nuxt/Vue - legacy) |
| [../.agents/skills/plan-execution/SKILL.md](../.agents/skills/plan-execution/SKILL.md) | How to execute implementation plans |
| [../.agents/workflows/db-migration.md](../.agents/workflows/db-migration.md) | Database migration workflow |
| [../.agents/workflows/implement-plan.md](../.agents/workflows/implement-plan.md) | Plan execution workflow |
| [../.agents/workflows/restrictions.md](../.agents/workflows/restrictions.md) | Project-level restrictions |

## Per-Component READMEs

| File | Description |
|------|-------------|
| [../backend/CONTRIBUTING.md](../backend/CONTRIBUTING.md) | Backend contributing guide |
| [../frontend-react/README.md](../frontend-react/README.md) | React frontend overview |
