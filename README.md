# Trans Comarapa - Transportation Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Nuxt.js](https://img.shields.io/badge/Nuxt.js-3.13+-00DC82?style=flat&logo=nuxt.js)](https://nuxt.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive web-based transportation management system for Trans Comarapa, featuring real-time operations, multi-role user management, and modern UI/UX design.

## 🌟 Project Overview

Trans Comarapa is a full-stack web application built with FastAPI (backend) and Nuxt.js (frontend) that provides an integrated solution for managing a transportation company. The system enables efficient management of users with different roles (administrators, secretaries, drivers, assistants, and clients), ticket sales, package handling, trip scheduling, route management, and real-time analytics.

**Live Demo**: [Coming Soon]  
**Documentation**: [/docs](/docs)  
**API Docs**: `http://localhost:8000/docs` (when running locally)

## 📊 Project Status

- **Overall Progress**: 78% Complete
- **Backend**: 95% Complete ✅
- **Frontend**: 78% Complete 🔄
- **Testing Coverage**: 70%
- **Production Ready**: Q2 2025

## ✨ Key Features

### 🔐 Advanced Authentication System
- JWT-based authentication with refresh tokens
- Multi-role authorization (5 user types)
- Token blacklisting for secure logout
- Brute-force protection and rate limiting
- Role-based access control (RBAC)

### 🎫 Ticket Management
- Visual seat selection with real-time availability
- Dual view mode (card/table layout)
- Advanced filtering (date, payment method, status)
- Real-time statistics with percentages
- CSV data export functionality
- Modern UI with gradients and animations
- Multi-field search capabilities

### 🚌 Trip Management
- Complete CRUD operations
- Advanced filtering and pagination
- Driver and assistant assignment
- Trip status tracking (scheduled, in progress, completed, cancelled)
- Real-time updates

### 📦 Package Management
- Package registration and tracking
- State history logging
- Sender and recipient management
- Package receipt generation
- Real-time status updates

### 📊 Analytics & Reporting
- Real-time dashboard statistics
- Sales reports and summaries
- Trip occupancy analytics
- Revenue tracking
- Export to CSV/PDF
- Customizable date ranges

### 👥 Role-Based Dashboards
- **Secretaries**: Complete operational dashboard (100% functional)
- **Administrators**: System management dashboard (70% functional)
- **Drivers**: Trip management dashboard (in development)
- **Assistants**: Support operations dashboard (in development)
- **Clients**: Personal ticket tracking (in development)

## 🏗️ Architecture

### Technology Stack

**Backend**
- **Framework**: FastAPI 0.115+ (Python 3.12+)
- **ORM**: SQLAlchemy 2.0+
- **Validation**: Pydantic
- **Authentication**: JWT (python-jose)
- **Database**: MySQL
- **Migrations**: Alembic
- **Caching**: Redis (for token blacklist)
- **Testing**: Pytest with 70% coverage

**Frontend**
- **Framework**: Nuxt.js 3.13+ (Vue.js 3.5+)
- **State Management**: Pinia
- **Styling**: Tailwind CSS 3
- **Icons**: Heroicons
- **Charts**: Chart.js + Vue-ChartJS
- **HTTP Client**: Fetch API
- **Testing**: Vitest

**DevOps**
- **Containerization**: Docker & Docker Compose
- **Package Management**: UV (Python), NPM (Node.js)
- **Version Control**: Git
- **CI/CD**: Planned (GitHub Actions)

### Project Structure

```
trans-comarapa-app/
├── backend/                    # FastAPI REST API
│   ├── models/                # SQLAlchemy models (15 entities)
│   ├── routes/                # API endpoints by domain
│   ├── schemas/               # Pydantic schemas for validation
│   ├── auth/                  # JWT authentication & authorization
│   ├── db/                    # Database config & migrations
│   └── tests/                 # Unit, integration & regression tests
├── frontend/                   # Nuxt.js web application
│   ├── pages/                 # Application pages
│   ├── components/            # Reusable Vue components (54+)
│   ├── stores/                # Pinia state management (13 stores)
│   ├── services/              # API communication layer (17 services)
│   ├── composables/           # Vue composables
│   ├── middleware/            # Route guards & auth
│   └── layouts/               # Page layouts
└── docs/                      # Technical documentation & diagrams
```

### Database Schema

**Core Entities (15 models)**
```
Users (base authentication)
├── Administrators
├── Secretaries
├── Drivers
├── Assistants
└── Clients

Transport Operations
├── Buses → Seats
├── Routes → Locations
├── Trips → (Bus, Route, Driver, Assistant)
├── Tickets → (Trip, Client, Seat, Secretary)
└── Packages → (Trip, Sender, Recipient, Secretary)

Support Entities
├── Locations (terminals)
├── Offices
└── Activities (audit log)
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.12+** (with UV package manager)
- **Node.js 16+** and NPM
- **MySQL 8.0+**
- **Redis** (optional, for token blacklist)
- **Docker & Docker Compose** (optional, for containerized setup)

### Option 1: Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/trans-comarapa-app.git
cd trans-comarapa-app

# Setup and run everything
make setup
```

This will:
- Set up MySQL database
- Create virtual environments
- Install all dependencies
- Run database migrations
- Seed initial data
- Start both backend and frontend servers

