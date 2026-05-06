# Lesson 008: No comparar trip_datetime para validar si un viaje partió

**Fecha:** 2026-05-06
**Contexto:** Confirmación de venta de ticket reservado en un viaje que no ha partido

## Error

```python
# MAL — comparar fecha programada con ahora
if trip and trip.trip_datetime < datetime.now():
    raise ValidationException("Trip has already departed...")
```

**Resultado:** Un viaje cuya hora programada ya pasó pero cuyo `status` sigue siendo `scheduled` bloquea la confirmación de tickets reservados. La secretaría no puede vender.

## Causa raíz

Se confundió la **fecha programada** (`trip_datetime`) con el **estado real** del viaje (`status`). Un viaje puede tener su horario vencido pero nunca haber sido despachado (retraso, espera, etc.).

## Solución

```python
# BIEN — verificar el status real del viaje
DEPARTED_STATUSES = {"departed", "in_progress", "arrived"}
if trip and getattr(trip, "status", None) in DEPARTED_STATUSES:
    raise ValidationException("Trip has already departed...")
```

Además, agregar validación de transición con la máquina de estados para evitar transiciones inválidas.

## Regla

Siempre usar el campo `status` del modelo (o la máquina de estados) para validar si una entidad cambió de estado, nunca comparar timestamps contra `datetime.now()`.
