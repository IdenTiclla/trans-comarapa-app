# Fluid Responsive Design — Trans Comarapa (frontend/)

Guía obligatoria para layouts. Toda página/componente nuevo o refactorizado debe seguir estos principios para verse correcto en **cualquier** ancho de viewport, no solo en los breakpoints definidos.

> **Principio:** "Responsive" significa que el layout funciona en breakpoints discretos. **Fluid & Adaptive** significa que el layout funciona en *cualquier* ancho intermedio, sin overflow, sin texto cortado, sin elementos que "saltan" feo entre breakpoints.

---

## 1. Breakpoints oficiales (Tailwind default)

| Prefijo | Ancho mínimo | Caso de uso |
|---|---|---|
| (none) | 0–639px | Mobile (mobile-first base) |
| `sm:` | 640px | Mobile grande / phablet |
| `md:` | 768px | Tablet vertical |
| `lg:` | 1024px | Tablet horizontal / laptop pequeño |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Desktop grande |

**Anchos de QA obligatorios** (probar manualmente o con Playwright):
`320, 375, 414, 640, 768, 1024, 1280, 1440, 1920`.

---

## 2. Reglas obligatorias

### 2.1 Mobile-first
Comenzar siempre por el ancho más estrecho. Las clases sin prefijo aplican a móvil; los prefijos (`sm:`, `md:`, …) agregan complejidad hacia arriba.

```tsx
// ✅ Correcto: mobile-first
<div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:gap-8" />

// ❌ Incorrecto: desktop-first
<div className="flex flex-row gap-8 max-md:flex-col max-md:gap-4" />
```

### 2.2 Contenedor con tope y padding fluido
Toda página raíz debe:

- Tener un `max-w-screen-xl` o `max-w-screen-2xl` (nunca `max-w-full` sin tope en pantallas grandes).
- Escalar el padding con al menos 3 puntos: `px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12`.
- Escalar el `py` similar.

```tsx
<div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
```

### 2.3 Grids progresivos
Evitar saltos directos `grid-cols-1 → grid-cols-3`. Pasar por un punto intermedio:

```tsx
// ✅ Correcto
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" />

// ❌ Incorrecto (cards muy anchas en tablet)
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6" />
```

### 2.4 `min-w-0` en hijos de flex/grid
Por defecto los hijos de `flex` y `grid` tienen `min-width: auto`, lo que les permite **desbordar** al contenedor. Añadir `min-w-0` siempre que el hijo contenga texto largo, tablas, imágenes o subgrids.

```tsx
<div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
  <div className="xl:col-span-8 min-w-0">{/* contenido */}</div>
  <div className="xl:col-span-4 min-w-0">{/* sidebar */}</div>
</div>
```

### 2.5 Texto que se adapta
Texto largo (nombres, descripciones, números) **debe** usar uno de:

- `break-words` — quiebra entre palabras cuando hay espacio.
- `break-all` — quiebra en cualquier caracter (útil para IDs, tracking numbers, montos).
- `truncate` — recorta con `…` en una línea (útil para listas).

```tsx
<h1 className="text-2xl sm:text-3xl xl:text-4xl break-all">{trackingNumber}</h1>
<span className="truncate">{user.email}</span>
<p className="break-words">{descripcion}</p>
```

### 2.6 Tipografía y spacing fluido
Escalar tipografía y espaciados con al menos 2-3 pasos, no fijos:

```tsx
// ✅ Correcto
className="text-base sm:text-lg lg:text-xl"
className="p-4 sm:p-6 lg:p-8"

// ❌ Incorrecto (texto enorme en móvil)
className="text-4xl"
```

### 2.7 Adaptive UI (cambiar forma, no solo tamaño)
Cuando un patrón no escala bien (tablas anchas, timelines horizontales), **cambiar la forma** del componente, no solo el tamaño:

| Desktop | Mobile |
|---|---|
| Tabla con columnas | Lista de tarjetas |
| Timeline horizontal | Timeline vertical |
| Sidebar fijo | Drawer/sheet colapsable |
| Modal grande | Sheet de pantalla completa |

```tsx
{/* Mobile: card list */}
<ul className="sm:hidden">{items.map(...)}</ul>

{/* Tablet+: tabla */}
<div className="hidden sm:block overflow-x-auto">
  <Table>...</Table>
</div>
```

### 2.8 Imágenes y mapas con altura fluida
Nunca usar altura fija sin escalado. Usar al menos 2-3 pasos o `aspect-ratio`:

```tsx
// ✅ Correcto
className="h-[180px] sm:h-[240px] md:h-[300px] lg:h-[400px]"
className="aspect-video"

// ❌ Incorrecto
className="h-[400px]"
```

### 2.9 Considerar el contenedor, no solo el viewport
Tailwind escala con el viewport, pero el contenedor real puede ser menor (sidebar abierto, modales, splits). Si una página vive dentro del shell con sidebar (256px), su área útil a viewport=1024 es solo 768. Diseñar pensando en eso:

- Si el sidebar abierto rompe el grid `lg:grid-cols-12`, mover el split a `xl:grid-cols-12`.
- Probar con la sidebar abierta **y** cerrada.

---

## 3. Definition of Done — Responsive

Antes de marcar un PR como listo, verificar:

- [ ] Sin scroll horizontal a 320, 375, 414, 640, 768, 1024, 1280, 1440, 1920px.
- [ ] Ningún texto se corta ni se sale del contenedor.
- [ ] Imágenes/mapas escalan con `aspect-ratio` o alturas fluidas.
- [ ] Tablas anchas se convierten en listas/cards bajo `sm`.
- [ ] Padding y gaps tienen al menos 3 puntos de escalado.
- [ ] Tipografía usa escala progresiva, no fija.
- [ ] Layout probado redimensionando la ventana de 320 → 1920px continuamente sin que algo "salte".
- [ ] Layout probado con el sidebar del shell **abierto y cerrado**.

---

## 4. Anti-patterns prohibidos

| Patrón | Por qué falla | Alternativa |
|---|---|---|
| `min-w-[500px]` dentro de un contenedor móvil | Fuerza scroll horizontal | `min-w-0` + adaptive UI (tabla → cards) |
| `max-w-full` sin tope | Estira contenido en pantallas grandes | `max-w-screen-xl` / `max-w-screen-2xl` |
| `text-4xl` sin breakpoints | Texto enorme en móvil | `text-2xl sm:text-3xl lg:text-4xl` |
| `grid-cols-1 lg:grid-cols-3` | Salto brusco, cards muy anchas en tablet | `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` |
| `h-[400px]` fijo | Mapa o imagen aplasta móvil | escala fluida o `aspect-ratio` |
| Hijo de flex/grid sin `min-w-0` | Desborda contenedor con texto largo | añadir `min-w-0` |
| Posición absoluta para layout | No se adapta | Flex/Grid |
| `hidden` para "esconder en móvil" un contenido importante | Ese contenido sigue siendo necesario | Repensar como adaptive UI |

---

## 5. Cómo solicitar este patrón en un ticket

> **Requerimiento de layout:** Implementar con **Fluid & Adaptive Responsive Design** según [`docs/guides/fluid-responsive-design.md`](./fluid-responsive-design.md). DoD incluye los anchos de QA listados.

Si el ticket no especifica esto, **asumir que aplica por defecto** a cualquier página `frontend/`.

---

## 6. Recursos

- [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design)
- [MDN: Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) — útil para componentes reutilizables que viven en columnas variables.
- [Every Layout](https://every-layout.dev/) — patrones de layout intrínseco.
