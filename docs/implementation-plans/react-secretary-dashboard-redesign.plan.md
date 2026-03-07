# Plan: Rediseño del Dashboard de Secretaría

## Context
El dashboard actual en `/dashboards/dashboard-secretary` es funcional pero visualmente básico. Tiene datos hardcodeados en "Actividad Reciente", no tiene selector de período, no usa charts, y las tarjetas de stats tienen un diseño mínimo. El objetivo es un rediseño drástico que sea moderno, completamente funcional con datos reales, y ofrezca una experiencia de usuario notablemente mejor.

---

## Archivos a modificar

| Archivo | Tipo de cambio |
|---------|---------------|
| `frontend-react/src/pages/dashboards/SecretaryDashboard.tsx` | Rediseño completo |
| `frontend-react/src/components/dashboard/DashboardStatCard.tsx` | Rediseño visual |
| `frontend-react/src/components/dashboard/UpcomingTrips.tsx` | Mejoras funcionales + visuales |
| `frontend-react/src/components/dashboard/RecentSales.tsx` | Mejoras visuales |

---

## Cambios detallados

### 1. `SecretaryDashboard.tsx` — Rediseño completo

**Header:**
- Fondo con gradiente azul-índigo (`from-blue-700 to-indigo-800`) con texto blanco
- Saludo dinámico según hora: "Buenos días / tardes / noches, {nombre}"
- Fecha actual a la derecha
- Indicador de "En vivo" (punto verde pulsante) + botón de actualizar manual
- Selector de período integrado en el header: botones tab-like `Hoy | Semana | Mes`

**Estado local añadido:**
```tsx
const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
const [revenueChartData, setRevenueChartData] = useState<ChartDataPoint[]>([])
```

**Efecto de período:** Cuando `selectedPeriod` cambia, re-despacha `fetchDashboardStats(selectedPeriod)`.

**Tarjetas de Stats (5 en lugar de 4):**
- Rediseñadas con fondo degradado de color (reemplaza el borde izquierdo)
- `DashboardStatCard` acepta nuevo prop `gradient` (string de clases Tailwind)
- Añadir 5ª tarjeta: **"Reservas Pendientes"** usando `statsService.getReservedTicketStats(selectedPeriod)` — color ámbar
- Loading states con `Skeleton` de shadcn/ui en lugar de spinner full-page

**Quick Actions — rediseño:**
- Layout horizontal compacto en desktop
- Añadir flecha `→` visible al hover
- Mejor contraste de colores

**Layout principal:**
```
[Header con gradiente]
[5 Stat Cards]
[Quick Actions]
[Left 3/4: Upcoming Trips + Revenue Chart]  [Right 1/4: Quick Search + Recent Activity (REAL)]
[Recent Sales (ancho completo)]
```

**Reemplazar "Actividad Reciente" hardcodeada:**
- Usar `salesService.getRecentSales(8)` (endpoint ya existe)
- Feed real: icono de tipo (boleto/paquete), nombre de cliente, monto, tiempo relativo
- Auto-refresh cada 60s (igual que RecentSales)

**Nuevo chart de Ingresos:**
- Usar componente existente `MonthlyMetricsChart` (`components/dashboard/MonthlyMetricsChart.tsx`)
- Datos de `statsService.getMonthlyRevenueStats(6)` → `/stats/revenue/monthly`
- `valueFormatter`: `(v) => \`Bs. \${v.toLocaleString()}\``
- Colocarlo debajo de UpcomingTrips en la columna izquierda

---

### 2. `DashboardStatCard.tsx` — Rediseño visual

- Nuevo prop `gradient?: string` (ej. `'from-blue-500 to-blue-600'`)
- Con `gradient`: fondo degradado, texto blanco, icono en círculo semitransparente blanco (`bg-white/20`)
- Sin `gradient`: mantener diseño actual como fallback
- Trend badge: pill con `bg-white/20` en modo gradient, `bg-green-100/bg-red-100` en modo claro
- Número principal más grande en modo gradient

---

### 3. `UpcomingTrips.tsx` — Mejoras funcionales + visuales

- **Barra de ocupación**: `occupied = (bus.capacity - available_seats) / bus.capacity * 100`
  - Verde si <70% ocupado, amarillo si 70-90%, rojo si >90%
  - `<div className="w-full bg-gray-200 rounded-full h-1.5">` con fill animado
- **Badge de estado**: `scheduled` → azul "Programado", `in_progress` → verde "En curso"
- **Tiempo relativo**: "En 2h 30min" / "En 45 min" usando diferencia de fechas
- Skeleton durante loading

---

### 4. `RecentSales.tsx` — Mejoras visuales

- **Badge de tipo**: `Boleto` → pill azul (`bg-blue-100 text-blue-700`), `Paquete` → pill verde (`bg-green-100 text-green-700`)
- **Borde izquierdo coloreado** por tipo: `border-l-4 border-blue-400` / `border-l-4 border-green-400`
- Monto en verde prominente (`text-emerald-600 font-bold`)

---

## Reutilización de código existente

| Elemento | Archivo | Uso |
|----------|---------|-----|
| `MonthlyMetricsChart` | `components/dashboard/MonthlyMetricsChart.tsx` | Chart de ingresos mensuales |
| `statsService.getMonthlyRevenueStats` | `services/stats.service.ts:174` | Datos del chart |
| `statsService.getReservedTicketStats` | `services/stats.service.ts:33` | 5ª stat card |
| `salesService.getRecentSales` | `services/sales.service.ts` | Reemplazar actividad hardcodeada |
| `Skeleton` | `components/ui/skeleton.tsx` | Loading states |
| `Badge` | `components/ui/badge.tsx` | Badges en RecentSales |
| `fetchDashboardStats` thunk | `store/stats.slice.ts:36` | Ya acepta `period` param |

---

## Verificación

1. `cd frontend-react && npm run dev`
2. Navegar a `http://localhost:3001/dashboards/dashboard-secretary`
3. Verificar:
   - [ ] Header con gradiente azul-índigo y saludo dinámico según hora
   - [ ] Selector Hoy/Semana/Mes actualiza las tarjetas de stats
   - [ ] 5 tarjetas con fondos degradados de color
   - [ ] "Actividad Reciente" muestra datos reales (no hardcodeados)
   - [ ] Chart de ingresos mensuales con datos reales
   - [ ] UpcomingTrips con barra de ocupación y badges de estado
   - [ ] RecentSales con badges de tipo coloreados
   - [ ] Loading states con skeletons
