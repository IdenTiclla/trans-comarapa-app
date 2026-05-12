# Lesson 011: Avisar al usuario antes de redirigir por sesión expirada

**Fecha:** 2026-05-12
**Contexto:** Capa de API en `lib/api.ts` — manejo de refresh token fallido

## Error

```ts
// MAL
} else {
  localStorage.removeItem('user_data')
  window.location.href = ROUTES.LOGIN
  throw new SessionExpiredError()
}
```

**Resultado:** Redirección inmediata sin aviso. El usuario pierde datos de formularios sin enterarse de qué pasó.

## Causa raíz

Se asumía que la redirección instantánea era suficiente feedback, pero los usuarios (especialmente con lectores de pantalla) no reciben ninguna notificación antes de ser redirigidos, causando pérdida de datos y confusión.

## Solución

```ts
// BIEN
import { toast } from 'sonner'

} else {
  localStorage.removeItem('user_data')
  toast.error('Su sesión ha expirado. Redirigiendo al inicio de sesión...')
  setTimeout(() => {
    window.location.href = ROUTES.LOGIN
  }, 1500)
  throw new SessionExpiredError()
}
```

## Regla

Siempre muestra un toast accesible antes de redirigir al usuario por expiración de sesión, con un delay suficiente para que el mensaje sea visible.
