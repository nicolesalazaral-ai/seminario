# Bitácora de uso de IA

Proyecto: Agenda de citas para un consultorio médico
Estudiante: Nicole Salazar
Funcionalidad: HU-01 No agendar dos citas a la misma hora con el mismo médico
Asistente usado: GitHub Copilot (modo Agent y chat) para el proyecto, las pruebas y la revisión; Claude (chat) para redactar el contrato y los prompts.

## Entradas

### Entrada 1

- **Fecha:** 2026-11-07
- **Prompt o sugerencia:** Prompt de creación del proyecto enviado a Copilot en modo Agent: «Actúa como un desarrollador web que enseña a un estudiante de ingeniería de software. Necesito crear desde cero un sistema web sencillo para agendar las citas de un consultorio médico pequeño…», con la arquitectura (Angular, Node.js con Express y SQLite), las reglas de negocio, la API y las restricciones.
- **Decisión:** Aceptada
- **Por qué:** Respeta el diseño de la semana 4 (ADR-001): aplicación web en la red local con SQLite, sin librerías de más. Copilot creó `backend/` y `frontend/` con las reglas de negocio pedidas.
- **Verificación:** Abrí la aplicación en el navegador (`localhost:4200`), entré como marcela y agendé una cita; mostró «Cita agendada correctamente».
- **Commit relacionado:** Proyecto base de la agenda de citas

### Entrada 2

- **Fecha:** 2026-11-07
- **Prompt o sugerencia:** Copilot implementó la función `validarDisponibilidad(medicoId, fechaHora, duracion, citaId = null)` en `backend/src/citasService.js`. Consulta SQLite y, si hay cruce, lanza `ErrorDeSolicitud` con estado 409.
- **Decisión:** Aceptada
- **Por qué:** El parámetro `citaId` es necesario para mover una cita (`PATCH /citas/:id`) sin que choque con ella misma, y lanzar el error 409 encaja con las rutas `crearCita` y `moverCita` de `server.js` y con los códigos de estado de mi diseño.
- **Verificación:** Leí el código y comprobé que se usa en `POST /citas` y `PATCH /citas/:id`. Corrí `npm test` en `backend` y pasaron las 6 pruebas.
- **Commit relacionado:** HU-01: pruebas en verde con la implementación de validarDisponibilidad

### Entrada 3

- **Fecha:** 2026-11-07
- **Prompt o sugerencia:** Prompt para escribir las pruebas primero: 6 pruebas en `backend/test/` con `node:test`, sin tocar la implementación. Copilot propuso simular SQLite con una lista de citas en memoria para no usar la base real.
- **Decisión:** Aceptada
- **Por qué:** Las 6 pruebas cubren el contrato: 2 casos normales (otro médico a la misma hora; lista de citas vacía), 2 de límite (una cita que empieza justo cuando termina la anterior; una cita cancelada que no ocupa la hora) y 2 de error (la misma hora del mismo médico y el cruce con una cita de 30 minutos). Probar con una lista en memoria evita tocar los datos reales.
- **Verificación:** Corrí `npm test` en `backend`: 6 pruebas, todas pasan. En el commit en rojo, con la función desactivada, fallaron las pruebas de cruce.
- **Commit relacionado:** Contrato de HU-01 y pruebas por pedir (en rojo)

### Entrada 4

- **Fecha:** 2026-11-07
- **Prompt o sugerencia:** Mi borrador de contrato decía que la función era `hayCruce(...)` y que devolvía `true` o `false`.
- **Decisión:** Rechazada
- **Por qué:** La función real devuelve `undefined` cuando la hora está libre y lanza un error 409 cuando hay cruce. Cambiar el código para que devolviera un booleano obligaría a modificar `crearCita` y `moverCita`, que ya dependen de ese error, así que cambié el contrato y no el código.
- **Verificación:** Pedí a Copilot el nombre, el archivo y la firma reales de la función, y escribí el contrato del README con esos datos. Las 6 pruebas siguen pasando sin modificarlas.
- **Commit relacionado:** Contrato de HU-01 y pruebas por pedir (en rojo)

### Entrada 5

- **Fecha:** 2026-11-07
- **Prompt o sugerencia:** El código generado por Copilot incluía la contraseña de prueba en `seed.js`, en `README.md` y en `app.component.html`.
- **Decisión:** Aceptada con cambios
- **Por qué:** Una contraseña escrita en el código y visible en la pantalla no debe subirse al repositorio. Usé una variable de entorno (`SEED_PASSWORD`) para crear los usuarios de prueba, quité la clave del README y del HTML, y agregué `.env` al `.gitignore`.
- **Verificación:** Busqué la clave en todo el proyecto antes del primer commit y ya no aparece. Corrí el seed con la variable definida y pude entrar a la aplicación.
- **Commit relacionado:** Proyecto base de la agenda de citas

### Entrada 6

- **Fecha:** 2026-11-07
- **Prompt o sugerencia:** [Completa después del refactor: qué le pediste a Copilot o qué hiciste tú, por ejemplo cambiar números fijos como 20 y 30 por constantes con nombre.]
- **Decisión:** [Aceptada | Aceptada con cambios | Rechazada]
- **Por qué:** [Razón: qué mejoró en el código.]
- **Verificación:** [Corrí `npm test` y las 6 pruebas siguieron pasando sin modificarlas.]
- **Commit relacionado:** []

## Resumen

| Decisión | Cantidad |
|---|---|
| Aceptadas | 3 |
| Aceptadas con cambios | 1 (más la entrada 6 si corresponde) |
| Rechazadas | 1 |

## Errores que atraparon las pruebas

Con el código que generó Copilot, ninguna de las 6 pruebas falló: pasaron a la primera. Para comprobar que las pruebas sí detectan errores, en el commit en rojo desactivé la función `validarDisponibilidad` y fallaron las pruebas que esperan el rechazo: [escribe aquí los nombres exactos de las pruebas que fallaron al correr `npm test`]. Al restaurar la función, volvieron a pasar. Además, no fue una prueba sino mi revisión la que detectó la diferencia entre mi contrato y el código real (entrada 4) y la contraseña expuesta (entrada 5).

## Reflexión final (5 a 8 líneas)

El asistente me ayudó más al crear el proyecto completo y las 6 pruebas de HU-01, porque pude concentrarme en revisar las reglas del consultorio y no en escribir toda la base. Lo que más aprendí es que el contrato debe salir del código real: mi borrador decía que la función devolvía verdadero o falso, pero la de Copilot lanza un error 409, así que ajusté el contrato y no el código. Las pruebas pasaron a la primera, y para ver que de verdad detectan errores dejé la función desactivada en el commit en rojo y fallaron las pruebas de cruce. También encontré, revisando y no con pruebas, que la contraseña de prueba aparecía en el HTML y en el README, y la saqué antes del primer commit. Como el código ya existía antes que las pruebas, reconstruí el orden de los commits (pruebas en rojo, en verde y refactor) y lo dejo dicho aquí. En la próxima funcionalidad escribiría el contrato y las pruebas antes de pedirle el código al asistente.
