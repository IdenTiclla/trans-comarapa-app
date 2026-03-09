# Docker Setup - Trans Comarapa

Guia para configurar y ejecutar el proyecto con Docker.

## Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Make (opcional)

## Inicio Rapido

```bash
make setup    # Construye, inicia servicios, migra y siembra la BD
```

Esto crea el `.env`, construye imagenes, inicia servicios, espera la BD y ejecuta el seed.

## Comandos

### Servicios

```bash
make up / down / restart / status
make build / rebuild          # Construir / reconstruir sin cache
```

### Logs

```bash
make logs-f                   # Tiempo real (todos)
make logs-backend / logs-frontend / logs-db
```

### Shell en contenedores

```bash
make shell-backend / shell-frontend / shell-db
```

### Base de datos

```bash
make seed                     # Datos completos de prueba
make seed-minimal             # Solo datos minimos
make seed-test-users          # Solo usuarios de prueba
make clear-db                 # Limpiar BD
```

## Servicios y puertos

| Servicio | Puerto |
|----------|--------|
| Frontend React (activo) | :3001 |
| Frontend Nuxt (legacy) | :3000 |
| Backend API | :8000 |
| API Docs (Swagger) | :8000/docs |
| MySQL | :3308 |
| Redis | :6379 |

## Variables de entorno

Copia `env.example` a `.env`:

```env
MYSQL_ROOT_PASSWORD=Passw0rd!
SECRET_KEY=your-secret-key-change-in-production
DEBUG=true
NODE_ENV=development
BACKEND_TARGET=development
FRONTEND_TARGET=development
```

## Modos de ejecucion

- **Desarrollo** (por defecto): hot reload, volumenes montados, debug habilitado
- **Produccion**: `make up-prod` — imagenes optimizadas, sin hot reload

### Configuracion de produccion

1. Cambiar passwords y `SECRET_KEY` en `.env`
2. Setear `DEBUG=false`, `NODE_ENV=production`
3. Ejecutar `make up-prod`

## Solucion de problemas

| Problema | Solucion |
|----------|----------|
| Puerto en uso | Cambiar puertos en `docker-compose.yml` |
| Permisos | `sudo chown -R $USER:$USER .` |
| Contenedores no inician | `make logs` → `make clean` → `make rebuild` |
| BD no conecta | `make logs-db` → `make restart` |

## Backup y restauracion

```bash
# Backup
docker-compose exec db mysqldump -u root -p trans_comarapa > backup.sql

# Restaurar
docker-compose exec -T db mysql -u root -p trans_comarapa < backup.sql
```
