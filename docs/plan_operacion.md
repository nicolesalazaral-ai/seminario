# Plan de operación

Fecha de creación: 2026-11-27

## Respaldos

- La base de datos local está en `backend/data/agenda.sqlite3`.
- Antes de respaldar, detener el proceso backend para evitar inconsistencias.
- Guardar una copia fuera del repositorio en una ubicación con permisos limitados.
- NO EXISTE un comando de respaldo ni una periodicidad aprobada.

PENDIENTE DE DECISIÓN DEL ESTUDIANTE: frecuencia de respaldo, retención y restauración probada.

## Variables de entorno

Usar variables independientes:

- `SEED_PASSWORD_MARCELA`
- `SEED_PASSWORD_LAURA`
- `SEED_PASSWORD_DANIEL`
- `SEED_PASSWORD_PATRICIA`
- `PORT`
- `DB_PATH`

Rotar las contraseñas actualizando las variables y ejecutando el seed cuando corresponda. NO EXISTE una política de caducidad o rotación automática.

## Dependencias

- Ejecutar `npm audit` en backend y frontend.
- Actualizar dependencias con pruebas antes de subir cambios.
- NO EXISTE autorización para corregir las 16 vulnerabilidades moderadas del frontend.
- `npm audit` indica que la corrección disponible requiere una actualización mayor de Angular.

## Logging y disponibilidad

- NO EXISTE un sistema de logs persistentes ni una política de retención.
- NO EXISTE monitoreo de salud, alertas o procedimiento de recuperación.
- PENDIENTE DE DECISIÓN DEL ESTUDIANTE: responsable operativo y frecuencia de revisiones.
