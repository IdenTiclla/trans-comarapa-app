# Lesson 006: No uses rutas hardcodeadas en onClose de modales

**Fecha:** 2026-04-25
**Contexto:** Secretary Dashboard → click "Nuevo Paquete" → cierra el modal → redirige a `/packages` en vez de volver al dashboard

## Error

```tsx
// MAL — siempre redirige a /packages sin importar de dónde vino el usuario
onClose={() => navigate('/packages')}
```

**Resultado:** Al cerrar el modal desde el dashboard de secretaria, el usuario es enviado a `/packages` en vez de permanecer en el dashboard.

## Causa raíz

El `onClose` del modal estaba hardcodeado a una ruta específica (`/packages`) sin considerar que el modal puede ser accedido desde distintas páginas (dashboard, listado de paquetes, etc.).

## Solución

```tsx
// BIEN — vuelve a la página anterior
onClose={() => navigate(-1)}
```

## Regla

Siempre usa `navigate(-1)` en callbacks de cierre de modales/pages que actúan como overlay, a menos que exista un destino fijo justificado.
