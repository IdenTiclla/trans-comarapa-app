# Arquitectura del Sistema - Trans Comarapa

## Vista General

El sistema Trans Comarapa está basado en una arquitectura en capas, compuesta por:

- **Frontend:** Aplicación web desarrollada con Nuxt.js (Vue.js), que consume la API REST del backend.
- **Backend:** API RESTful construida con FastAPI (Python), que gestiona la lógica de negocio, autenticación/autorización y acceso a datos.
- **Base de Datos:** MySQL, gestionada mediante SQLAlchemy y migraciones con Alembic.

## Componentes Principales

### Frontend (Nuxt.js)
- Páginas y componentes Vue.
- Gestión de estado con Pinia.
- Comunicación con backend vía servicios (fetch/axios).
- Autenticación basada en JWT.
- Tailwind CSS para estilos.

### Backend (FastAPI)
- **Rutas (Endpoints):** Organizadas por dominio (usuarios, boletos, viajes, etc.).
- **Modelos:** SQLAlchemy para persistencia, Pydantic para validación.
- **Servicios:** Lógica de negocio separada de las rutas.
- **Autenticación:** JWT, roles y permisos.
- **Migraciones:** Alembic.
- **Documentación:** OpenAPI/Swagger generada automáticamente.

### Base de Datos (MySQL)
- **Descripción:** Almacena todos los datos persistentes de la aplicación, como usuarios, boletos, rutas, etc.
- **Tecnología:** MySQL.
- **Interacción:** El backend interactúa con la base de datos a través de SQLAlchemy (ORM). Alembic se utiliza para gestionar las migraciones del esquema de la base de datos.

## Diagrama de Componentes

El siguiente diagrama muestra la interacción entre los principales componentes del sistema:

```mermaid
flowchart TB

    %% Frontend
    subgraph Frontend ["Frontend (Nuxt.js App)"]
        FE1["Pages & Components"]
        FE2["Pinia Store"]
        FE3["Services (API calls)"]
    end

    %% Backend
    subgraph Backend ["Backend (FastAPI App)"]
        BE1["API Routers"]
        BE2["Business Services"]
        BE3["Auth (JWT)"]
        BE4["SQLAlchemy Models"]
        BE5["Pydantic Schemas"]
        BE6["Alembic Migrations"]
    end

    %% Database
    subgraph Database ["Database (MySQL)"]
        DB1["Tables"]
    end

    %% Relaciones
    FE1 --> FE2
    FE1 --> FE3
    FE3 -- "HTTP/REST" --> BE1
    BE1 --> BE2
    BE1 --> BE3
    BE2 --> BE4
    BE2 --> BE5
    BE4 -- "ORM" --> DB1
    BE6 -- "Migrations" --> DB1
```

## Otros Aspectos Clave

- **Docker:** Para desarrollo y despliegue consistente.
- **CI/CD:** Automatización de tests y despliegues.
- **Testing:** Pytest para backend, Vitest/Jest para frontend.
- **Documentación:** Centralizada en `/docs`.

---