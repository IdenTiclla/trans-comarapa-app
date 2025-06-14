# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trans Comarapa is a comprehensive transportation management system with:
- **Backend**: FastAPI-based REST API with JWT authentication and MySQL database
- **Frontend**: Nuxt.js application with Vue 3, Tailwind CSS, and Pinia state management
- **Architecture**: Layered architecture with role-based access control (5 roles: Admin, Secretary, Driver, Assistant, Client)

## Development Commands

### Quick Setup (Docker - Recommended)
```bash
make setup          # Complete project setup with database seeding
make up             # Start all services in development mode
make down           # Stop all services
make logs-f         # View real-time logs
```

### Backend Development
```bash
cd backend
uv sync             # Install dependencies with exact versions
source .venv/bin/activate  # Activate virtual environment
python run.py       # Start FastAPI server (localhost:8000)

# Testing
pytest              # Run all tests
pytest -v           # Verbose test output
pytest --cov=.      # Run with coverage
pytest tests/unit/test_auth.py  # Run specific test file

# Database operations
python db/seed.py   # Populate database with development data
```

### Frontend Development
```bash
cd frontend
npm install         # Install dependencies
npm run dev         # Start Nuxt dev server (localhost:3000)
npm run build       # Build for production
npm run preview     # Preview production build
```

## Project Architecture

### Backend Structure (FastAPI)
- **API Versioning**: All endpoints prefixed with `/api/v1/`
- **Models**: 15 SQLAlchemy entities with complete relationships
- **Routes**: Organized by domain (auth, users, trips, tickets, etc.)
- **Schemas**: Pydantic validation for all entities
- **Authentication**: JWT with refresh tokens and role-based access control

### Frontend Structure (Nuxt.js)
- **Pages**: Role-specific dashboards and feature pages
- **Components**: 22+ reusable components
- **Stores**: 12 Pinia stores for state management
- **Services**: 14 API service modules
- **Layouts**: Dynamic layouts based on authentication state

### Key Entities and Relationships
```
Users (base authentication)
├── Administrators, Secretaries, Drivers, Assistants, Clients

Transportation Operations
├── Buses → Seats (one-to-many)
├── Routes → Locations (many-to-many)
├── Trips → (Bus, Route, Driver, Assistant)
├── Tickets → (Trip, Client, Seat, Secretary)
└── Packages → (Trip, Sender, Recipient, Secretary)
```

## Role-Based Features

### Secretaries (100% implemented)
- Complete dashboard with real-time statistics
- Trip management (CRUD with filters)
- Ticket sales with visual seat selection
- Modernized ticket management page with advanced filters

### Administrators (70% implemented)
- Basic dashboard with quick actions
- User management access
- Full ticket management capabilities

### Other Roles (25% implemented)
- Basic dashboard structures exist
- Role-specific features in development

## Important Patterns and Conventions

### Authentication Flow
1. Login via `/api/v1/auth/login` returns access + refresh tokens
2. Frontend stores tokens in Pinia auth store
3. All protected routes use auth middleware
4. Token refresh handled automatically

### API Integration
- Base URL configured via `NUXT_PUBLIC_API_BASE_URL` environment variable
- All API calls use consistent error handling
- Services follow naming convention: `[entity]Service.js`

### Database Migrations
- Alembic handles schema migrations
- Models use SQLAlchemy 2.0+ syntax
- All entities inherit from `Base` class

### Component Architecture
- Composition API used throughout Vue components
- Props validation using TypeScript-style definitions
- Reusable form components in `components/forms/`

## Environment Configuration

### Required Environment Variables
**Backend (.env)**:
```env
DATABASE_URL=sqlite:///./trans_comarapa.db  # or MySQL connection string
SECRET_KEY=your-secret-key
DEBUG=True
```

**Frontend (.env)**:
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Testing Strategy

### Backend Tests
- Located in `backend/tests/`
- Markers: `@pytest.mark.unit`, `@pytest.mark.integration`
- Configuration in `pytest.ini`
- Test database uses separate connection string

### Frontend Testing
- Currently basic structure in place
- Plans for component and integration tests

## Development Workflow

### Adding New Features
1. Backend: Create model → schema → route → test
2. Frontend: Create service → store → component → page
3. Always update both ends for complete features

### Database Changes
1. Modify models in `backend/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Apply: `alembic upgrade head`

### API Development
- Follow REST conventions
- Use proper HTTP status codes
- Include comprehensive error handling
- Update OpenAPI documentation automatically

## Performance Considerations

- Backend responses average < 200ms
- Frontend bundle size ~1.2MB
- Database queries optimized to avoid N+1 problems
- Pagination implemented for large datasets

## Project Status

- **Overall Completion**: 75%
- **Backend API**: 85% complete (85+ endpoints)
- **Frontend Core**: 65% complete (secretary workflow fully functional)
- **Testing Coverage**: 70%
- **Documentation**: Architecture and API docs complete

The system is production-ready for secretary operations and has a solid foundation for expanding other user roles.