# Backend - Trans Comarapa

API REST para la gestión de boletos, paquetes y viajes desarrollada con FastAPI. Este sistema permite administrar la operación de una empresa de transporte, incluyendo la gestión de buses, conductores, asistentes, rutas, viajes, boletos y paquetes.

## Tecnologías Principales

- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy**: ORM para la base de datos
- **Pydantic**: Validación de datos
- **UV**: Gestor de paquetes moderno para Python
- **JWT**: Autenticación basada en tokens
- **Faker**: Generación de datos falsos para desarrollo y pruebas

## Requisitos previos

- Python 3.12+
  - El proyecto incluye un archivo `.python-version` que especifica la versión 3.12.0
  - Este archivo es reconocido automáticamente por herramientas como uv, pyenv y otras
- uv (gestor de paquetes moderno para Python)
  - Instalación: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- Base de datos compatible con SQLAlchemy:
  - SQLite (para desarrollo local, no requiere configuración adicional)
  - MySQL/MariaDB (recomendado para producción)
  - PostgreSQL (alternativa para producción)
- Git (para clonar el repositorio)
- Docker y Docker Compose (opcional, para ejecución en contenedores)

## Configuración del Entorno de Desarrollo

### Clonar el repositorio

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/trans-comarapa-app.git
cd trans-comarapa-app
```

### Configurar el entorno virtual

1. Asegúrate de estar en el directorio backend:
```bash
cd backend
```

2. Crear entorno virtual con uv:
```bash
# uv detectará automáticamente la versión 3.12.0 del archivo .python-version
uv venv

# O especificar explícitamente la versión de Python:
uv venv --python=3.12.0
```

3. Activar el entorno virtual:
```bash
# En Linux/Mac
source .venv/bin/activate

# En Windows (PowerShell)
.venv\Scripts\Activate.ps1

# En Windows (CMD)
.venv\Scripts\activate.bat
```

### Instalar dependencias

Tienes dos opciones para instalar las dependencias:

**Opción 1 (recomendada)**: Usar uv sync para instalar versiones exactas:
```bash
uv sync
```

**Opción 2**: Instalar con posibles actualizaciones de versiones:
```bash
uv pip install .
```

### Configurar variables de entorno

1. Crea un archivo `.env` en el directorio `backend` basado en el archivo `.env.example`:
```bash
cp .env.example .env
```

2. Edita el archivo `.env` según tus necesidades:

```env
# Para desarrollo local con SQLite (más simple)
DATABASE_URL="sqlite:///./trans_comarapa.db"

# O para MySQL/MariaDB
# DATABASE_URL="mysql+pymysql://usuario:contraseña@localhost:3306/trans_comarapa"

# Configuración de seguridad
SECRET_KEY="tu-clave-secreta-aqui"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Modo de depuración
DEBUG=True
```

### Crear la base de datos

Si estás usando SQLite, la base de datos se creará automáticamente al iniciar la aplicación.

Si estás usando MySQL/MariaDB, debes crear la base de datos manualmente:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE trans_comarapa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON trans_comarapa.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Generar datos falsos para desarrollo

El proyecto incluye un script para generar datos falsos que facilitan el desarrollo y las pruebas. Este script crea usuarios, clientes, conductores, asistentes, secretarios, administradores, buses, rutas, viajes, tickets y paquetes con datos realistas.

Para ejecutar el script:

```bash
# Asegúrate de estar en el directorio backend y tener el entorno virtual activado
source .venv/bin/activate

