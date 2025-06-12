# Guía de Docker para Trans Comarapa API

Esta guía explica cómo configurar y usar Docker con la API de Trans Comarapa.

## Estado Actual - Backend Dockerizado

El backend está completamente dockerizado y optimizado para trabajar en conjunto con el frontend modernizado. La API incluye endpoints especializados para soportar la nueva interfaz de gestión de boletos y estadísticas en tiempo real.

## Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

## Estructura Docker

El proyecto utiliza Docker Compose para gestionar dos servicios principales:

1. **app**: La aplicación FastAPI con endpoints optimizados
2. **db**: Base de datos MySQL 8.0 con datos de prueba

### Archivos principales:

- `Dockerfile`: Define la construcción de la imagen de la aplicación
- `docker-compose.yml`: Define los servicios, redes y volúmenes
- `.env.docker`: Variables de entorno específicas para Docker
- `scripts/wait-for-db.sh`: Script para esperar a que la base de datos esté disponible
- `scripts/db/*`: Scripts SQL para inicializar la base de datos
- `db/seed.py`: ⭐ Script mejorado de datos de prueba

## Entornos de Ejecución

El proyecto ofrece dos entornos de ejecución configurados:

- **development**: Incluye recarga automática del código (modo por defecto)
- **production**: Optimizado para entornos de producción (sin recarga automática)

## Características del Backend Dockerizado ⭐

### API Optimizada para Frontend
- Endpoints de boletos con filtros avanzados
- Paginación mejorada para grandes volúmenes de datos
- APIs de estadísticas en tiempo real
- Soporte completo para búsqueda multi-campo
- Validaciones robustas con Pydantic

### Base de Datos Enriquecida
- Scripts de seeding con datos realistas en español
- Usuarios de prueba para todos los roles
- Datos de tickets con diferentes estados
- Viajes programados para testing
- Configuración de relaciones entre entidades

## Cómo Usar

### Iniciar los Servicios en Desarrollo

```bash
# Ejecutar con variables predeterminadas
docker-compose up

# Ejecutar en segundo plano
docker-compose up -d

# Ver logs cuando se ejecuta en segundo plano
docker-compose logs -f
```

### Iniciar en Modo Producción

```bash
# Usar el target de producción en docker-compose.yml
# Edita docker-compose.yml y cambia target: development a target: production
docker-compose up
```

### Detener los Servicios

```bash
# Detener los contenedores
docker-compose down

# Detener y eliminar volúmenes (borrará datos de la base de datos)
docker-compose down -v
```

## Acceso a los Servicios

