# Plan de Mejora: Estandarización de Autenticación

## Objetivo

Estandarizar autenticación a un modelo simple y seguro: **cookies HTTP-Only como única fuente de credenciales**, **Redux como única fuente de verdad en memoria**, y **un único endpoint de perfil** (`GET /users/me/profile`, ya existente). Eliminar código muerto y duplicaciones, sin introducir abstracciones nuevas.

---

## 1. Hallazgos verificados (estado actual)

### Backend (`backend/routes/auth.py`, `backend/services/auth_service.py`)

1. **Tokens duplicados en cookie y JSON.** `login` y `refresh` setean cookies HTTP-Only correctamente (`_set_auth_cookies`) **pero también devuelven `access_token` y `refresh_token` en el body** (`build_response_body`, `auth_service.py:117-131`). Esto neutraliza la mitigación XSS de las cookies HTTP-Only.
2. **Endpoints `/auth/me/*` por rol son código muerto.** Existen `/me/person`, `/me/secretary`, `/me/driver`, `/me/assistant`, `/me/client`, `/me/administrator` (`auth.py:157-301`), pero **el frontend no los consume** — solo aparecen en `frontend/src/test/mocks/handlers.ts`. El endpoint unificado **ya existe** como `GET /users/me/profile` (`user_management.py:101`, schema `UnifiedProfileResponse`) y el frontend ya lo usa via `profile.service.ts:6`.
3. **Logins fallidos no se registran.** `AuthService.authenticate_user` (`auth_service.py:32-36`) lanza `UnauthorizedException` pero no emite log; los exitosos sí (`auth.py:74`). Esto impide detectar brute-force.
4. **`/auth/verify` y `/auth/me` (base) son redundantes** con `/users/me/profile`. Solo el frontend mock los referencia.

### Frontend (`frontend/src/services/auth.service.ts`, `frontend/src/store/auth.slice.ts`)

5. **Lectura innecesaria del token desde el JSON.** `auth.service.ts:30` ramifica con `if (data?.access_token)` para guardar `user_data`. Como `apiFetch` usa `credentials: 'include'`, ese campo no se necesita: basta validar `data?.user_id`.
6. **Limpieza de claves inexistentes.** `auth.service.ts:68-69` ejecuta `localStorage.removeItem('auth_token' | 'refresh_token')`, pero esas claves nunca se escriben en el código actual — es residuo de una versión anterior.
7. **Duplicación Redux ↔ localStorage.** `auth.slice.ts:97,122` escribe `localStorage.setItem('user_data', ...)` desde dentro del slice, además de actualizar el estado de Redux. La hidratación inicial (`initAuth`) lee `localStorage` correctamente, pero las escrituras están dispersas.
8. **Magic strings.** `'user_data'` y `'user_email'` aparecen repetidos en `auth.service.ts` y `auth.slice.ts`.

### Anti-patrones a corregir

- API no RESTful: rutas acopladas al rol (`/auth/me/secretary`, etc.).
- Schema de respuesta de auth (`TokenWithRoleInfo`) modela la respuesta como un token, cuando ya no debería contenerlo.
- Logout no garantiza limpieza de estado antes de redirección en flujos de fallo (`api.ts:132`).

---

## 2. Plan de cambios

### Fase 1 — Backend: limpieza y endurecimiento

1. **Eliminar tokens del body de respuesta.**
   - Renombrar `TokenWithRoleInfo` → `AuthSuccessResponse` en `schemas/auth.py`.
   - Quitar campos `access_token`, `token_type`, `expires_in`, `refresh_token`, `refresh_token_expires_in`.
   - Conservar: `user_id`, `role`, `firstname`, `lastname`, `person`, `office_id` (lo necesario para hidratar UI tras login).
   - Actualizar `AuthService.build_response_body` (`auth_service.py:117`) y firmas en `auth.py:58,109`.

2. **Eliminar endpoints fragmentados de perfil.**
   - Borrar de `routes/auth.py`: `/me/person`, `/me/secretary`, `/me/driver`, `/me/assistant`, `/me/client`, `/me/administrator`, `/verify`. Borrar también el helper `get_user_person_info` si queda sin uso (verificar con `grep`).
   - Conservar `GET /auth/me` y `PUT /auth/me` (datos básicos `User`) **o** redirigirlos al endpoint unificado. Decisión: **eliminar `/auth/me` GET** y dejar `/users/me/profile` como única fuente; mantener `PUT /auth/me` solo si se usa (verificar consumo).
   - Actualizar `frontend/src/test/mocks/handlers.ts` para apuntar a `/users/me/profile`.

