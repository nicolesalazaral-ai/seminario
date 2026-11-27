# Requisitos verificables

Fecha de creación: 2026-11-27  
Documento creado en la Semana 10. No se presenta como entregable original de un módulo anterior.

## Entrevista y prioridades originales

NO EXISTE un documento de entrevista ni una matriz original Must/Should. Las prioridades siguientes son una propuesta y no deben considerarse requisitos históricos confirmados.

## HU-01

**Historia:** Como recepcionista, quiero que el sistema no me deje agendar a dos pacientes a la misma hora con el mismo médico, para evitar los cruces.

**Criterio de aceptación:** si el Dr. Daniel tiene una cita el 2 de noviembre de 2026 a las 10:00 por 20 minutos, una solicitud para agendar otra cita con el mismo médico a la misma hora debe lanzar estado 409 y el mensaje `Esa hora ya está ocupada`.

**Casos adicionales observados en el contrato real:**

- Otro médico puede tener cita a la misma hora.
- Una cita puede comenzar justo cuando termina la anterior.
- Las citas canceladas no ocupan disponibilidad.
- Una solicitud de 30 minutos solapada produce `No hay 30 minutos libres a esa hora`.
- Una lista vacía permite la cita.

Evidencia: [contrato en README](../README.md#contrato-de-disponibilidad) y [pruebas reales](../backend/test/citas.test.js).

## Otras capacidades observadas

Estas capacidades existen en el código, pero NO EXISTEN como historias documentadas con prioridad Must/Should:

- Inicio de sesión.
- Crear y consultar pacientes.
- Consultar agenda propia o agenda global según el rol.
- Agendar y mover citas como personal.
- Cambiar estados permitidos según rol.

## Propuesta de priorización

PENDIENTE DE DECISIÓN DEL ESTUDIANTE: confirmar si HU-01 debe ser Must y si las capacidades anteriores son Must o Should.