### Option 2: Manual Installation

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install UV (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
uv run alembic upgrade head

# Seed database with initial data
uv run python db/seed.py

# Start development server
uv run python run.py
# API will be available at http://localhost:8000
# API documentation at http://localhost:8000/docs
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your backend API URL

# Start development server
npm run dev
# Application will be available at http://localhost:3000
```

## 📖 Usage

### API Endpoints

**Authentication**
```
POST   /api/v1/auth/login      # User login
POST   /api/v1/auth/logout     # User logout (invalidates token)
POST   /api/v1/auth/refresh    # Refresh access token
```

**User Management**
```
GET    /api/v1/users                  # List all users
POST   /api/v1/administrators         # Create administrator
POST   /api/v1/secretaries           # Create secretary
POST   /api/v1/drivers               # Create driver
POST   /api/v1/assistants            # Create assistant
POST   /api/v1/clients               # Create client
```

**Trips**
```
GET    /api/v1/trips                 # List trips (with filters)
POST   /api/v1/trips                 # Create trip
GET    /api/v1/trips/{id}            # Get trip details
PUT    /api/v1/trips/{id}            # Update trip
DELETE /api/v1/trips/{id}            # Delete trip
```

**Tickets**
```
GET    /api/v1/tickets               # List tickets
POST   /api/v1/tickets               # Create ticket (sell)
GET    /api/v1/tickets/{id}          # Get ticket details
PUT    /api/v1/tickets/{id}          # Update ticket
DELETE /api/v1/tickets/{id}          # Cancel ticket
```

**Statistics**
```
GET    /api/v1/stats/dashboard       # Consolidated statistics
GET    /api/v1/stats/tickets/stats   # Ticket analytics
GET    /api/v1/stats/packages/stats  # Package analytics
GET    /api/v1/stats/trips/stats     # Trip analytics
GET    /api/v1/stats/sales/recent    # Recent sales
GET    /api/v1/stats/sales/summary   # Sales summary by period
```

For complete API documentation, visit `/docs` endpoint when running the backend.

### Default Credentials (Development)

```
Administrator:
  Email: admin@transcomarapa.com
  Password: admin123

Secretary:
  Email: secretary@transcomarapa.com
  Password: secretary123
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
make test

# Run unit tests only
make test-unit

# Run integration tests
make test-integration

# Run regression tests
make test-regression

# Run with coverage
pytest --cov=. --cov-report=html
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm run test

# Run unit tests
npm run test:unit

# Run with coverage
npm run test:coverage
```

## 📈 Project Metrics

### Code Statistics
- **Total Lines of Code**: ~34,000
- **Backend**: ~18,000 lines (Python)
- **Frontend**: ~16,000 lines (Vue/JavaScript)
- **Components**: 54+ reusable components
- **API Endpoints**: 90+ RESTful endpoints
- **Database Models**: 15 entities

### Functionality Coverage
- **Core Business Logic**: 95%
- **User Interface**: 78%
- **Advanced Features**: 45%
- **Testing Coverage**: 70%

### Performance
- **Average API Response Time**: <200ms
- **Frontend Bundle Size**: ~1.2MB
- **Database Query Optimization**: Ongoing
- **Concurrent Users Supported**: 100+

## 🎯 Roadmap

### Q1 2025 - Dashboard Completion
- [ ] Complete driver dashboard
- [ ] Complete assistant dashboard
- [ ] Complete client dashboard
- [ ] Advanced reporting with interactive charts

### Q2 2025 - Advanced Features
- [ ] Real-time notifications system
- [ ] Offline mode for critical operations
- [ ] Payment gateway integration
- [ ] Progressive Web App (PWA)
- [ ] Production deployment

### Q3 2025 - Optimization & Scaling
- [ ] GPS bus tracking
- [ ] Predictive demand analysis (ML)
- [ ] External API integrations
- [ ] Advanced performance optimization
- [ ] Kubernetes deployment

### Q4 2025 - Mobile & AI
- [ ] Native mobile app (React Native)
- [ ] AI-powered chatbot for customer service
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)

## 🛠️ Development

### Available Commands

**Backend**
```bash
make run          # Start backend server
make test         # Run all tests
make clean        # Clean cache and temp files
make migrate      # Run database migrations
make seed         # Seed database with sample data
```

**Frontend**
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm test          # Run tests
```

**Full Stack**
```bash
make setup        # Complete project setup
make dev          # Start both backend and frontend
make clean-all    # Clean entire project
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](backend/CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 Documentation

- **[Architecture](docs/architecture.md)**: System architecture overview
- **[API Documentation](http://localhost:8000/docs)**: Interactive API docs (Swagger UI)
- **[Testing Guide](docs/TESTING.md)**: Comprehensive testing documentation
- **[Project Status](docs/project-status.md)**: Detailed project status and metrics
- **[State Diagrams](docs/state-diagrams/)**: Business logic state machines

## 🐛 Known Issues & Limitations

- Package management frontend is partially implemented (50% complete)
- Driver, assistant, and client dashboards are under development
- Advanced reporting features are in progress
- CI/CD pipeline is planned but not yet implemented
- Mobile-responsive design is 95% complete

## 🤝 Support

For issues, questions, or contributions:
- **Issues**: [GitHub Issues](https://github.com/yourusername/trans-comarapa-app/issues)
- **Email**: info@transcomarapa.com
- **Documentation**: [/docs](/docs)

## 👨‍💻 Author

**Your Name**
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- FastAPI team for the excellent framework
- Nuxt.js team for the amazing Vue.js framework
- Trans Comarapa for the project opportunity
- Open-source community for the incredible tools

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **API Documentation**: http://localhost:8000/docs
- **Frontend Application**: http://localhost:3000
- **Project Documentation**: [/docs](/docs)
- **Issue Tracker**: GitHub Issues

---

**Built with ❤️ for Trans Comarapa**

*Last Updated: October 2025*  
*Version: 1.0.0*  
*Status: Active Development*
