# Propuesta del proyecto

Fecha de creación: 2026-11-27
Documento creado en la Semana 10. No se presenta como entregable original de un módulo anterior.

## Problema

El consultorio necesita evitar cruces al agendar citas y diferenciar las acciones permitidas a recepcionistas, auxiliares y médicos.

## Usuario

Personal de recepción, auxiliares y médicos de un consultorio pequeño.

**Proceso manual previo:** NO EXISTE en el repositorio o la bitácora una descripción verificable de cómo resolvían el problema antes.

## Solución

Desarrollé una aplicación web local compuesta por:

- Angular para la interfaz.
- Node.js y Express para la API.
- SQLite mediante `better-sqlite3` para almacenar usuarios, médicos, horarios, pacientes y citas.
- bcryptjs para contraseñas.
- Tokens aleatorios mantenidos en memoria para autenticación.

La solución permite iniciar sesión, consultar agendas, crear pacientes, agendar citas, mover citas y cambiar estados. La validación central impide solapamientos del mismo médico.

Evidencias: [README](../README.md), [bitácora de IA](../bitacora_ia.md), [HU-01](../README.md#funcionalidad-de-la-semana-5).
