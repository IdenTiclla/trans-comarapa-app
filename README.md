# Trans Comarapa

Sistema de gestión integral para la empresa de transporte Trans Comarapa. Esta aplicación permite administrar boletos, paquetes, viajes, rutas, conductores, asistentes y clientes.

## 📋 Descripción

Trans Comarapa es una aplicación web completa con backend en FastAPI y frontend en Nuxt.js que proporciona una solución integral para la gestión de una empresa de transporte. El sistema permite la administración de usuarios con diferentes roles (administradores, secretarias, conductores, asistentes y clientes), gestión de boletos, paquetes, viajes, rutas y más.

## 🚀 Estado Actual del Proyecto

### ✅ Funcionalidades Completadas

**Backend (API REST):**
- ✅ Sistema de autenticación JWT completo con múltiples roles
- ✅ CRUD completo para todas las entidades principales
- ✅ Endpoints de estadísticas y reportes básicos
- ✅ Sistema de gestión de usuarios por roles
- ✅ Modelos de base de datos completamente implementados
- ✅ Validaciones de datos con Pydantic
- ✅ Documentación automática con OpenAPI/Swagger
- ✅ Sistema de migraciones con Alembic
- ✅ Configuración de CORS para integración frontend

**Frontend (Aplicación Web):**
- ✅ Sistema de autenticación completo
- ✅ Dashboard funcional para secretarias
- ✅ Dashboard básico para administradores
- ✅ Gestión completa de viajes (listado, filtros, creación, edición)
- ✅ Sistema de venta de boletos con selección de asientos
- ✅ Componentes reutilizables (botones, tarjetas, tablas, formularios)
- ✅ Diseño responsive con Tailwind CSS
- ✅ Integración completa con la API backend
- ✅ Navegación dinámica según rol de usuario
- ✅ Estadísticas en tiempo real

### 🔄 En Desarrollo

- 🔄 Gestión completa de paquetes (parcialmente implementada)
- 🔄 Dashboards específicos para conductores, asistentes y clientes
- 🔄 Sistema de reportes avanzados
- 🔄 Funcionalidades offline básicas

### 📊 Estadísticas del Proyecto

**Backend:**
- **Modelos implementados**: 15/15 (100%)
- **Endpoints CRUD**: 85/97 (87%)
- **Endpoints de estadísticas**: 8/8 (100%)
- **Pruebas unitarias**: 25/35 (71%)

**Frontend:**
- **Componentes base**: 12/15 (80%)
- **Páginas principales**: 18/25 (72%)
- **Dashboards por rol**: 2/5 (40%)
- **Integración con API**: 90% completada

## 🏗️ Estructura del Proyecto

El proyecto está organizado en dos componentes principales:

```
trans-comarapa-app/
├── backend/         # API REST con FastAPI
│   ├── models/      # Modelos SQLAlchemy (15 entidades)
│   ├── routes/      # Endpoints organizados por dominio
│   ├── schemas/     # Esquemas Pydantic para validación
│   ├── auth/        # Sistema de autenticación JWT
│   └── db/          # Configuración y migraciones de BD
├── frontend/        # Aplicación web con Nuxt.js
│   ├── pages/       # Páginas de la aplicación
│   ├── components/  # Componentes reutilizables (18)
│   ├── stores/      # Gestión de estado con Pinia (12 stores)
│   ├── services/    # Servicios para comunicación con API (14)
│   └── layouts/     # Layouts responsive
└── docs/           # Documentación técnica y diagramas
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y de alto rendimiento para Python
- **SQLAlchemy**: ORM para interactuar con la base de datos
- **Pydantic**: Validación de datos y configuración
- **JWT**: Autenticación basada en tokens
- **MySQL**: Base de datos relacional
- **Alembic**: Migraciones de base de datos

### Frontend
- **Nuxt.js**: Framework basado en Vue.js para aplicaciones universales
- **Tailwind CSS**: Framework de CSS utilitario
- **Pinia**: Gestión de estado para Vue.js
- **Vue Router**: Enrutamiento para aplicaciones Vue.js

## 📋 Requisitos Previos

- Python 3.8+
- Node.js 16+
- MySQL
- Entorno virtual de Python (recomendado)

## 🚀 Instalación y Configuración

### Backend

1. Navega al directorio del backend:
   ```bash
   cd backend
   ```

2. Crea y activa un entorno virtual:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # En Windows: .venv\Scripts\activate
   ```