# Ejecuta el script de seed
python db/seed.py
```

El script utiliza la biblioteca Faker para generar datos realistas en español, como nombres, direcciones, correos electrónicos, etc. Los datos generados incluyen:

- Un administrador con credenciales únicas
- 5 secretarios con credenciales únicas
- 5 conductores con credenciales únicas
- 5 asistentes con credenciales únicas
- 10 clientes con credenciales únicas
- 5 ubicaciones (terminales) en diferentes ciudades
- 5 oficinas asociadas a estas ubicaciones
- 5 rutas entre diferentes ubicaciones
- 5 buses con diferentes modelos y capacidades
- 20 viajes programados para los próximos 30 días
- Múltiples tickets para los viajes
- Múltiples paquetes para los viajes

## Estructura del Proyecto

```
.
├── __init__.py            # Archivo de inicialización del paquete
├── main.py                # Punto de entrada de la aplicación
├── run.py                 # Script para ejecutar la aplicación
├── pyproject.toml         # Configuración del proyecto y dependencias
├── setup.py               # Script de instalación para pip
├── .python-version        # Especifica la versión de Python (3.12.0)
├── .env                   # Variables de entorno (no incluido en el repositorio)
├── .env.example           # Ejemplo de variables de entorno
├── db/                    # Configuración de la base de datos
│   ├── __init__.py
│   ├── base.py            # Configuración base de SQLAlchemy
│   ├── session.py         # Gestión de sesiones de DB
│   ├── seed.py            # Script para poblar la base de datos con datos iniciales
│   └── create_database.py # Script para crear la base de datos
├── models/                # Modelos SQLAlchemy (definición de tablas)
│   ├── __init__.py
│   ├── administrator.py   # Modelo de administradores
│   ├── assistant.py       # Modelo de asistentes
│   ├── bus.py             # Modelo de buses
│   ├── client.py          # Modelo de clientes
│   ├── driver.py          # Modelo de conductores
│   ├── location.py        # Modelo de ubicaciones
│   ├── office.py          # Modelo de oficinas
│   ├── package.py         # Modelo de paquetes
│   ├── person.py          # Modelo base abstracto para personas
│   ├── route.py           # Modelo de rutas
│   ├── seat.py            # Modelo de asientos
│   ├── secretary.py       # Modelo de secretarios
│   ├── ticket.py          # Modelo de boletos
│   ├── trip.py            # Modelo de viajes
│   └── user.py            # Modelo de usuarios para autenticación
├── api/                   # Versionado de la API
│   ├── __init__.py
│   └── v1/                # Versión 1 de la API
│       ├── __init__.py
│       └── api.py         # Router principal para la versión 1
├── routes/                # Rutas de la API (endpoints)
│   ├── __init__.py
│   ├── administrator.py   # Endpoints de administradores
│   ├── assistant.py       # Endpoints de asistentes
│   ├── auth.py            # Endpoints de autenticación y gestión de usuarios
│   ├── bus.py             # Endpoints de buses
│   ├── client.py          # Endpoints de clientes
│   ├── driver.py          # Endpoints de conductores
│   ├── location.py        # Endpoints de ubicaciones
│   ├── office.py          # Endpoints de oficinas
│   ├── package.py         # Endpoints de paquetes
│   ├── route.py           # Endpoints de rutas
│   ├── seat.py            # Endpoints de asientos
│   ├── secretary.py       # Endpoints de secretarios
│   ├── ticket.py          # Endpoints de boletos
│   └── trip.py            # Endpoints de viajes
├── schemas/               # Esquemas Pydantic (validación de datos)
│   ├── __init__.py
│   ├── administrator.py   # Validación de datos de administradores
│   ├── assistant.py       # Validación de datos de asistentes
│   ├── auth.py            # Validación de datos de autenticación
│   ├── bus.py             # Validación de datos de buses
│   ├── client.py          # Validación de datos de clientes
│   ├── driver.py          # Validación de datos de conductores
│   ├── location.py        # Validación de datos de ubicaciones
│   ├── office.py          # Validación de datos de oficinas
│   ├── package.py         # Validación de datos de paquetes
│   ├── person.py          # Validación de datos de personas
│   ├── route.py           # Validación de datos de rutas
│   ├── seat.py            # Validación de datos de asientos
│   ├── secretary.py       # Validación de datos de secretarios
│   ├── ticket.py          # Validación de datos de boletos
│   ├── token.py           # Validación de datos de tokens JWT
│   ├── trip.py            # Validación de datos de viajes
│   └── user.py            # Validación de datos de usuarios
├── scripts/               # Scripts de utilidad
│   ├── __init__.py
│   ├── db/                # Scripts relacionados con la base de datos
│   │   ├── __init__.py
│   │   └── 01-init.sql    # Script SQL inicial
│   └── wait-for-db.sh     # Script para esperar a que la base de datos esté lista
└── docs/                  # Documentación
    ├── __init__.py
    ├── class_diagram.mmd  # Diagrama de clases original en formato Mermaid
    ├── actual_class_diagram.mmd # Diagrama de clases actualizado en formato Mermaid
    └── todo.md            # Lista de tareas pendientes
