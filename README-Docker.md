# 🐳 Docker Setup - Trans Comarapa

Esta guía te ayudará a configurar y ejecutar todo el proyecto Trans Comarapa usando Docker con un solo comando.

## 📋 Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0 o superior)
- [Make](https://www.gnu.org/software/make/) (opcional, para comandos simplificados)

## �� Inicio Rápido

### Configuración Inicial (Una sola vez)

```bash
# Clonar el repositorio (si no lo has hecho)
git clone <repository-url>
cd trans-comarapa-app

# Configuración automática completa (incluye seeding)
make setup
```

**¡Eso es todo!** El comando `make setup` hace todo automáticamente:
- ✅ Crea el archivo `.env` con la configuración
- ✅ Construye las imágenes Docker
- ✅ Inicia todos los servicios
- ✅ Espera que la base de datos esté lista
- ✅ Puebla la base de datos con datos de prueba
- ✅ Muestra información de acceso y usuarios de prueba

### Uso Diario

```bash
# Iniciar servicios
make up

# Ver logs en tiempo real
make logs

# Detener servicios
make down

# Ver estado de servicios
make status
```

### 2. Acceder a la Aplicación

Una vez que todos los servicios estén ejecutándose:

- **Frontend (Nuxt.js)**: http://localhost:3000
- **Backend API (FastAPI)**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Base de Datos MySQL**: localhost:3308

## 🏗️ Arquitectura del Proyecto

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Nuxt.js)     │◄──►│   (FastAPI)     │◄──►│    (MySQL)      │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 3308    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Estructura de Archivos Docker

```
trans-comarapa-app/
├── docker-compose.yml          # Configuración principal (desarrollo)
├── docker-compose.prod.yml     # Configuración de producción
├── Makefile                    # Comandos simplificados
├── env.example                 # Variables de entorno de ejemplo
├── frontend/
│   ├── Dockerfile             # Imagen del frontend
│   └── .dockerignore          # Archivos excluidos
└── backend/
    ├── Dockerfile             # Imagen del backend
    ├── docker-compose.yml     # Configuración legacy (solo backend)
    └── .dockerignore          # Archivos excluidos
```

## 🛠️ Comandos Disponibles

### Comandos con Make (Recomendado)

```bash
# Ver todos los comandos disponibles
make help

# Gestión de servicios
make up              # Iniciar en desarrollo
make up-prod         # Iniciar en producción
make down            # Detener servicios
make restart         # Reiniciar servicios
make status          # Ver estado de servicios

# Construcción
make build           # Construir imágenes
make rebuild         # Reconstruir sin cache

# Logs
make logs            # Ver logs de todos los servicios
make logs-f          # Ver logs en tiempo real
make logs-backend    # Ver logs solo del backend
make logs-frontend   # Ver logs solo del frontend

# Acceso a contenedores
make shell-backend   # Acceder al shell del backend
make shell-frontend  # Acceder al shell del frontend
make shell-db        # Acceder a MySQL

# Limpieza
make clean           # Limpiar contenedores y volúmenes
make clean-all       # Limpieza completa
```

### Comandos Docker Compose Directos

```bash
# Desarrollo
docker-compose up -d                    # Iniciar en background
docker-compose up                       # Iniciar con logs visibles
docker-compose down                     # Detener servicios
docker-compose logs -f                  # Ver logs en tiempo real
docker-compose ps                       # Ver estado de servicios

# Producción
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
```

## ⚙️ Configuración

### Variables de Entorno

Copia `env.example` a `.env` y ajusta las variables según tus necesidades:

```bash
cp env.example .env
```

Variables principales:

```env
# Base de datos
MYSQL_ROOT_PASSWORD=Passw0rd!

# Backend
SECRET_KEY=your-secret-key-change-in-production
DEBUG=true

# Frontend
NODE_ENV=development
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Targets de Docker
BACKEND_TARGET=development
FRONTEND_TARGET=development
```

### Modos de Ejecución

#### Desarrollo (Por defecto)
- Hot reload habilitado
- Volúmenes montados para desarrollo
- Logs detallados
- Debug habilitado

#### Producción
- Imágenes optimizadas
- Sin hot reload
- Configuración de seguridad
- Límites de recursos

```bash
# Cambiar a producción
export BACKEND_TARGET=production
export FRONTEND_TARGET=production
make up-prod
```

## 🔧 Desarrollo

### Modificar Código

En modo desarrollo, los cambios en el código se reflejan automáticamente:

- **Frontend**: Hot reload automático
- **Backend**: Recarga automática con uvicorn --reload

### Instalar Nuevas Dependencias

```bash
# Backend (Python)
make shell-backend
pip install nueva-dependencia
pip freeze > requirements.txt

# Frontend (Node.js)
make shell-frontend
npm install nueva-dependencia
```

### Ejecutar Comandos en Contenedores

