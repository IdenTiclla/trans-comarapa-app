# Backend - Trans Comarapa

API REST para la gestión de boletos, paquetes y viajes desarrollada con FastAPI.

## Tecnologías Principales

- FastAPI: Framework web moderno y rápido
- SQLAlchemy: ORM para la base de datos
- Pydantic: Validación de datos
- UV: Gestor de paquetes moderno para Python

## Requisitos previos

- Python 3.12+
- uv (gestor de paquetes moderno para Python)
- Base de datos compatible con SQLAlchemy (por defecto SQLite)

## Configuración del Entorno de Desarrollo

1. Asegúrate de estar en el directorio backend:
```bash
cd backend
```

2. Crear entorno virtual con uv especificando la versión de Python:
```bash
uv venv --python=3.12.0
```

3. Activar el entorno virtual:
```bash
source ../.venv/bin/activate  # En Linux/Mac
# o
..\.venv\Scripts\activate     # En Windows
```

4. Instalar dependencias:
```bash
uv pip install -r requirements.txt
```

5. Configurar variables de entorno:
Crear un archivo `.env` con:
```env
DATABASE_URL="mysql+pymysql://root:somepasswordhere!@localhost:3306/dbname"
SECRET_KEY="your-secret-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

## Estructura del Proyecto

```
.
├── __init__.py
├── main.py                 # Punto de entrada de la aplicación
├── requirements.txt        # Dependencias del proyecto
├── db/                     # Configuración de la base de datos
│   ├── __init__.py
│   ├── base.py            # Configuración base de SQLAlchemy
│   └── session.py         # Gestión de sesiones de DB
├── models/                 # Modelos SQLAlchemy
│   ├── assistant.py       # Modelo de asistentes
│   ├── bus.py            # Modelo de buses
│   ├── driver.py         # Modelo de conductores
│   ├── passenger.py      # Modelo de pasajeros
│   └── trip.py           # Modelo de viajes
├── routes/                # Rutas de la API
│   ├── assistant.py      # Endpoints de asistentes
│   ├── bus.py           # Endpoints de buses
│   ├── driver.py        # Endpoints de conductores
│   ├── passenger.py     # Endpoints de pasajeros
│   └── trip.py          # Endpoints de viajes
└── schemas/              # Esquemas Pydantic
    ├── assistant.py     # Validación de datos de asistentes
    ├── bus.py          # Validación de datos de buses
    ├── driver.py       # Validación de datos de conductores
    ├── passenger.py    # Validación de datos de pasajeros
    └── trip.py         # Validación de datos de viajes
```

## Ejecución del Servidor

Para desarrollo local:
```bash
uvicorn main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

## API Endpoints

### Pasajeros
- GET `/passengers`: Listar todos los pasajeros
- POST `/passengers`: Crear nuevo pasajero
- GET `/passengers/{id}`: Obtener pasajero específico
- PATCH `/passengers/{id}`: Actualizar pasajero
- DELETE `/passengers/{id}`: Eliminar pasajero

### Conductores
- GET `/drivers`: Listar conductores
- POST `/drivers`: Crear conductor
- GET `/drivers/{id}`: Obtener conductor
- PATCH `/drivers/{id}`: Actualizar conductor
- DELETE `/drivers/{id}`: Eliminar conductor

### Buses
- GET `/busses`: Listar buses
- POST `/busses`: Registrar bus
- DELETE `/busses/{id}`: Eliminar bus

### Asistentes
- GET `/assistants`: Listar asistentes
- POST `/assistants`: Registrar asistente

### Viajes
- GET `/trips`: Listar viajes
- POST `/trips`: Crear viaje

## Desarrollo

### Gestión de Dependencias con UV

#### Agregar nuevas dependencias
```bash
uv pip install paquete-nuevo
uv pip freeze > requirements.txt
```

#### Actualizar dependencias
```bash
uv pip install -U paquete-a-actualizar
uv pip freeze > requirements.txt
```

### Buenas Prácticas

1. Mantener las dependencias actualizadas
2. Seguir las convenciones de código PEP 8
3. Documentar nuevos endpoints
4. Escribir tests para nuevas funcionalidades
5. Validar cambios localmente antes de commit

## Tests

Por implementar

## Licencia

[Especificar la licencia del proyecto]