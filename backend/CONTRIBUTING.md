# Guía de Contribución

Este documento proporciona instrucciones para desarrolladores que deseen contribuir al proyecto Trans Comarapa.

## Configuración del Entorno de Desarrollo

### Requisitos Previos
- Python 3.12+
- uv (gestor de paquetes moderno para Python)
- Base de datos compatible con SQLAlchemy (por defecto SQLite)

### Pasos para Configurar el Entorno

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/trans-comarapa-app.git
cd trans-comarapa-app
```

2. Crear y activar un entorno virtual:
```bash
cd backend
uv venv --python=3.12.0
source .venv/bin/activate  # En Linux/Mac
# o
.\.venv\Scripts\activate   # En Windows
```

3. Instalar dependencias:
```bash
uv sync
# o
uv pip install -e .
```

4. Configurar variables de entorno:
   - Crear un archivo `.env` en el directorio `backend` basado en `.env.example`
   - Ajustar las variables según tu entorno local

## Ejecutar el Proyecto

Hay varias formas de ejecutar el servidor para desarrollo:

### Opción 1: Usando el script run.py (recomendado)
```bash
# Desde el directorio backend
python run.py
```

### Opción 2: Usando uvicorn directamente
```bash
# Desde el directorio raíz del proyecto
uvicorn backend.main:app --reload

# O desde el directorio backend
uvicorn main:app --reload
```

### Opción 3: Usando Docker
```bash
# Desde el directorio raíz del proyecto
docker-compose up
```

## Estructura del Proyecto

El proyecto sigue una estructura modular:

```
backend/
├── db/                # Configuración de la base de datos
├── models/            # Modelos SQLAlchemy
├── routes/            # Rutas de la API
├── schemas/           # Esquemas Pydantic
├── scripts/           # Scripts de utilidad
├── main.py            # Punto de entrada de la aplicación
└── run.py             # Script para ejecutar la aplicación
```

## Flujo de Trabajo para Contribuciones

1. Crear una rama para tu característica o corrección:
```bash
git checkout -b feature/nombre-de-la-caracteristica
```

2. Realizar cambios y asegurarse de que el código sigue las convenciones del proyecto

3. Ejecutar pruebas (cuando estén implementadas)

4. Enviar un Pull Request con una descripción clara de los cambios

## Convenciones de Código

- Seguir las convenciones de PEP 8
- Documentar todas las funciones y clases
- Usar nombres descriptivos para variables y funciones
- Mantener las funciones pequeñas y con una sola responsabilidad

## Solución de Problemas Comunes

### Problemas de Importación
Si encuentras problemas de importación, asegúrate de:
- Estar ejecutando el proyecto desde el directorio correcto
- Tener todos los archivos `__init__.py` necesarios
- Usar las rutas de importación correctas

### Problemas de Base de Datos
- Verificar la cadena de conexión en el archivo `.env`
- Asegurarse de que la base de datos existe y es accesible
- Revisar los logs para errores específicos

## Contacto

Si tienes preguntas o problemas, contacta al equipo de desarrollo en [correo@ejemplo.com].