3. **Loggear intentos fallidos de login.**
   - En `AuthService.authenticate_user`: emitir `logger.warning(f"Failed login attempt for {email} from <ip>")` antes de lanzar la excepción. Pasar la IP desde la ruta (parámetro opcional al servicio o, más simple, loggear la IP en el `except` del route handler en `auth.py:72`).
   - Sin tabla de auditoría, sin lockout: solo log estructurado. Suficiente para detección via agregación.

### Fase 2 — Frontend: una sola fuente de verdad

4. **Limpiar `auth.service.ts`.**
   - Quitar el chequeo `if (data?.access_token)`; usar `data?.user_id` como señal de éxito.
   - Eliminar las líneas que limpian `auth_token` / `refresh_token` (claves que no existen).
   - Eliminar el guardado de `user_email` (redundante con `user_data.email`).

5. **Centralizar acceso a `localStorage` con dos constantes, sin nueva capa.**
   - En `auth.slice.ts`, declarar `const USER_STORAGE_KEY = 'user_data'` y un par de helpers locales `readUser()` / `writeUser()` / `clearUser()`.
   - Mover ahí toda lectura/escritura: hoy dispersa entre `auth.service.ts` (login, logout, refresh) y `auth.slice.ts` (`loadProfile`, `updateProfile`).
   - **No** crear `lib/storage.ts`: una sola clave no justifica un módulo.

6. **Redux como fuente de verdad en memoria; `localStorage` solo para hidratar.**
   - El slice escribe a `localStorage` en exactamente tres puntos: `login.fulfilled`, `loadProfile.fulfilled`, `updateProfile.fulfilled`. Un único `extraReducers` builder, no escrituras inline en thunks.
   - `logout.fulfilled` llama `clearUser()`.
   - Quitar las escrituras a `localStorage` que hoy viven dentro de los thunks (`auth.slice.ts:97, 122`) y dentro de `auth.service.ts:40, 88`.

7. **Tipos: alinear `LoginResponse`/`RefreshResponse` con el nuevo schema.**
   - Quitar `access_token`, `refresh_token`, `expires_in`, `token_type` de `frontend/src/types/auth.ts`.
   - Verificar que ningún consumidor depende de esos campos (`grep -rn "access_token\|refresh_token" frontend/src`).

8. **Garantizar limpieza antes de redirección por sesión expirada.**
   - En `api.ts:131-134`, antes de `window.location.href = ROUTES.LOGIN`, llamar `clearUser()` (o despachar `logout` con `skipServerLogout=true`). Evita estado zombie si el usuario vuelve atrás.

### Fase 3 — Verificación

9. **Tests.** Ajustar `backend/tests/unit/test_auth*.py` y mocks de frontend (`handlers.ts`) al nuevo schema sin tokens y sin endpoints `/auth/me/*`.
10. **Smoke manual:** login, refresh tras expiración del access token, logout, recarga de página (hidratación), update de perfil. Verificar en DevTools que `Set-Cookie` sigue presente y que el body no contiene tokens.

---

## 3. Fuera de alcance (intencional)

- Crear `lib/storage.ts` u otra abstracción genérica de storage (una sola clave no lo amerita).
- Implementar tabla de auditoría de logins (log estructurado es suficiente para esta etapa).
- Lockout/rate limiting adicional en login (ya hay `slowapi` configurado en `/refresh`; extender a `/login` puede tratarse en un plan aparte si hay necesidad).
- Cambios en JWT (algoritmo, claims, JTI/blacklist) — el modelo actual es correcto.
- Migrar `/auth/me` `PUT` y otras rutas no relacionadas a perfil.

---

## 4. Aprobación requerida

> [!IMPORTANT]
> 1. **Eliminación de `/auth/me/*` por rol y `/auth/verify`**: son código muerto (no se consumen desde frontend). Confirmar borrado.
> 2. **Quitar tokens del body**: la cookie HTTP-Only es la única vía de credenciales tras este cambio. Confirmar.
> 3. **No crear `lib/storage.ts`**: centralizamos en el slice con dos helpers locales. Confirmar (o pedir el módulo si prefieres).
