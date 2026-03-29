# Plan: Apertura Automática de Caja

## Objetivo

Automatizar la apertura de caja para que el sistema la abra automáticamente cuando una secretaria realiza la primera operación del día que requiera caja (venta de ticket, registro de encomienda pagada, etc.), eliminando el paso manual de "Abrir Caja" cada mañana.

## Filosofía

- **Apertura:** Automática con `initial_balance = 0` (o el saldo configurable por oficina)
- **Cierre:** Sigue siendo manual con arqueo obligatorio (contar efectivo físico)
- **Fallback:** La secretaria puede seguir abriendo caja manualmente desde la página de Caja si lo desea

---

## Fase 1: Backend — Lógica de Auto-Apertura

### 1.1 Agregar campo `auto_opened` al modelo

**Archivo:** `backend/app/models/cash_register.py`

- Agregar columna `auto_opened` (Boolean, default `False`) para distinguir aperturas automáticas de manuales
- Actualizar `CashRegisterResponse` schema para incluir el campo

### 1.2 Modificar schemas

**Archivo:** `backend/app/schemas/cash_register.py`

- Agregar `auto_opened: bool = False` a `CashRegisterBase` y `CashRegisterResponse`
- No agregar a `CashRegisterCreate` (el backend lo determina)

### 1.3 Crear helper `ensure_open_register()` en CashRegisterService

**Archivo:** `backend/app/services/cash_register_service.py`

Nuevo método:

```python
def ensure_open_register(self, office_id: int, opened_by_id: int) -> CashRegister:
    """
    Retorna la caja abierta para la oficina.
    Si no existe, la abre automáticamente con initial_balance=0.
    """
    current = self.get_current_register(office_id)
    if current:
        return current
    
    return self.open_register(
        office_id=office_id,
        opened_by_id=opened_by_id,
        initial_balance=0.0,
        auto_opened=True
    )
```

### 1.4 Modificar `open_register()` para aceptar `auto_opened`

- Agregar parámetro `auto_opened: bool = False`
- Pasar el flag al crear el `CashRegister`

### 1.5 Agregar endpoint de auto-apertura (o reutilizar existente)

**Opción A (recomendada):** No agregar endpoint nuevo. El auto-open sucede dentro del mismo servicio cuando otro endpoint (ticket sale, package create, etc.) lo invoca. El frontend no llama a un endpoint de auto-open explícitamente.

### 1.6 Actualizar servicios que validan caja abierta

Reemplazar el patrón actual:

```python
# ANTES (hard block)
current_register = cash_service.get_current_register(office_id)
if not current_register:
    raise ValidationException("No hay caja abierta...")
```

Por:

```python
# DESPUÉS (auto-open)
current_register = cash_service.ensure_open_register(
    office_id=office_id,
    opened_by_id=user_id
)
```

**Archivos a modificar:**

| Archivo | Método | Cambio |
|---------|--------|--------|
| `backend/app/services/ticket_service.py` | `create_ticket()` | Reemplazar `get_current_register` + validación por `ensure_open_register()` |
| `backend/app/services/package_service.py` | `create_package()` | Reemplazar validación de caja por `ensure_open_register()` cuando `payment_status == "paid_on_send"` |
| `backend/app/services/package_service.py` | `deliver_package()` | Reemplazar validación de caja por `ensure_open_register()` cuando `payment_status == "collect_on_delivery"` |
| `backend/app/services/owner_financial_service.py` | `record_withdrawal()` | Reemplazar validación por `ensure_open_register()` |

### 1.7 Agregar configuración de saldo inicial por oficina

**Archivo:** `backend/app/models/office.py`

- Agregar campo `default_cash_balance` (Float, default `0.0`) a `Office`
- Usar este valor en `ensure_open_register()` como `initial_balance` en lugar de hardcodear `0.0`

**Archivo:** `backend/app/schemas/office.py`

- Agregar `default_cash_balance: float = 0.0` a los schemas correspondientes

---

## Fase 2: Backend — Auto-cierre nocturno (opcional)

### 2.1 Endpoint de auto-cierre

**Archivo:** `backend/app/routes/cash_register.py`

Agregar endpoint `POST /cash-registers/auto-close-stale` (protegido por rol admin):

```python
@router.post("/auto-close-stale")
async def auto_close_stale_registers(db: Session = Depends(get_db)):
    """
    Cierra todas las cajas abiertas de días anteriores.
    Se ejecuta manualmente o vía cron job.
    """
    # Buscar cajas abiertas donde date < today
    # Cerrar con final_balance = expected_balance (auto-calculado)
    # Marcar auto_closed = True
```

### 2.2 Campo `auto_closed` en modelo (opcional)

- Agregar `auto_closed: bool = False` al modelo si se desea distinguir

### 2.3 Script de cron (recomendado)

Crear `backend/scripts/auto_close_registers.py` que se ejecute a medianoche:

```bash
# crontab: 0 0 * * * cd /app && python scripts/auto_close_registers.py
```

---

## Fase 3: Frontend — Notificación de Auto-Apertura

### 3.1 Toast de notificación

