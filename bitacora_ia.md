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

- **Fecha:** 2026-11-27
- **Prompt o sugerencia:** Documenté las funciones principales de `citasService.js`, las rutas de `server.js`, actualicé el README con las ocho secciones solicitadas y agregué `.env.example` sin valores reales.
- **Decisión:** Aceptada
- **Por qué:** La documentación quedó alineada con el código real; el README conserva la funcionalidad de la semana 5 y solo usa comandos que existen en el proyecto.
- **Verificación:** Revisé las firmas y respuestas contra el código, ejecuté `npm test` y `npm run lint`, y ambos quedaron en verde.
- **Commit relacionado:** `9dac0f9f1f4c77689411ad1624bf224e0e635ab2`.

### Entrada 7

- **Fecha:** 2026-11-27
- **Prompt o sugerencia:** Configuré ESLint en `backend/` con reglas recomendadas y `eslint-plugin-security`, agregué el script `lint`, ejecuté el linter y no corregí código de seguridad sin confirmación.
- **Decisión:** Aceptada
- **Por qué:** `backend/eslint.config.js` aporta reglas JavaScript y de seguridad sin alterar el comportamiento existente, y el script permite repetir la revisión.
- **Verificación:** Ejecuté `npm --prefix backend run lint`; terminó sin errores ni avisos. Commit relacionado: `7ab373e963134f9972330923ceeb88e2a0d043b8`.

### Entrada 8

- **Fecha:** 2026-11-27
- **Prompt o sugerencia:** Corregí las contraseñas compartidas del seed y el binding público de la API. Luego agregué pruebas de cuentas con contraseñas distintas y de escucha exclusiva en loopback.
- **Decisión:** Aceptada con cambios
- **Por qué:** Las correcciones separan credenciales por cuenta y evitan que el servidor sea alcanzable desde otros equipos. Además, las variables se mantienen fuera del código y los hallazgos tienen pruebas reproducibles.
- **Verificación:** Las 9 pruebas de backend pasaron y `npm run lint` quedó limpio. Commits relacionados: `bbdf24adfc3727a5e424a5a9626d9f5ad0ce5097` y `f3b8bd6d4f1459330de65adce488ea3788cb5684`.

### Entrada 9

- **Fecha:** 2026-11-27
- **Prompt o sugerencia:** Creé el informe con la plantilla adjunta y completé la bitácora con hechos verificables sobre herramientas, commits, hallazgos y pendientes.
- **Decisión:** Aceptada
- **Por qué:** La documentación conserva la semana 5, registra los cambios reales y separa hallazgos corregidos de pendientes no autorizados.
- **Verificación:** Confirmé commits con `git log`, ejecución de tests y lint, `.env.example` sin valores reales y el estado limpio antes del commit documental.
- **Commit relacionado:** `00a46edf1c879348eb060bb4ad4d43324da7e92` — Agrega informe y bitácora de revisión de seguridad.

### Entrada 10

- **Fecha:** 2026-11-27
- **Herramienta:** GitHub Copilot.
- **Propósito:** Preparar autónomamente los documentos finales del proyecto integrador, verificar el estado con Git y backend, crear los documentos faltantes de la rúbrica y preparar el pipeline.
- **Archivos creados o modificados:** `docs/estado_verificado.md`, `docs/propuesta.md`, `docs/requisitos.md`, `docs/diseno.md`, `docs/adr/ADR-001.md`, `docs/plan_pruebas.md`, `docs/guia_despliegue.md`, `docs/plan_operacion.md`, `docs/aviso_privacidad_borrador.md`, `docs/informe_final.md`, `.github/workflows/ci.yml`, `README.md` y esta entrada.
- **Verificación:** Ejecuté `git log --oneline`, `git branch`, `npm test` y `npm run lint` en backend. Las 9 pruebas pasaron y el linter quedó sin errores ni avisos. Confirmé correcciones con `git show` y auditoría frontend con `npm audit`.
- **Nota:** La revisión final de contenido, licencia, responsabilidad y aviso de privacidad será humana.
- **Commits relacionados:** `1840e85` — Prepara documentos finales del integrador; `ec819cb` — Agrega pipeline CI de backend.

### Entrada 11

- **Fecha:** 2026-11-27
- **Herramienta:** GitHub Copilot.
- **Propósito:** Consolidar en un único archivo toda la información verificable necesaria para redactar el informe y preparar las diapositivas, sin inventar datos ni copiar información personal real.
- **Archivos creados:** `docs/datos_para_informe.md`.
- **Archivos relacionados revisados:** `README.md`, `bitacora_ia.md`, `revision_seguridad.md`, los documentos de `docs/`, el historial de Git y los archivos de pruebas backend.
- **Verificación:** Ejecuté `git log --oneline -20`, `git branch --show-current`, `npm test` y `npm run lint` en backend. Las 9 pruebas pasaron y el linter no mostró errores ni avisos. Verifiqué los casos de contraseña compartida, binding local y contraseña visible con `git show`.
- **Nota:** La revisión final de datos personales, licencia, responsabilidad y privacidad es humana. El pipeline se deja marcado como pendiente de verificación en GitHub.
- **Commit relacionado:** `dec4feda85c39d61253b9fa188ae82174811dd4c` — Consolida datos verificados del integrador.

## Resumen

| Decisión | Cantidad |
|---|---|
| Aceptadas | 6 |
| Aceptadas con cambios | 2 |
| Rechazadas | 1 |

## Errores que atraparon las pruebas

Con el código que generó Copilot, las 6 pruebas iniciales pasaron a la primera. Para comprobar que sí detectan errores, en el commit en rojo desactivé la función `validarDisponibilidad` y fallaron las pruebas `rechaza la misma hora del mismo médico con el mensaje de HU-01` y `detecta el cruce cuando una cita de 30 minutos se solapa con una existente`. Al restaurar la función, volvieron a pasar. Además, no fue una prueba sino mi revisión la que detectó la diferencia entre mi contrato y el código real (entrada 4) y la contraseña expuesta (entrada 5).

## Reflexión final (5 a 8 líneas)

El asistente me ayudó más al crear el proyecto completo y las 6 pruebas de HU-01, porque pude concentrarme en revisar las reglas del consultorio y no en escribir toda la base. Lo que más aprendí es que el contrato debe salir del código real: mi borrador decía que la función devolvía verdadero o falso, pero la de Copilot lanza un error 409, así que ajusté el contrato y no el código. Las pruebas pasaron a la primera, y para ver que de verdad detectan errores dejé la función desactivada en el commit en rojo y fallaron las pruebas de cruce. También encontré, revisando y no con pruebas, que la contraseña de prueba aparecía en el HTML y en el README, y la saqué antes del primer commit. Como el código ya existía antes que las pruebas, reconstruí el orden de los commits (pruebas en rojo, en verde y refactor) y lo dejo dicho aquí. En la próxima funcionalidad escribiría el contrato y las pruebas antes de pedirle el código al asistente.
