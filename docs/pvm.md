# Product Vision Map (PVM) — Trans Comarapa Mobile POS

**Version:** 1.0  
**Date:** March 7, 2026  
**Author:** Iden (QA Engineer / Full-Stack Developer)

---

## 1. Vision Statement

Build a modern, web-based Mobile Point of Sale (PVM) system that digitizes Trans Comarapa's passenger transportation and parcel shipping operations — replacing manual paper-based processes with a reliable, real-time platform that scales across all current and future offices along the Santa Cruz–Comarapa route.

---

## 2. Target Users

| Role | Description |
|------|-------------|
| **Administrator** | System administrator. Full access to configuration, user management, routes, offices, buses, and global reports. |
| **Secretary** | Office staff at each location. Sells tickets, registers parcels (encomiendas), manages payments, and operates the daily cash register. |
| **Driver** | Bus driver. Views assigned trips, passenger manifests, and parcel lists for their route. |
| **Assistant** | On-board travel assistant. Helps verify passengers, manage parcels during the trip, and handle intermediate stop pickups. |

---

## 3. Business Context

### Current State
- All ticket sales, parcel registration, and cash management are done **manually with paper and notebooks**.
- No centralized visibility into revenue, passenger counts, or parcel volumes across offices.
- Fleet owners must physically visit each office to collect accumulated revenue — with no digital audit trail.

### Company Profile
- **Company:** Trans Comarapa (passenger transportation)
- **Route:** Santa Cruz → Los Negros → San Isidro → Comarapa
- **Offices:** 4 (with plans to expand)
  - Santa Cruz (origin terminal)
  - Los Negros (intermediate stop)
  - San Isidro (intermediate stop)
  - Comarapa (destination terminal)
- **Bus types:** Multiple categories (single-deck, double-deck, semicama, cama, etc.)
- **Fleet ownership:** A single owner can have buses operating across multiple routes.

---

## 4. Key Problems to Solve

1. **No real-time seat availability** — double-selling happens because offices don't know which seats are already taken at intermediate stops.
2. **Zero digital records** — passenger counts, parcel tracking, and revenue are all on paper, making auditing and reporting extremely difficult.
3. **Revenue leakage and opacity** — fleet owners have no visibility into how much money each office has collected until they physically visit.
4. **No performance insights** — there's no way to analyze monthly trends in passengers, parcels, or revenue by office/route.
5. **Scalability bottleneck** — adding a new office or route means replicating the same error-prone manual process.

---

## 5. Product Goals

### Near-Term (MVP)
- Digitize ticket sales with real-time seat selection and locking (Redis-based).
- Digitize parcel (encomienda) registration with support for cash, QR payments, and "collect on delivery" (por cobrar).
- Implement per-office cash register with revenue tracking and fleet owner withdrawal functionality.
- Provide monthly performance reports (passengers and parcels) by office and route.

### Mid-Term
- Driver and assistant mobile views for trip manifests and parcel lists.
- Multi-route support as the company expands to new destinations.
- Digital QR-based tickets and parcel receipts.
- Notifications (SMS or WhatsApp) for parcel arrival at destination.

### Long-Term
- Client-facing portal for online ticket purchasing and parcel tracking.
- Business intelligence dashboard with historical trend analysis.
- Integration with external payment gateways for broader QR support.
- Support for new offices with minimal configuration.

---

## 6. Success Metrics

| Metric | Target |
|--------|--------|
| Ticket double-sell incidents | Reduced to 0 |
| Time to generate monthly report | < 1 minute (vs. hours of manual counting) |
| Fleet owner revenue visibility | Real-time per office |
| Office onboarding time | < 1 day for a new office |
| System uptime | 99.5%+ |

---

## 7. Technical Strategy

| Layer | Technology |
|-------|------------|
| **Backend** | FastAPI (Python) |
| **Frontend** | React + Vite + TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | MySQL 8 |
| **Cache / Locking** | Redis (temporary seat-locking to prevent double-selling) |
| **Infrastructure** | Docker Compose |

### Architecture Principles
- **API-first design** — clean separation between backend and frontend.
- **Role-based access control (RBAC)** — each of the 4 roles has specific permissions.
- **Office-aware data model** — every transaction is tied to an office, enabling per-office reporting and cash management.
- **Scalable by design** — adding new offices, routes, or bus categories should require only data configuration, not code changes.

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unreliable internet at intermediate offices | Ticket sales fail | Offline-first capability for critical operations (future consideration) |
| Resistance to change from staff | Low adoption | Simple, intuitive UI; training sessions; gradual rollout |
| Concurrent seat selection conflicts | Double-selling | Redis-based seat locking with TTL expiration |
| Single point of failure (server) | Full downtime | Docker Compose with health checks; future HA setup |

---

## 9. Release Strategy

| Phase | Scope | Timeline |
|-------|-------|----------|
| **Phase 1 — Core MVP** | Ticket sales + seat selection, parcel registration, cash register, basic reports | First release |
| **Phase 2 — Operations** | Driver/assistant views, digital tickets, parcel notifications | +2-3 months |
| **Phase 3 — Expansion** | Multi-route support, client portal, BI dashboard | +4-6 months |

---

*This document serves as the strategic north star for the PVM project. All feature decisions should align with the vision and goals defined here.*