3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones
   ```

5. Ejecuta las migraciones:
   ```bash
   alembic upgrade head
   ```

6. Inicia el servidor de desarrollo:
   ```bash
   python run.py
   ```

### Frontend

1. Navega al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🔍 Uso

Una vez que ambos servidores estén en funcionamiento:

- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000

## ✨ Características Principales

- **Sistema de autenticación avanzado**: JWT con soporte para múltiples roles y refresh tokens
- **Gestión de usuarios**: Administradores, secretarias, conductores, asistentes y clientes
- **Gestión de boletos**: Venta con selección de asientos, impresión de boletos
- **Gestión de viajes**: Programación, asignación de personal, filtros avanzados
- **Gestión de rutas**: Creación y administración de rutas y paradas
- **Dashboard en tiempo real**: Estadísticas actualizadas por rol
- **Sistema de paquetes**: Registro, seguimiento y estado de paquetes
- **Diseño responsive**: Optimizado para desktop, tablet y móvil
- **API RESTful completa**: Documentación automática con Swagger

## 🔐 Sistema de Autenticación y Roles

El sistema implementa un robusto mecanismo de autenticación basado en JWT con soporte para múltiples roles:

- **Administradores**: Acceso completo al sistema, gestión de usuarios y configuración
- **Secretarias**: Venta de boletos, gestión de paquetes, atención al cliente, estadísticas
- **Conductores**: Gestión de viajes asignados y pasajeros (dashboard en desarrollo)
- **Asistentes**: Apoyo en viajes, atención a pasajeros y control de paquetes (dashboard en desarrollo)
- **Clientes**: Consulta de boletos, seguimiento de paquetes y perfil personal (dashboard en desarrollo)

Cada rol tiene acceso a funcionalidades específicas y una interfaz adaptada a sus necesidades.

### Funcionalidades por Rol Implementadas

**Secretarias (100% completado):**
- Dashboard completo con estadísticas en tiempo real
- Venta de boletos con selección de asientos
- Gestión de viajes (crear, editar, listar)
- Acceso a clientes y paquetes
- Reportes de ventas

**Administradores (60% completado):**
- Dashboard básico con accesos rápidos
- Gestión de usuarios (en desarrollo)
- Configuración del sistema (planificado)
- Reportes avanzados (planificado)

**Otros roles (20% completado):**
- Estructura básica de dashboards creada
- Funcionalidades específicas en desarrollo

## 📡 API Endpoints Principales

### Autenticación y Usuarios
- `POST /api/v1/auth/login`: Iniciar sesión con múltiples roles
- `POST /api/v1/auth/logout`: Cerrar sesión con invalidación de token
- `POST /api/v1/auth/refresh`: Renovar token de acceso

### Gestión de Entidades
- **Usuarios**: CRUD completo para todos los tipos de usuario
- **Boletos**: `POST /api/v1/tickets`, `GET /api/v1/tickets`, gestión de estados
- **Viajes**: `POST /api/v1/trips`, `GET /api/v1/trips`, filtros avanzados
- **Paquetes**: `POST /api/v1/packages`, seguimiento de estados
- **Rutas**: Gestión completa de rutas y paradas

### Estadísticas y Reportes
- `GET /api/v1/stats/dashboard`: Estadísticas consolidadas
- `GET /api/v1/stats/tickets/stats`: Estadísticas de boletos
- `GET /api/v1/stats/packages/stats`: Estadísticas de paquetes
- `GET /api/v1/stats/trips/stats`: Estadísticas de viajes
- `GET /api/v1/stats/sales/recent`: Ventas recientes
- `GET /api/v1/stats/sales/summary`: Resumen de ventas por período

Para una lista completa de endpoints, consulta la documentación de la API en `/docs`.

## 🎯 Roadmap y Próximos Pasos

### Prioridad Alta (Q1 2024)
- [ ] Completar dashboards para conductores, asistentes y clientes
- [ ] Sistema completo de gestión de paquetes
- [ ] Reportes avanzados y exportación PDF/Excel
- [ ] Optimización de rendimiento y UX

### Prioridad Media (Q2 2024)
- [ ] Sistema de notificaciones en tiempo real
- [ ] Modo offline para operaciones críticas
- [ ] Integración con sistemas de pago
- [ ] App móvil (PWA)

### Prioridad Baja (Q3-Q4 2024)
- [ ] Sistema de geolocalización de buses
- [ ] Chatbot de atención al cliente
- [ ] Análisis predictivo de demanda
- [ ] Integración con APIs externas

## 👥 Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 📞 Contacto

Trans Comarapa - [info@transcomarapa.com](mailto:info@transcomarapa.com)

---

Desarrollado con ❤️ para Trans Comarapa
