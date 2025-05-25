# Frontend - Trans Comarapa

Aplicación web desarrollada con Nuxt.js para la gestión integral de una empresa de transporte.

## 🚀 Estado Actual - 65% Completado

### ✅ Funcionalidades Implementadas

**Sistema de Autenticación (87% completado)**
- ✅ Login/logout con múltiples roles
- ✅ JWT token management con refresh tokens
- ✅ Guards de ruta para protección de páginas
- ✅ Middleware de autenticación
- ✅ Navegación dinámica según rol

**Dashboards por Rol (40% completado)**
- ✅ **Secretarias**: Dashboard completo con estadísticas en tiempo real
- ✅ **Administradores**: Dashboard básico con accesos rápidos  
- 🔄 **Conductores**: Estructura básica (en desarrollo)
- 🔄 **Asistentes**: Estructura básica (en desarrollo)
- 🔄 **Clientes**: Estructura básica (en desarrollo)

**Gestión de Viajes (90% completado)**
- ✅ Listado con filtros avanzados y paginación
- ✅ Creación y edición de viajes
- ✅ Asignación de conductores y asistentes
- ✅ Visualización detallada de viajes

**Sistema de Boletos (80% completado)**
- ✅ Venta de boletos con selección visual de asientos
- ✅ Validación de disponibilidad
- ✅ Cálculo automático de precios
- ✅ Componente de impresión de boletos

**Componentes Reutilizables (18 implementados)**
- ✅ AppButton, AppNavbar (base)
- ✅ StatCard, TripTable, TripFilters (gestión)
- ✅ SeatSelection, TicketDisplay (boletos)
- ✅ PackageRegistrationModal, ClientSelector (operaciones)
- ✅ UpcomingTrips, RecentSales (dashboard)

## 🛠️ Tecnologías Utilizadas

- **Framework**: Nuxt.js 3
- **UI Framework**: Vue.js 3 (Composition API)
- **Styling**: Tailwind CSS
- **State Management**: Pinia (12 stores implementados)
- **HTTP Client**: ofetch (Nuxt integrado)
- **Icons**: Heroicons
- **Development**: Vite, TypeScript (configurado)

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- Conexión al backend (API en puerto 8000)

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
frontend/
├── pages/                    # Páginas de la aplicación
│   ├── index.vue            # ✅ Landing page
│   ├── login.vue            # ✅ Página de login
│   ├── dashboards/          # ✅ Dashboards por rol
│   │   ├── dashboard-secretary.vue    # ✅ Completo
│   │   ├── dashboard-admin.vue        # ✅ Básico
│   │   ├── dashboard-driver.vue       # 🔄 En desarrollo
│   │   ├── dashboard-assistant.vue    # 🔄 En desarrollo
│   │   └── dashboard-client.vue       # 🔄 En desarrollo
│   ├── trips/               # ✅ Gestión de viajes
│   ├── tickets/             # ✅ Sistema de boletos
│   └── packages/            # 🔄 Gestión de paquetes
├── components/              # Componentes reutilizables (18)
│   ├── AppNavbar.vue        # ✅ Navegación principal
│   ├── StatCard.vue         # ✅ Tarjetas de estadísticas
│   ├── TripTable.vue        # ✅ Tabla de viajes
│   ├── SeatSelection.vue    # ✅ Selección de asientos
│   ├── TicketDisplay.vue    # ✅ Visualización de boletos
│   └── ...                  # Otros componentes
├── stores/                  # Estado global (Pinia) - 12 stores
│   ├── auth.js             # ✅ Autenticación
│   ├── tripStore.js        # ✅ Gestión de viajes
│   ├── ticketStore.js      # ✅ Gestión de boletos
│   ├── statsStore.js       # ✅ Estadísticas
│   └── ...                 # Otros stores
├── services/               # Servicios API - 14 servicios
│   ├── authService.js      # ✅ Autenticación
│   ├── tripService.js      # ✅ Viajes
│   ├── ticketService.js    # ✅ Boletos
│   ├── statsService.js     # ✅ Estadísticas
│   └── ...                 # Otros servicios
├── layouts/                # Layouts de la aplicación
│   ├── default.vue         # ✅ Layout principal
│   ├── auth.vue            # ✅ Layout autenticado
│   └── login.vue           # ✅ Layout de login
├── middleware/             # Middleware de rutas
│   └── auth.js             # ✅ Protección de rutas
├── utils/                  # Utilidades
│   └── api.js              # ✅ Cliente HTTP configurado
└── assets/                 # Assets estáticos
    └── css/                # Estilos globales