```

## Ejecución del Servidor

Hay varias formas de ejecutar el servidor para desarrollo local. Asegúrate de haber completado la configuración del entorno antes de ejecutar el servidor.

### Opción 1: Usando el script run.py (recomendado)

Este método es el más sencillo y garantiza que las importaciones funcionen correctamente independientemente de desde dónde ejecutes el proyecto.

```bash
# Desde el directorio backend
python run.py
```

### Opción 2: Usando uvicorn directamente

Puedes ejecutar el servidor directamente con uvicorn, pero debes asegurarte de estar en el directorio correcto:

```bash
# Desde el directorio raíz del proyecto (trans-comarapa-app)
uvicorn backend.main:app --reload

# O desde el directorio backend
uvicorn main:app --reload
```

### Opción 3: Usando Docker (recomendado para entornos de producción)

Este método es ideal para garantizar un entorno consistente y evitar problemas de dependencias.

```bash
# Desde el directorio raíz del proyecto
docker-compose up
```

Para más detalles sobre la configuración de Docker, consulta el archivo `README-Docker.md`.

### Verificación del servidor

Una vez iniciado, el servidor estará disponible en:
- URL base: `http://localhost:8000`
- API v1: `http://localhost:8000/api/v1`

### Versionado de la API

La API utiliza versionado en la URL para garantizar la compatibilidad a lo largo del tiempo:

- **Versión 1 (v1)**: `/api/v1`
  - Ejemplo: `http://localhost:8000/api/v1/clients`

Esto permite:
- Mantener compatibilidad con clientes existentes
- Implementar cambios importantes sin romper integraciones existentes
- Deprecar versiones antiguas de forma gradual

### Documentación de la API

La API incluye documentación interactiva generada automáticamente:

- **Swagger UI**: `http://localhost:8000/docs`
  - Interfaz interactiva que permite probar los endpoints directamente desde el navegador
  - Incluye esquemas de solicitud y respuesta
  - Permite autorización para endpoints protegidos

- **ReDoc**: `http://localhost:8000/redoc`
  - Documentación más detallada y fácil de leer
  - Mejor para entender la estructura general de la API

- **OpenAPI JSON**: `http://localhost:8000/openapi.json`
  - Especificación OpenAPI en formato JSON
  - Útil para generar clientes automáticamente

## API Endpoints

A continuación se detallan los principales endpoints disponibles en la API. Para una documentación completa e interactiva, visita `http://localhost:8000/docs` después de iniciar el servidor.

**Nota**: Todos los endpoints deben ser prefijados con `/api/v1`. Por ejemplo, para acceder al endpoint de clientes, la URL completa sería `http://localhost:8000/api/v1/clients`.

### Autenticación
- POST `/auth/login`: Iniciar sesión y obtener token JWT
- POST `/auth/register`: Registrar nuevo usuario
- GET `/auth/me`: Obtener información del usuario actual
- GET `/auth/me/person`: Obtener información de la persona asociada al usuario actual
- GET `/auth/me/secretary`: Obtener información del secretario asociado al usuario actual
- GET `/auth/me/driver`: Obtener información del conductor asociado al usuario actual
- GET `/auth/me/assistant`: Obtener información del asistente asociado al usuario actual
- GET `/auth/me/client`: Obtener información del cliente asociado al usuario actual
- GET `/auth/me/administrator`: Obtener información del administrador asociado al usuario actual

