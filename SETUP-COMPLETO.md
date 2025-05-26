# 🚀 Setup Completo - Trans Comarapa

## ✅ Estado Actual del Proyecto

El proyecto **Trans Comarapa** ahora está completamente dockerizado y listo para usar con un solo comando.

### 🎯 Lo que se ha implementado:

1. **Docker Completo**:
   - ✅ Frontend (Nuxt.js) en puerto 3000
   - ✅ Backend (FastAPI) en puerto 8000  
   - ✅ Base de datos (MySQL 8.0) en puerto 3308
   - ✅ Configuración de desarrollo con hot reload
   - ✅ Configuración de producción optimizada

2. **Base de Datos Poblada**:
   - ✅ 79 usuarios totales (admin, secretarios, conductores, asistentes, clientes)
   - ✅ 45 clientes con datos realistas bolivianos
   - ✅ 60 viajes con fechas variadas (pasados, presentes, futuros)
   - ✅ 331 paquetes con items detallados
   - ✅ 5 ubicaciones (Santa Cruz, Comarapa, Cochabamba, Samaipata, Mairana)
   - ✅ 5 oficinas en diferentes ubicaciones
   - ✅ 5 rutas entre ubicaciones
   - ✅ 5 buses con diferentes capacidades
   - ✅ Asientos generados automáticamente para cada bus
   - ✅ Tickets aleatorios para los viajes

3. **Usuarios de Prueba Listos**:
   - 📧 **Admin**: admin1@comarapa.com (contraseña: 123456)
   - 📧 **Secretarios**: secretary1@comarapa.com, secretary2@comarapa.com, secretary3@comarapa.com
   - 📧 **Clientes**: client1@comarapa.com, client2@comarapa.com, etc.
   - 📧 **Conductor**: driver1@comarapa.com
   - 📧 **Asistente**: assistant1@comarapa.com
   - 🔑 **Contraseña para todos**: 123456

## 🚀 Cómo usar el proyecto

### Primera vez (Setup completo):
```bash
git clone <repository-url>
cd trans-comarapa-app
make setup
```

### Uso diario:
```bash
# Iniciar servicios
make up

# Ver logs
make logs

# Detener servicios  
make down

# Ver estado
make status
```

### Comandos de base de datos:
```bash
# Poblar con datos completos
make seed

# Solo crear usuarios de prueba
make seed-test-users

# Limpiar base de datos (¡CUIDADO!)
make clear-db
```

## 🌐 Acceso a los servicios

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Base de datos**: localhost:3308

## 📊 Datos de prueba incluidos

### Clientes con CI para búsquedas:
- Cliente Principal (CI: 12693562)
- María González (CI: 9876543)  
- Pedro Rojas (CI: 5432109)
- Luisa Morales (CI: 151985270)
- Roberto Silva (CI: 9753228)

### Ubicaciones disponibles:
- Terminal Bimodal Santa Cruz
- Terminal Comarapa
- Terminal Cochabamba  
- Terminal Samaipata
- Terminal Mairana

### Rutas configuradas:
- Santa Cruz ↔ Comarapa (240.5 km, Bs. 35)
- Comarapa ↔ Cochabamba (195 km, Bs. 40)
- Santa Cruz ↔ Samaipata (120 km, Bs. 25)
- Comarapa ↔ Samaipata (120.5 km, Bs. 20)
- Santa Cruz ↔ Mairana (150 km, Bs. 30)

## 🔧 Funcionalidades probadas

### Dashboard de Secretario:
- ✅ Estadísticas de ingresos del día (tickets + paquetes)
- ✅ Actualización automática después de registrar paquetes
- ✅ Visualización de datos en tiempo real

### Gestión de Paquetes:
- ✅ Registro de paquetes con múltiples items
- ✅ Búsqueda de clientes por CI, nombre o apellido
- ✅ Cálculo automático de totales
- ✅ Integración con estadísticas

### Gestión de Tickets:
- ✅ Venta de tickets
- ✅ Selección de asientos
- ✅ Diferentes métodos de pago
- ✅ Estados de tickets

## 📁 Estructura del proyecto

```
trans-comarapa-app/
├── frontend/           # Aplicación Nuxt.js
├── backend/           # API FastAPI
├── docker-compose.yml # Configuración principal
├── Makefile          # Comandos simplificados
├── README-Docker.md  # Documentación Docker
└── .env              # Variables de entorno
```

## 🛠️ Comandos útiles

```bash
# Ver todos los comandos disponibles
make help

# Reconstruir contenedores
make build

# Reiniciar servicios
make restart

# Acceder al shell del backend
make shell-backend

# Acceder al shell del frontend  
make shell-frontend

# Acceder a MySQL
make shell-db

# Limpiar volúmenes (reset completo)
make clean
```

## 🎉 ¡Proyecto listo para desarrollo!

El proyecto está completamente configurado y listo para:
- ✅ Desarrollo inmediato
- ✅ Testing con datos realistas
- ✅ Demostración de funcionalidades
- ✅ Despliegue en producción

**¡Solo ejecuta `make setup` y comienza a trabajar!** 