```

## 🎯 Funcionalidades por Rol

### Secretarias (100% implementado)
- ✅ Dashboard completo con estadísticas en tiempo real
- ✅ Gestión de viajes (crear, editar, listar)
- ✅ Venta de boletos con selección de asientos
- ✅ Acciones rápidas (nuevo paquete, buscar cliente)
- ✅ Próximos viajes y ventas recientes

### Administradores (60% implementado)
- ✅ Dashboard básico con accesos rápidos
- ✅ Navegación a gestión de usuarios
- 🔄 CRUD de usuarios (en desarrollo)
- 🔄 Configuración del sistema (planificado)
- 🔄 Reportes avanzados (planificado)

### Otros Roles (20% implementado)
- ✅ Estructura básica de dashboards
- 🔄 Funcionalidades específicas por rol
- 🔄 Navegación especializada

## 📊 Métricas de Desarrollo

### Componentes y Páginas
- **Páginas implementadas**: 25+
- **Componentes reutilizables**: 18
- **Stores de estado**: 12
- **Servicios API**: 14

### Cobertura de Funcionalidades
- **Autenticación**: 87%
- **Gestión de viajes**: 90%
- **Sistema de boletos**: 80%
- **Dashboards**: 40%
- **Gestión de paquetes**: 38%

## 🔧 Scripts de Desarrollo

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Construcción
npm run build        # Build para producción
npm run preview      # Preview del build

# Mantenimiento
npm run generate     # Generar sitio estático
npm run analyze      # Analizar bundle
```

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primario**: Blue (600, 700)
- **Secundario**: Green (500, 600)
- **Accent**: Purple (500, 600)
- **Warning**: Orange (500, 600)
- **Error**: Red (500, 600)

### Componentes de UI
- **Botones**: AppButton con variantes
- **Tarjetas**: StatCard para métricas
- **Tablas**: Componentes con paginación
- **Formularios**: Validación integrada
- **Modales**: Para acciones complejas

## 🚦 Estado de Rutas

### Rutas Implementadas
```
✅ /                           # Landing page
✅ /login                      # Autenticación
✅ /dashboards/dashboard-secretary    # Dashboard secretarias
✅ /dashboards/dashboard-admin       # Dashboard admin
✅ /trips                      # Gestión de viajes
✅ /trips/[id]                # Detalle de viaje
✅ /tickets                   # Sistema de boletos
🔄 /packages                  # Gestión de paquetes (básico)
🔄 /dashboards/dashboard-driver      # Dashboard conductores
🔄 /dashboards/dashboard-assistant   # Dashboard asistentes
🔄 /dashboards/dashboard-client      # Dashboard clientes
```

### Protección de Rutas
- ✅ Middleware de autenticación implementado
- ✅ Guards por rol configurados
- ✅ Redirección automática según estado de auth

## 🔮 Próximas Funcionalidades

### Sprint Actual (Abril 2024)
- [ ] Completar dashboards para conductores
- [ ] Gestión completa de paquetes
- [ ] Reportes avanzados con gráficos

### Siguientes Sprints
- [ ] Dashboard de asistentes y clientes
- [ ] Sistema de notificaciones push
- [ ] Modo offline básico
- [ ] PWA (Progressive Web App)

## 🐛 Problemas Conocidos

- [ ] Optimización de carga inicial (bundle size)
- [ ] Mejor manejo de errores de red
- [ ] Validación de formularios más robusta

## 📝 Logging y Debug

### Variables de Entorno para Debug
```env
DEBUG=true                    # Habilitar logs de debug
NUXT_PUBLIC_LOG_LEVEL=debug  # Nivel de logging
```

### Herramientas de Debug
- Vue DevTools (recomendado)
- Nuxt DevTools (integrado)
- Network tab para APIs

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Última actualización**: 14 Abril 2024  
**Próxima revisión**: 20 Abril 2024
