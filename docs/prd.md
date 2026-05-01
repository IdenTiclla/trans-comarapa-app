# Product Requirements Document (PRD) — Trans Comarapa Mobile POS

**Version:** 1.0  
**Date:** March 7, 2026  
**Author:** Iden (QA Engineer / Full-Stack Developer)  
**Status:** Draft

---

## 1. Overview

This document defines the functional and non-functional requirements for the Trans Comarapa Mobile POS (PVM) system. The system will replace fully manual (paper-based) operations with a web-based platform for ticket sales, parcel shipping, cash management, and reporting across all company offices.

**Reference:** See the [Product Vision Map (PVM)](./PVM.md) for strategic context, vision, and long-term goals.

---

## 2. Scope

### In Scope (MVP)
- User authentication and role-based access control (RBAC)
- Office and route management
- Bus and seat configuration (multiple bus categories)
- Ticket sales with real-time seat selection and locking
- Parcel (encomienda) registration and management
- Payment processing (cash and QR) including "collect on delivery"
- Per-office cash register with fleet owner withdrawals
- Monthly performance reports

### Out of Scope (MVP)
- Client-facing ticket purchasing portal
- Offline mode / Progressive Web App
- SMS/WhatsApp notifications
- Integration with external payment gateways
- Business intelligence / historical analytics

---

## 3. User Roles and Permissions

### 3.1 Administrator

Full system access. Responsible for configuration and oversight.

**Permissions:**
- Create, edit, and deactivate user accounts (all roles)
- Manage offices (create, edit, deactivate)
- Manage routes and route stops
- Manage bus fleet (add/edit buses, define seat layouts, assign categories)
- Assign buses and drivers to trips/schedules
- View all reports (global and per-office)
- View and manage cash registers across all offices
- Configure system settings (pricing, payment methods, parcel rates)

### 3.2 Secretary

Primary operational user at each office. Handles all customer-facing transactions.

**Permissions:**
- Sell tickets: search trips, view seat availability, select seats, process payment
- Register encomiendas: capture sender/receiver info, calculate rates, process payment
- Mark encomiendas as "por cobrar" (collect on delivery)
- Receive payment for "por cobrar" encomiendas upon delivery
- View and manage their office's cash register (daily open/close)
- View sales and encomienda history for their office
- View their own performance reports

### 3.3 Driver

Bus driver assigned to trips.

**Permissions:**
- View assigned trip details (route, schedule, bus)
- View passenger manifest for their trip
- View parcel list for their trip
- Confirm trip departure and arrival (future enhancement)

### 3.4 Assistant

On-board assistant who supports operations during the trip.

**Permissions:**
- View passenger manifest for their assigned trip
- View and manage parcel list during transit
- Verify passenger boarding at intermediate stops
- Register last-minute passenger pickups at intermediate stops (if applicable)

---

## 4. Functional Requirements

### 4.1 Authentication and Authorization

| ID | Requirement |
|----|-------------|
| AUTH-01 | The system shall support login with username and password. |
| AUTH-02 | The system shall enforce role-based access control for all endpoints and UI views. |
| AUTH-03 | Sessions shall use JWT tokens with configurable expiration. |
| AUTH-04 | The system shall support password reset by Administrator. |
| AUTH-05 | Each user account shall be associated with a specific office (except Administrator, who has global access). |

### 4.2 Office and Route Management

| ID | Requirement |
|----|-------------|
| OFF-01 | The system shall support CRUD operations for offices, including name, city, type (origin, intermediate, destination), and status (active/inactive). |
| OFF-02 | The system shall support CRUD operations for routes, defined as an ordered sequence of offices (stops). |
| OFF-03 | The initial route shall be: Santa Cruz → Los Negros → San Isidro → Comarapa. |
| OFF-04 | The system shall support adding new offices and routes without code changes. |
| OFF-05 | Each route stop shall have a configurable distance and base fare from the origin. |

### 4.3 Bus and Fleet Management

| ID | Requirement |
|----|-------------|
| BUS-01 | The system shall support multiple bus categories (e.g., single-deck, double-deck, semicama, cama). |
| BUS-02 | Each bus shall have a configurable seat layout (rows, columns, deck levels) stored as a JSON schema. |
| BUS-03 | Each bus shall be associated with a fleet owner. |
| BUS-04 | A fleet owner can own multiple buses across different routes. |
| BUS-05 | The system shall support CRUD operations for buses, including plate number, category, capacity, seat layout, owner, and status. |
| BUS-06 | The system shall support CRUD for fleet owners, including name, contact info, and associated buses. |

### 4.4 Trip and Schedule Management

| ID | Requirement |
|----|-------------|
| TRIP-01 | The system shall support creating trips by assigning a bus, driver, assistant, route, date, and departure time. |
| TRIP-02 | Each trip shall have a status: scheduled, in-progress, completed, cancelled. |
| TRIP-03 | The system shall display upcoming trips for each office on the Secretaria's dashboard. |
| TRIP-04 | Only the Administrator can create, edit, and cancel trips. |

