# Trans Comarapa

Sistema de gestión integral para la empresa de transporte Trans Comarapa. Esta aplicación permite administrar boletos, paquetes, viajes, rutas, conductores, asistentes y clientes.

## 📋 Descripción

Trans Comarapa es una aplicación web completa con backend en FastAPI y frontend en Nuxt.js que proporciona una solución integral para la gestión de una empresa de transporte. El sistema permite la administración de usuarios con diferentes roles (administradores, secretarias, conductores, asistentes y clientes), gestión de boletos, paquetes, viajes, rutas y más.

## 🏗️ Estructura del Proyecto

El proyecto está organizado en dos componentes principales:

```
trans-comarapa-app/
├── backend/         # API REST con FastAPI
└── frontend/        # Aplicación web con Nuxt.js
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y de alto rendimiento para Python
- **SQLAlchemy**: ORM para interactuar con la base de datos
- **Pydantic**: Validación de datos y configuración
- **JWT**: Autenticación basada en tokens
- **PostgreSQL**: Base de datos relacional
- **Alembic**: Migraciones de base de datos

### Frontend
- **Nuxt.js**: Framework basado en Vue.js para aplicaciones universales
- **Tailwind CSS**: Framework de CSS utilitario
- **Pinia**: Gestión de estado para Vue.js
- **Vue Router**: Enrutamiento para aplicaciones Vue.js

## 📋 Requisitos Previos

- Python 3.8+
- Node.js 16+
- PostgreSQL
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

- **Sistema de autenticación**: JWT con soporte para múltiples roles
- **Gestión de usuarios**: Administradores, secretarias, conductores, asistentes y clientes
- **Gestión de boletos**: Venta, reserva y cancelación de boletos
- **Gestión de paquetes**: Envío, seguimiento y entrega de paquetes
- **Gestión de viajes**: Programación, asignación de conductores y asistentes
- **Gestión de rutas**: Creación y administración de rutas y paradas
- **Paneles específicos por rol**: Interfaces adaptadas a las necesidades de cada tipo de usuario

## 🔐 Sistema de Autenticación y Roles

El sistema implementa un robusto mecanismo de autenticación basado en JWT con soporte para múltiples roles:

- **Administradores**: Acceso completo al sistema, gestión de usuarios y configuración
- **Secretarias**: Venta de boletos, gestión de paquetes y atención al cliente
- **Conductores**: Gestión de viajes asignados y pasajeros
- **Asistentes**: Apoyo en viajes, atención a pasajeros y control de paquetes
- **Clientes**: Consulta de boletos, seguimiento de paquetes y perfil personal

Cada rol tiene acceso a funcionalidades específicas y una interfaz adaptada a sus necesidades.

### Modelo de Datos de Usuarios

El sistema utiliza un modelo de datos unificado para los usuarios, donde cada tipo de usuario (Administrador, Secretaria, Conductor, Asistente, Cliente) tiene:

1. Un registro en la tabla `users` con la información básica de autenticación
2. Un registro en su tabla específica (administrators, secretaries, drivers, assistants, clients) con los datos particulares de ese rol

Esta arquitectura permite una gestión eficiente de la autenticación y autorización, manteniendo la especialización de cada tipo de usuario.

## 📡 API Endpoints Principales

### Autenticación
- `POST /api/v1/auth/login`: Iniciar sesión
- `POST /api/v1/auth/logout`: Cerrar sesión

### Usuarios
- `POST /api/v1/administrators`: Crear administrador
- `POST /api/v1/secretaries`: Crear secretaria
- `POST /api/v1/drivers`: Crear conductor
- `POST /api/v1/assistants`: Crear asistente
- `POST /api/v1/clients`: Crear cliente

### Boletos
- `POST /api/v1/tickets`: Crear boleto
- `GET /api/v1/tickets`: Listar boletos
- `GET /api/v1/tickets/{id}`: Obtener boleto por ID

### Paquetes
- `POST /api/v1/packages`: Crear paquete
- `GET /api/v1/packages`: Listar paquetes
- `GET /api/v1/packages/{id}`: Obtener paquete por ID

### Viajes
- `POST /api/v1/trips`: Crear viaje
- `GET /api/v1/trips`: Listar viajes
- `GET /api/v1/trips/{id}`: Obtener viaje por ID

Para una lista completa de endpoints, consulta la documentación de la API en `/docs`.

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
