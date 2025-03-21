# Sistema de Gestión de Transporte - Trans Comarapa

API REST para la gestión de boletos, paquetes y viajes de una empresa de transporte. Desarrollada con FastAPI y SQLAlchemy.

## Características

- Gestión de pasajeros
- Gestión de conductores
- Gestión de buses
- Gestión de asistentes de viaje
- Gestión de viajes
- Base de datos relacional con SQLAlchemy

## Requisitos previos

- Python 3.12+
- uv (gestor de paquetes moderno para Python)
- Base de datos compatible con SQLAlchemy (por defecto SQLite)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/[tu-usuario]/trans-comarapa-app.git
cd trans-comarapa-app
```

2. Instalar uv (si aún no lo tienes):
```bash
python -m pip install uv
```

3. Crear y activar un entorno virtual con uv:
```bash
uv venv
source .venv/bin/activate  # En Linux/Mac
# o
.venv\Scripts\activate  # En Windows
```

4. Instalar dependencias con uv:
```bash
cd backend
uv pip install -r requirements.txt
```

5. Configurar variables de entorno:
Crear un archivo `.env` en la carpeta `backend` con las siguientes variables:
```env
DEBUG=True
DATABASE_URL=sqlite:///./sql_app.db  # O tu URL de base de datos
```

## Ejecución

Para ejecutar el servidor de desarrollo:

```bash
cd backend
uvicorn main:app --reload
fastapi dev main.py
```

El servidor estará disponible en `http://localhost:8000`

## Documentación de la API

Una vez que el servidor esté corriendo, puedes acceder a:

- Documentación Swagger UI: `http://localhost:8000/docs`
- Documentación ReDoc: `http://localhost:8000/redoc`

## Estructura del Proyecto

```
backend/
├── __init__.py
├── main.py                 # Punto de entrada de la aplicación
├── requirements.txt        # Dependencias del proyecto
├── db/                     # Configuración de la base de datos
├── models/                 # Modelos SQLAlchemy
├── routes/                 # Rutas de la API
└── schemas/               # Esquemas Pydantic para validación
```

## Endpoints principales

- `/passengers`: Gestión de pasajeros
- `/drivers`: Gestión de conductores
- `/busses`: Gestión de buses
- `/assistants`: Gestión de asistentes
- `/trips`: Gestión de viajes

Cada endpoint soporta operaciones CRUD estándar.

## Desarrollo

### Gestión de dependencias

Usamos `uv` como gestor de paquetes por su velocidad y eficiencia. Algunos comandos útiles:

- Agregar una nueva dependencia:
```bash
uv pip install nombre-paquete
```

- Actualizar requirements.txt después de agregar dependencias:
```bash
uv pip freeze > requirements.txt
```

- Instalar todas las dependencias en un nuevo ambiente:
```bash
uv pip install -r requirements.txt
```

Para contribuir al proyecto:

1. Crear una rama para tu característica:
```bash
git checkout -b nombre-caracteristica
```

2. Instalar dependencias de desarrollo:
```bash
uv pip install -r requirements.txt
```

3. Realizar los cambios y pruebas necesarias

4. Actualizar requirements.txt si agregaste nuevas dependencias:
```bash
uv pip freeze > requirements.txt
```

5. Enviar un pull request

## Licencia

[Especificar la licencia del proyecto]