### 4.5 Ticket Sales

| ID | Requirement |
|----|-------------|
| TIX-01 | The Secretary shall be able to search available trips by date and route. |
| TIX-02 | The system shall display a visual seat map for the selected trip's bus, showing available, occupied, and locked seats. |
| TIX-03 | When a Secretary selects a seat, the system shall temporarily lock it using Redis with a configurable TTL (e.g., 5 minutes) to prevent double-selling. |
| TIX-04 | The system shall support selling tickets for any segment of the route (e.g., Santa Cruz → Los Negros, Los Negros → Comarapa, Santa Cruz → Comarapa). |
| TIX-05 | A seat shall be considered "occupied" only for the segment it was sold for. The same seat can be sold to different passengers on non-overlapping segments. |
| TIX-06 | The ticket shall capture: passenger name, ID number, origin stop, destination stop, seat number, price, payment method, and selling office. |
| TIX-07 | The system shall support cash and QR as payment methods. |
| TIX-08 | The system shall generate a printable/digital ticket receipt upon successful sale. |
| TIX-09 | The system shall prevent selling a seat that is already occupied or locked for an overlapping segment. |
| TIX-10 | The Secretary shall be able to cancel a ticket (with appropriate permissions and audit trail). |

### 4.6 Parcel / Encomienda Management

| ID | Requirement |
|----|-------------|
| ENC-01 | The Secretary shall be able to register a new encomienda with: sender name, sender phone, receiver name, receiver phone, origin office, destination office, description, weight/dimensions (optional), and declared value (optional). |
| ENC-02 | The system shall calculate the shipping rate based on origin, destination, and optionally weight. |
| ENC-03 | The system shall support three payment modalities: cash (paid at origin), QR (paid at origin), and "por cobrar" (collect on delivery — receiver pays at destination office). |
| ENC-04 | Each encomienda shall have a status: registered, in-transit, arrived, delivered, cancelled. |
| ENC-05 | The system shall assign encomiendas to a specific trip for transport. |
| ENC-06 | The destination office Secretary shall be able to mark an encomienda as "delivered" and collect payment if it is "por cobrar." |
| ENC-07 | The system shall generate a printable/digital receipt for each encomienda. |
| ENC-08 | The system shall maintain a searchable log of all encomiendas with filters by date, status, origin, and destination. |

### 4.7 Cash Register and Revenue Management

| ID | Requirement |
|----|-------------|
| CASH-01 | Each office shall have a daily cash register that tracks all income (ticket sales, encomienda payments, "por cobrar" collections). |
| CASH-02 | The Secretary shall open the cash register at the start of their shift with an initial balance and close it at the end with a final count. |
| CASH-03 | The system shall automatically record each transaction (sale or payment) in the corresponding office's cash register. |
| CASH-04 | The system shall track accumulated revenue per office, broken down by payment method (cash vs. QR). |
| CASH-05 | Fleet owners shall be able to view accumulated revenue across their offices (or all offices if applicable). |
| CASH-06 | The Administrator or authorized user shall be able to register a withdrawal when a fleet owner collects cash from an office. |
| CASH-07 | Each withdrawal shall record: amount, date, fleet owner, office, and the user who processed it. |
| CASH-08 | The system shall maintain a full audit trail of all cash register operations (deposits, sales, withdrawals). |

### 4.8 Reports and Analytics

| ID | Requirement |
|----|-------------|
| RPT-01 | The system shall generate monthly performance reports showing total passengers by office and route. |
| RPT-02 | The system shall generate monthly reports showing total encomiendas by office, destination, and status. |
| RPT-03 | The system shall generate revenue reports by office, payment method, and period (daily, weekly, monthly). |
| RPT-04 | The Administrator shall be able to view reports for any office or across all offices. |
| RPT-05 | The Secretary shall be able to view reports only for their own office. |
| RPT-06 | Reports shall be viewable in the UI and exportable to CSV or PDF. |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement |
|----|-------------|
| PERF-01 | Seat lock acquisition via Redis shall complete in < 100ms. |
| PERF-02 | Seat map rendering shall complete in < 1 second. |
| PERF-03 | Report generation for a single month shall complete in < 5 seconds. |
| PERF-04 | The system shall support at least 20 concurrent users across all offices without degradation. |

### 5.2 Security

| ID | Requirement |
|----|-------------|
| SEC-01 | All API endpoints shall require authentication (except login). |
| SEC-02 | Passwords shall be hashed using bcrypt. |
| SEC-03 | All communication shall use HTTPS in production. |
| SEC-04 | The system shall enforce role-based access at both the API and UI levels. |
| SEC-05 | All financial operations (sales, withdrawals) shall generate immutable audit log entries. |

### 5.3 Reliability