- **API**: [http://localhost:8000](http://localhost:8000)
- **Documentación Interactiva**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Documentación ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **MySQL**:
  - Host: localhost
  - Puerto: 3308 (mapeado para evitar conflictos con instalaciones locales)
  - Usuario: root
  - Contraseña: Passw0rd! (configurable en `.env.docker`)
  - Base de datos: trans_comarapa

### Nuevos Endpoints Destacados ⭐

```bash
# Estadísticas del dashboard
curl http://localhost:8000/api/v1/stats/dashboard

# Boletos con filtros avanzados
curl "http://localhost:8000/api/v1/tickets?state=confirmed&limit=10"

# Asientos disponibles para un viaje
curl http://localhost:8000/api/v1/trips/1/available-seats

# Estadísticas de boletos
curl http://localhost:8000/api/v1/stats/tickets
```

## Comandos Útiles

### Ejecutar Comandos en Contenedores

```bash
# Ejecutar comando en el contenedor de la aplicación
docker-compose exec app bash

# Ejecutar comando en la base de datos
docker-compose exec db mysql -u root -p trans_comarapa

# Ejecutar script de seeding
docker-compose exec app python db/seed.py

# Ejecutar tests
docker-compose exec app pytest
```

### Gestión de Datos de la Base de Datos

Los datos de MySQL se almacenan en un volumen Docker llamado `mysql_data`, lo que permite que los datos persistan entre reinicios.

```bash
# Ver volúmenes Docker
docker volume ls

# Eliminar volumen específico (perderás todos los datos)
docker volume rm backend_mysql_data

# Backup de base de datos
docker-compose exec db mysqldump -u root -p trans_comarapa > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T db mysql -u root -p trans_comarapa < backup.sql
```

### Comandos de Desarrollo

```bash
# Ver logs específicos del backend
docker-compose logs -f app

# Reiniciar solo el servicio de la API
docker-compose restart app

# Verificar estado de la API
curl -I http://localhost:8000/api/v1/health

# Acceder al shell del contenedor para debugging
docker-compose exec app bash
```

## Datos de Prueba y Seeding ⭐

### Script de Seeding Mejorado

El proyecto incluye un script de seeding completo que genera datos realistas:

```bash
# Ejecutar seeding desde el contenedor
docker-compose exec app python db/seed.py

# Ver resultados en la base de datos
docker-compose exec db mysql -u root -p trans_comarapa -e "
SELECT 
  'Usuarios' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'Tickets' as tabla, COUNT(*) as total FROM tickets
UNION ALL
SELECT 'Viajes' as tabla, COUNT(*) as total FROM trips
UNION ALL
SELECT 'Clientes' as tabla, COUNT(*) as total FROM clients;
"
```

### Usuarios de Prueba Disponibles

```bash
# Administrador
Email: admin1@comarapa.com
Password: 123456

# Secretarios
Email: secretary1@comarapa.com
Email: secretary2@comarapa.com
Password: 123456

# Clientes
Email: client1@comarapa.com
Password: 123456

# Ver todos los usuarios de prueba
docker-compose exec db mysql -u root -p trans_comarapa -e "
SELECT email, role FROM users WHERE email LIKE '%@comarapa.com' LIMIT 10;
"
```

## Monitoreo y Debugging

### Verificar Estado de Servicios

```bash
# Ver estado de contenedores
docker-compose ps

# Ver uso de recursos
docker stats backend_app_1 backend_db_1

# Ver logs en tiempo real con filtros
docker-compose logs -f app | grep -E "(ERROR|WARNING|INFO)"
```

### Métricas de la API

```bash
# Verificar endpoints principales
curl -s http://localhost:8000/api/v1/stats/dashboard | jq '.'

# Verificar salud de la API
curl -s http://localhost:8000/health

# Ver documentación disponible
curl -s http://localhost:8000/openapi.json | jq '.paths | keys[]' | head -10
```

## Solución de Problemas

### La Aplicación no se Inicia

Si la aplicación no inicia correctamente, verifica los logs:

```bash
docker-compose logs app
```

Problemas comunes:
- Base de datos no disponible: Espera unos segundos más
- Puerto ocupado: Cambia el puerto en docker-compose.yml
- Permisos: Verifica que Docker tenga permisos necesarios

### Problemas de Conexión a la Base de Datos

Verifica que la base de datos está funcionando:

```bash
docker-compose logs db

# Verificar conexión manual
docker-compose exec db mysql -u root -p -e "SHOW DATABASES;"
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo la API
docker-compose restart app

# Reiniciar solo la base de datos
docker-compose restart db
```

### Problemas de Performance

```bash
# Ver recursos utilizados
docker stats

# Optimizar base de datos
docker-compose exec db mysql -u root -p trans_comarapa -e "OPTIMIZE TABLE tickets, trips, clients;"

# Limpiar logs excesivos
docker-compose logs --tail=100 app
```

## Integración con Frontend

El backend está diseñado para trabajar perfectamente con el frontend modernizado:

### CORS Configurado
- Permite conexiones desde localhost:3000
- Headers apropiados para desarrollo y producción
- Soporte para métodos HTTP completos

### APIs Especializadas
- Endpoints optimizados para la página de boletos
- Respuestas estructuradas para el frontend
- Filtros que coinciden con la interfaz de usuario

```bash
# Verificar integración
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8000/api/v1/tickets
```

## Consejos de Seguridad

- Para entornos de producción, cambia todas las contraseñas predeterminadas en `.env.docker`
- Considera usar Docker Secrets para credenciales en entornos de producción
- Limita el acceso a la red para el servicio de base de datos
- Usa HTTPS en producción con un proxy reverso

## Personalización

### Cambiar Puerto de la API

Para cambiar el puerto de acceso a la API, modifica el mapeo de puertos en `docker-compose.yml`:

```yaml
ports:
  - "8080:8000"  # Cambia 8080 por el puerto deseado
```

### Cambiar Configuración de MySQL

Puedes modificar la configuración de MySQL en `docker-compose.yml` o agregar un archivo de configuración personalizado:

```yaml
volumes:
  - ./mysql-config:/etc/mysql/conf.d  # Agrega esta línea
```

### Variables de Entorno Personalizadas

```bash
# Crear archivo de configuración personalizado
cp .env.docker .env.docker.local

# Modificar variables según necesidades
# Luego ejecutar con:
docker-compose --env-file .env.docker.local up
```

---

**Última actualización**: Diciembre 2024  
**Compatibilidad**: Frontend modernizado con página de boletos mejorada 