### Clientes
- GET `/clients`: Listar todos los clientes
- POST `/clients`: Crear nuevo cliente
- GET `/clients/{id}`: Obtener cliente específico
- PUT `/clients/{id}`: Actualizar cliente
- DELETE `/clients/{id}`: Eliminar cliente
- GET `/clients/{id}/tickets`: Listar tickets de un cliente
- GET `/clients/{id}/tickets/{ticket_id}`: Obtener ticket específico de un cliente
- POST `/clients/{id}/tickets`: Crear ticket para un cliente

### Conductores
- GET `/drivers`: Listar conductores
- POST `/drivers`: Crear conductor
- GET `/drivers/{id}`: Obtener conductor
- PUT `/drivers/{id}`: Actualizar conductor
- DELETE `/drivers/{id}`: Eliminar conductor

### Buses
- GET `/buses`: Listar buses
- POST `/buses`: Registrar bus
- GET `/buses/{id}`: Obtener bus por ID
- PUT `/buses/{id}`: Actualizar bus
- DELETE `/buses/{id}`: Eliminar bus
- GET `/buses/{id}/seats`: Listar asientos de un bus

### Asistentes
- GET `/assistants`: Listar asistentes
- POST `/assistants`: Registrar asistente
- GET `/assistants/{id}`: Obtener asistente
- PUT `/assistants/{id}`: Actualizar asistente
- DELETE `/assistants/{id}`: Eliminar asistente

### Ubicaciones
- GET `/locations`: Listar ubicaciones
- POST `/locations`: Crear ubicación
- GET `/locations/{id}`: Obtener ubicación
- PUT `/locations/{id}`: Actualizar ubicación
- DELETE `/locations/{id}`: Eliminar ubicación

### Rutas
- GET `/routes`: Listar rutas
- POST `/routes`: Crear ruta
- GET `/routes/{id}`: Obtener ruta
- PUT `/routes/{id}`: Actualizar ruta
- DELETE `/routes/{id}`: Eliminar ruta
- GET `/routes/search`: Buscar rutas por origen/destino

### Viajes
- GET `/trips`: Listar viajes
- POST `/trips`: Crear viaje
- GET `/trips/{id}`: Obtener viaje
- PUT `/trips/{id}`: Actualizar viaje
- DELETE `/trips/{id}`: Eliminar viaje

### Asientos
- GET `/seats`: Listar asientos
- POST `/seats`: Crear asiento
- GET `/seats/{id}`: Obtener asiento
- PUT `/seats/{id}`: Actualizar asiento
- DELETE `/seats/{id}`: Eliminar asiento

### Tickets
- GET `/tickets`: Listar tickets
- POST `/tickets`: Crear ticket
- GET `/tickets/{id}`: Obtener ticket
- PUT `/tickets/{id}`: Actualizar ticket
- DELETE `/tickets/{id}`: Eliminar ticket
- GET `/tickets/trip/{trip_id}`: Listar tickets por viaje
- GET `/tickets/client/{client_id}`: Listar tickets por cliente
- GET `/tickets/seat/{seat_id}`: Listar tickets por asiento

### Paquetes
- GET `/packages`: Listar paquetes
- POST `/packages`: Crear paquete
- GET `/packages/{id}`: Obtener paquete
- PUT `/packages/{id}`: Actualizar paquete
- DELETE `/packages/{id}`: Eliminar paquete

## Desarrollo

### Gestión de Dependencias

#### Agregar nuevas dependencias
Para agregar una nueva dependencia, edita el archivo `pyproject.toml`:
```toml
[project]
dependencies = [
    "nueva-dependencia>=1.0.0",
]
```

Luego actualiza el entorno:
```bash
uv pip install .
```

### Buenas Prácticas

1. Mantener las dependencias actualizadas
2. Seguir las convenciones de código PEP 8
3. Documentar nuevos endpoints
4. Escribir tests para nuevas funcionalidades
5. Validar cambios localmente antes de commit

## Comandos UV Útiles

UV ofrece varios comandos útiles para gestionar dependencias:

- `uv sync` - Instalar dependencias usando versiones exactas del archivo lock
- `uv pip install .` - Instalar el proyecto con posibles actualizaciones de versiones
- `uv pip install -e .` - Instalar en modo desarrollo
- `uv pip list` - Listar todos los paquetes instalados
- `uv pip show [paquete]` - Mostrar información detallada de un paquete
- `uv pip uninstall [paquete]` - Desinstalar un paquete específico
- `uv pip freeze` - Mostrar todas las dependencias con sus versiones exactas
- `uv pip install [paquete]` - Instalar un paquete específico

## Solución de problemas comunes

### Problemas de importación

Si encuentras errores de importación al ejecutar el proyecto, asegúrate de:

1. Estar ejecutando el proyecto desde el directorio correcto
2. Tener activado el entorno virtual
3. Haber instalado todas las dependencias correctamente
4. Usar el script `run.py` para ejecutar la aplicación

### Problemas de base de datos

Si encuentras errores relacionados con la base de datos:

1. Verifica que la URL de conexión en el archivo `.env` sea correcta
2. Asegúrate de que la base de datos exista y sea accesible
3. Verifica que el usuario tenga permisos suficientes
4. Si usas MySQL/MariaDB, asegúrate de que el servidor esté en ejecución

### Problemas con Docker

Si encuentras problemas al ejecutar el proyecto con Docker:

1. Asegúrate de tener Docker y Docker Compose instalados
2. Verifica que los puertos no estén siendo utilizados por otras aplicaciones
3. Revisa los logs de Docker para identificar errores específicos

## Próximos pasos

El proyecto está en desarrollo activo. Algunas de las características ya implementadas y próximas incluyen:

### Implementado
1. ✅ Autenticación y autorización con JWT
2. ✅ Modelo de herencia para personas (Person como clase base abstracta)
3. ✅ Generación de datos falsos para desarrollo y pruebas
4. ✅ Diagrama de clases actualizado

### Próximas características
1. Sistema de reservas
2. Integración con pasarelas de pago
3. Implementación de pruebas unitarias y de integración
4. Mejoras en la documentación
5. Implementación de frontend con Nuxt.js

Para ver la lista completa de tareas pendientes, consulta el archivo `docs/todo.md`.

## Contribuir al proyecto

Si deseas contribuir al proyecto, consulta el archivo `CONTRIBUTING.md` para obtener instrucciones detalladas sobre cómo configurar el entorno de desarrollo y enviar contribuciones.

## Tests

El proyecto incluye pruebas unitarias para verificar el correcto funcionamiento de los componentes principales. Las pruebas están implementadas con pytest y se encuentran en el directorio `tests/`.

### Estructura de pruebas

```
tests/
├── __init__.py
├── conftest.py           # Configuración y fixtures para pruebas
├── unit/                 # Pruebas unitarias
│   ├── __init__.py
│   ├── test_auth.py      # Pruebas de autenticación
│   ├── test_user_model.py # Pruebas del modelo de usuario
│   ├── test_trip.py      # Pruebas de gestión de viajes
│   └── test_ticket.py    # Pruebas de gestión de boletos
└── integration/          # Pruebas de integración (futuras)
    └── __init__.py
```

### Ejecutar pruebas

Para ejecutar todas las pruebas:

```bash
# Asegúrate de estar en el directorio backend y tener el entorno virtual activado
source .venv/bin/activate

# Instalar dependencias de prueba
uv pip install -e ".[test]"

# Ejecutar todas las pruebas
pytest

# Ejecutar pruebas con información detallada
pytest -v

# Ejecutar pruebas con cobertura
pytest --cov=.

# Ejecutar solo pruebas unitarias
pytest -m unit

# Ejecutar pruebas específicas
pytest tests/unit/test_auth.py
```

### Añadir nuevas pruebas

Para añadir nuevas pruebas:

1. Crea un nuevo archivo en el directorio `tests/unit/` o `tests/integration/` según corresponda
2. Nombra el archivo con el prefijo `test_` (por ejemplo, `test_nuevo_componente.py`)
3. Implementa las pruebas usando pytest
4. Marca las pruebas con el decorador `@pytest.mark.unit` o `@pytest.mark.integration` según corresponda

## Licencia

[MIT License](LICENSE)

---

© 2024 Trans Comarapa. Todos los derechos reservados.