Cuando el backend abre caja automáticamente, el frontend debe notificar al usuario via toast:

```
ℹ️ Caja abierta automáticamente para hoy (Saldo inicial: Bs. 0.00)
```

### 3.2 Detectar auto-apertura en la respuesta

Los servicios de frontend (ticket, package) ya reciben la respuesta del backend. Agregar lógica:

**Patrón:** Cuando se crea un ticket/paquete y la respuesta incluye `cash_register` con `auto_opened=True`, mostrar toast de notificación.

### 3.3 Indicador visual en la página de Caja

En `CashRegisterPage.tsx`, si la caja actual tiene `auto_opened = True`:

- Mostrar badge "Apertura Automática" junto al estado de la caja
- Agregar tooltip: "Esta caja fue abierta automáticamente al realizar la primera operación del día"

### 3.4 Actualizar tipos

**Archivo:** `frontend-react/src/types/cash-register.ts`

- Agregar `auto_opened?: boolean` al tipo `CashRegister`

---

## Fase 4: Frontend — Mejoras en UX de Caja

### 4.1 Botón "Abrir Caja" sigue disponible

El botón manual en `CashRegisterPage.tsx` se mantiene como fallback. Agregar texto explicativo:

```
La caja se abre automáticamente al realizar la primera venta del día.
También puede abrirla manualmente aquí si necesita configurar un saldo inicial.
```

### 4.2 Saldo inicial editable solo en apertura manual

- Si la secretaria abre manualmente: mostrar input de `initial_balance`
- Si se abre automáticamente: usar `default_cash_balance` de la oficina (default `0.0`)

### 4.3 Banner de estado de caja en la barra superior (opcional)

Agregar un indicador pequeño en `AppHeader` que muestre si la caja está abierta/cerrada:

```
🟢 Caja Abierta | 🔴 Caja Cerrada
```

---

## Fase 5: Tests

### 5.1 Backend tests

**Archivo:** `backend/tests/services/test_cash_register_service.py`

- Test: `ensure_open_register` retorna caja existente si ya está abierta
- Test: `ensure_open_register` crea caja nueva si no existe
- Test: `ensure_open_register` establece `auto_opened=True` en nueva caja
- Test: `ensure_open_register` usa `default_cash_balance` de la oficina
- Test: Venta de ticket sin caja abierta → auto-apertura + transacción registrada
- Test: Registro de paquete pagado sin caja → auto-apertura
- Test: Entrega de paquete por-cobrar sin caja → auto-apertura
- Test: Auto-cierre de cajas de días anteriores

### 5.2 Frontend tests

- Test: Toast aparece cuando caja se abre automáticamente
- Test: Badge "Apertura Automática" visible en `auto_opened=True`
- Test: Botón manual sigue funcionando

---

## Archivos a Modificar (resumen)

### Backend
| Archivo | Cambio |
|---------|--------|
| `models/cash_register.py` | Agregar `auto_opened`, `auto_closed` |
| `models/office.py` | Agregar `default_cash_balance` |
| `schemas/cash_register.py` | Agregar campos nuevos a schemas |
| `schemas/office.py` | Agregar `default_cash_balance` |
| `services/cash_register_service.py` | Agregar `ensure_open_register()`, actualizar `open_register()` |
| `services/ticket_service.py` | Usar `ensure_open_register()` |
| `services/package_service.py` | Usar `ensure_open_register()` |
| `services/owner_financial_service.py` | Usar `ensure_open_register()` |
| `routes/cash_register.py` | Agregar endpoint auto-close (opcional) |

### Frontend
| Archivo | Cambio |
|---------|--------|
| `types/cash-register.ts` | Agregar `auto_opened` |
| `pages/admin/CashRegisterPage.tsx` | Badge auto-open, texto explicativo |
| `components/cash-register/OpenRegisterModal.tsx` | Nota sobre auto-apertura |
| `components/layout/AppHeader.tsx` | Indicador de estado de caja (opcional) |

### Migración
| Archivo | Cambio |
|---------|--------|
| `migrations/versions/xxx_add_auto_opened_cash_register.py` | Alembic migration para `auto_opened`, `auto_closed`, `default_cash_balance` |

---

## Orden de Implementación

1. **Fase 1.1-1.4:** Modelo + schemas + `ensure_open_register()` (base)
2. **Fase 1.6:** Actualizar servicios consumidores (ticket, package, owner)
3. **Fase 1.7:** Saldo inicial configurable por oficina
4. **Fase 5.1:** Tests backend
5. **Fase 3:** Frontend notificación + tipos
6. **Fase 4:** UX mejoras
7. **Fase 2:** Auto-cierre nocturno (opcional, al final)
8. **Fase 5.2:** Tests frontend

---

## Verificación

1. `pytest -v` — todos los tests pasan
2. Sin caja abierta, crear un ticket → caja se abre automáticamente, transacción se registra
3. Crear segundo ticket → usa la misma caja (no duplica)
4. Abrir manualmente con saldo inicial → funciona como antes
5. Cerrar caja manualmente → arqueo funciona igual
6. `npm run lint && npx tsc --noEmit` — sin errores
