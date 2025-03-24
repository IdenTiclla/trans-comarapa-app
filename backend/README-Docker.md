# Guía de Docker para Trans Comarapa API

Esta guía explica cómo configurar y usar Docker con la API de Trans Comarapa.

## Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

## Estructura Docker

El proyecto utiliza Docker Compose para gestionar dos servicios principales:

1. **app**: La aplicación FastAPI
2. **db**: Base de datos MySQL 8.0

### Archivos principales:

- `Dockerfile`: Define la construcción de la imagen de la aplicación
- `docker-compose.yml`: Define los servicios, redes y volúmenes
- `.env.docker`: Variables de entorno específicas para Docker
- `scripts/wait-for-db.sh`: Script para esperar a que la base de datos esté disponible
- `scripts/db/*`: Scripts SQL para inicializar la base de datos

## Entornos de Ejecución

El proyecto ofrece dos entornos de ejecución configurados:

- **development**: Incluye recarga automática del código (modo por defecto)
- **production**: Optimizado para entornos de producción (sin recarga automática)

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
- **Documentación**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **MySQL**:
  - Host: localhost
  - Puerto: 3308 (mapeado para evitar conflictos con instalaciones locales)
  - Usuario: root
  - Contraseña: Passw0rd! (configurable en `.env.docker`)
  - Base de datos: trans_comarapa

## Comandos Útiles

### Ejecutar Comandos en Contenedores

```bash
# Ejecutar comando en el contenedor de la aplicación
docker-compose exec app bash

# Ejecutar comando en la base de datos
docker-compose exec db mysql -u root -p trans_comarapa
```

### Gestión de Datos de la Base de Datos

Los datos de MySQL se almacenan en un volumen Docker llamado `mysql_data`, lo que permite que los datos persistan entre reinicios.

```bash
# Ver volúmenes Docker
docker volume ls

# Eliminar volumen específico (perderás todos los datos)
docker volume rm backend_mysql_data
```

## Solución de Problemas

### La Aplicación no se Inicia

Si la aplicación no inicia correctamente, verifica los logs:

```bash
docker-compose logs app
```

### Problemas de Conexión a la Base de Datos

Verifica que la base de datos está funcionando:

```bash
docker-compose logs db
```

### Reiniciar Servicios

```bash
docker-compose restart app
docker-compose restart db
```

## Consejos de Seguridad

- Para entornos de producción, cambia todas las contraseñas predeterminadas en `.env.docker`
- Considera usar Docker Secrets para credenciales en entornos de producción
- Limita el acceso a la red para el servicio de base de datos

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