| ID | Requirement |
|----|-------------|
| REL-01 | Redis seat locks shall have a configurable TTL with automatic expiration to prevent orphaned locks. |
| REL-02 | The system shall handle Redis connection failures gracefully (fallback or retry). |
| REL-03 | Database transactions shall ensure data consistency for ticket sales and cash register operations. |

### 5.4 Usability

| ID | Requirement |
|----|-------------|
| USE-01 | The UI shall be responsive and optimized for tablet and desktop use (primary devices at office desks). |
| USE-02 | The seat selection interface shall be visual and intuitive (clickable seat map). |
| USE-03 | The system shall provide clear error messages in English. |
| USE-04 | Key workflows (sell ticket, register encomienda) shall be completable in < 5 clicks. |

### 5.5 Scalability

| ID | Requirement |
|----|-------------|
| SCA-01 | Adding a new office shall require only data configuration (no code deployment). |
| SCA-02 | Adding a new route shall require only data configuration. |
| SCA-03 | Adding a new bus category shall require only data configuration. |

---

## 6. Data Model — Key Entities

This is a high-level overview. The detailed database schema will be defined in a separate technical design document.

**Core entities:**
- **User** — id, username, password_hash, role, office_id, full_name, status
- **Office** — id, name, city, type (origin/intermediate/destination), status
- **Route** — id, name, status
- **RouteStop** — id, route_id, office_id, stop_order, distance_from_origin, base_fare
- **BusCategory** — id, name, description
- **Bus** — id, plate_number, category_id, owner_id, seat_layout (JSON), capacity, status
- **FleetOwner** — id, name, phone, email, status
- **Trip** — id, bus_id, route_id, driver_id, assistant_id, departure_date, departure_time, status
- **Ticket** — id, trip_id, passenger_name, passenger_id_number, origin_stop_id, destination_stop_id, seat_number, price, payment_method, selling_office_id, sold_by_user_id, status, created_at
- **Encomienda** — id, trip_id, sender_name, sender_phone, receiver_name, receiver_phone, origin_office_id, destination_office_id, description, weight, declared_value, shipping_rate, payment_method, payment_status, status, registered_by_user_id, created_at
- **CashRegister** — id, office_id, date, opened_by, initial_balance, closed_by, final_balance, status (open/closed)
- **CashTransaction** — id, cash_register_id, type (sale/encomienda_payment/por_cobrar_collection/withdrawal), amount, payment_method, reference_id, reference_type, created_at
- **Withdrawal** — id, office_id, fleet_owner_id, amount, processed_by_user_id, date, notes

---

## 7. API Structure (High-Level)

The API will follow RESTful conventions with the following resource groups:

- `POST /api/auth/login` — Authentication
- `/api/users` — User management (Administrador only)
- `/api/offices` — Office CRUD
- `/api/routes` — Route and stop management
- `/api/buses` — Bus and fleet management
- `/api/fleet-owners` — Fleet owner management
- `/api/trips` — Trip scheduling
- `/api/tickets` — Ticket sales and management
- `/api/tickets/seats/{trip_id}` — Seat availability and locking
- `/api/encomiendas` — Parcel registration and tracking
- `/api/cash-register` — Cash register operations
- `/api/withdrawals` — Fleet owner withdrawals
- `/api/reports` — Report generation

All endpoints will be protected by JWT authentication and role-based middleware.

---

## 8. UI Views (High-Level)

### Shared
- Login page
- Dashboard (role-specific)

### Administrator
- User management
- Office management
- Route and stop management
- Bus and fleet management
- Trip scheduling
- Global reports and analytics
- Cash register overview (all offices)
- Withdrawal management

### Secretary
- Trip search and ticket sales (with seat map)
- Encomienda registration
- Encomienda delivery and "por cobrar" collection
- Cash register (open/close, daily view)
- Office reports

### Driver
- Trip details and passenger manifest
- Parcel list for trip

### Assistant
- Passenger manifest
- Parcel management during trip
- Intermediate stop boarding verification

---

## 9. Technical Stack

| Component | Technology |
|-----------|------------|
| Backend API | FastAPI (Python) |
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Database | MySQL 8 |
| Cache / Seat Locking | Redis |
| Containerization | Docker Compose |
| Authentication | JWT (via python-jose or similar) |

---

## 10. Open Questions

1. What are the exact bus categories and their seat layouts? (Need specific configurations per category.)
2. What are the fare rates between each pair of stops? (Fixed or distance-based?)
3. What are the encomienda shipping rates? (Fixed, weight-based, or destination-based?)
4. Should the system support multiple shifts per day at each office?
5. What is the QR payment provider? (Simple QR image upload or integration with a payment gateway?)
6. Should "por cobrar" encomiendas be tied to a specific fleet owner's revenue or to the office?
7. Is there a maximum number of encomiendas per trip (bus cargo capacity)?

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-07 | Iden | Initial draft |

---

*This PRD is a living document and will be updated as requirements are clarified and refined.*