```bash
# Ejecutar migraciones de base de datos
make shell-backend
python -m alembic upgrade head

# Ejecutar tests
make shell-backend
pytest

# Instalar dependencias del frontend
make shell-frontend
npm install
```

## 🗄️ Base de Datos

### Acceso a MySQL

```bash
# Usando make
make shell-db

# Usando docker-compose directamente
docker-compose exec db mysql -u root -p trans_comarapa
```

### Persistencia de Datos

Los datos se almacenan en un volumen Docker llamado `mysql_data`:

```bash
# Ver volúmenes
docker volume ls

# Backup de la base de datos
docker-compose exec db mysqldump -u root -p trans_comarapa > backup.sql

# Restaurar backup
docker-compose exec -T db mysql -u root -p trans_comarapa < backup.sql
```

## 🌱 Poblar la Base de Datos

El proyecto incluye un script completo de seeding que crea datos de prueba realistas:

### Datos Incluidos

El script `backend/db/seed.py` crea:

- **Ubicaciones**: 5 terminales (Santa Cruz, Comarapa, Cochabamba, Samaipata, Mairana)
- **Oficinas**: 5 oficinas en diferentes ubicaciones
- **Rutas**: 5 rutas entre las diferentes ubicaciones
- **Usuarios**: 40+ clientes, 10 conductores, 7 secretarios, 10 asistentes, 1 administrador
- **Buses**: 5 buses con diferentes capacidades y modelos
- **Viajes**: 60 viajes con fechas variadas (pasados, presentes y futuros)
- **Tickets**: Tickets aleatorios para los viajes
- **Paquetes**: Paquetes con items detallados para cada viaje

### Comandos de Seeding

```bash
# Poblar la base de datos con todos los datos de muestra
make seed

# Crear solo usuarios de prueba (más rápido para desarrollo)
make seed-test-users

# Limpiar toda la base de datos (¡CUIDADO!)
make clear-db
```

### Usuarios de Prueba

El script crea usuarios específicos para testing:

#### Administrador
- **Email**: admin1@comarapa.com
- **Contraseña**: 123456
- **Nombre**: Admin Principal

#### Secretarios
- **Email**: secretary1@comarapa.com (Secretaria Principal)
- **Email**: secretary2@comarapa.com (Ana García)
- **Email**: secretary3@comarapa.com (Carlos López)
- **Contraseña**: 123456 (para todos)

#### Clientes de Prueba
- **Cliente Principal** - CI: 12693562
- **María González** - CI: 9876543
- **Pedro Rojas** - CI: 5432109
- **Luisa Morales** - CI: 151985270
- **Roberto Silva** - CI: 9753228
- **Contraseña**: 123456 (para todos)

#### Otros Roles
- **Conductor**: driver1@comarapa.com
- **Asistente**: assistant1@comarapa.com
- **Contraseña**: 123456

### Uso Recomendado

1. **Primera vez**: Ejecuta `make seed` para tener datos completos
2. **Desarrollo**: Usa `make seed-test-users` si solo necesitas usuarios
3. **Reset**: Usa `make clear-db` seguido de `make seed` para empezar limpio

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Puerto ya en uso**
   ```bash
   # Cambiar puertos en docker-compose.yml
   ports:
     - "3001:3000"  # Frontend
     - "8001:8000"  # Backend
   ```

2. **Problemas de permisos**
   ```bash
   sudo chown -R $USER:$USER .
   ```

3. **Contenedores no inician**
   ```bash
   make logs
   make clean
   make rebuild
   ```

4. **Base de datos no conecta**
   ```bash
   make logs-db
   make restart-db
   ```

### Logs Detallados

```bash
# Ver logs específicos
make logs-backend
make logs-frontend
make logs-db

# Ver logs en tiempo real
make logs-f
```

### Reiniciar Servicios

```bash
# Reiniciar todo
make restart

# Reiniciar servicio específico
make restart-backend
make restart-frontend
make restart-db
```

## 🔒 Producción

### Configuración de Producción

1. **Cambiar variables de entorno**:
   ```env
   SECRET_KEY=super-secret-key-very-long-and-random
   DEBUG=false
   NODE_ENV=production
   MYSQL_ROOT_PASSWORD=strong-password
   ```

2. **Usar docker-compose de producción**:
   ```bash
   make up-prod
   ```

3. **Configurar proxy reverso** (opcional):
   - Nginx incluido en `docker-compose.prod.yml`
   - Configurar SSL/TLS
   - Configurar dominio

### Seguridad

- Cambiar todas las contraseñas por defecto
- Usar variables de entorno para secretos
- Configurar firewall
- Usar HTTPS en producción
- Limitar acceso a la base de datos

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [FastAPI con Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [Nuxt.js con Docker](https://nuxt.com/docs/getting-started/deployment#docker)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `make logs-f`
2. Verifica el estado: `make status`
3. Limpia y reconstruye: `make clean && make rebuild`
4. Consulta la documentación específica de cada servicio 