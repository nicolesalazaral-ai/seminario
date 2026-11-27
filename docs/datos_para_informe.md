# Datos verificados para el informe y las diapositivas

Fecha de consolidación: 2026-11-27

Este documento contiene exclusivamente información verificada en el repositorio, el historial de Git o la ejecución local de los comandos indicados. NO sustituye la revisión humana ni contiene afirmaciones sobre GitHub Actions.

## A. Plantilla y entregables

### Plantilla

Existe una plantilla en `C:\Users\User\Documents\informe_final_integrador\informe_final_integrador.md`, fuera del repositorio. En el repositorio no existe `informe_final_integrador.md`.

El informe puede seguir la estructura de la rúbrica:

1. Problema y solución.
2. Uso de IA en el ciclo de vida.
3. Evidencias.
4. Casos de verificación.
5. Reflexión ética y legal.
6. Ética y legal aplicada al proyecto.
7. Limitaciones y pendientes.
8. Conclusiones y aprendizajes.

Existe [docs/informe_final.md](informe_final.md), elaborado en la Semana 10 con esa estructura.

### Entregables encontrados

- Existe `docs/`: [docs/](./).
- Existe `README.md` actualizado: [README.md](../README.md).
- Existe `.github/workflows/`: [.github/workflows/ci.yml](../.github/workflows/ci.yml).
- Existe `revision_seguridad.md`: [revision_seguridad.md](../revision_seguridad.md).
- Existe `bitacora_ia.md`: [bitacora_ia.md](../bitacora_ia.md).

## B. Estado verificado

### Rama y log

Comando ejecutado:

```powershell
git branch --show-current
git branch --list
git log --oneline -20
```

Salida textual verificada:

```text
main
* main
ebca4b0 Completa referencias y formato del informe final
ec819cb Agrega pipeline CI de backend
1840e85 Prepara documentos finales del integrador
a455f10 Completa referencias finales de revision documental
00a46ed Agrega informe y bitacora de revision de seguridad
7fb9251 Limpia el formato del README
9dac0f9 Documenta uso local y contratos de la API
f3b8bd6 Limita la aplicación a conexiones locales
bbdf24a Asigna contraseñas únicas a usuarios seed
7ab373e Configura ESLint de seguridad en backend
98f1e72 Implementa agenda médica y pruebas HU-01
```

### Pruebas backend

Comando ejecutado:

```powershell
cd backend
npm test
```

Salida textual relevante verificada:

```text
✔ rechaza la misma hora del mismo médico con el mensaje de HU-01
✔ permite la misma hora cuando corresponde a otro médico
✔ permite una cita que empieza justo cuando termina la anterior
✔ ignora las citas canceladas al comprobar el mismo horario
✔ detecta el cruce cuando una cita de 30 minutos se solapa con una existente
✔ permite la hora solicitada cuando la lista de citas está vacía
✔ el servidor HTTP solo escucha en loopback
✔ el seed exige contraseñas distintas y evita autenticación cruzada entre roles
✔ el seed rechaza la misma contraseña para cuentas con roles distintos

tests 9
pass 9
fail 0
```

### Linter backend

Comando ejecutado:

```powershell
cd backend
npm run lint
```

Salida textual verificada: no imprimió errores ni avisos.

### Inventario de documentos

| Documento | Estado |
|---|---|
| Propuesta, módulo 1 | Existe en [docs/propuesta.md](propuesta.md), creado en la Semana 10; NO EXISTE como entregable original identificado antes de esta semana. |
| Requisitos, módulo 2 | Existe en [docs/requisitos.md](requisitos.md), creado en la Semana 10; NO EXISTE una entrevista o matriz original identificable. |
| Diseño | Existe [docs/diseno.md](diseno.md), creado en la Semana 10. |
| ADR | Existe [docs/adr/ADR-001.md](adr/ADR-001.md), creado en la Semana 10 para documentar una decisión previa. |
| Revisión de código | Existe [revision_seguridad.md](../revision_seguridad.md). |
| Plan de pruebas | Existe [docs/plan_pruebas.md](plan_pruebas.md). |
| Guía de despliegue | Existe [docs/guia_despliegue.md](guia_despliegue.md). |
| Plan de operación | Existe [docs/plan_operacion.md](plan_operacion.md). |
| README | Existe [README.md](../README.md) y fue actualizado con enlaces a `docs/`. |

## C. Problema, usuario y solución

### Problema y usuario

- Problema: evitar cruces al agendar citas y separar operaciones según rol.
- Usuario objetivo: personal de recepción, auxiliares y médicos de un consultorio pequeño.
- Roles observados: recepcionista, auxiliar y médico.
- Proceso manual previo: NO EXISTE una descripción verificable en el repositorio o la bitácora.
- Evidencia: [README.md](../README.md), [docs/propuesta.md](propuesta.md), [bitacora_ia.md](../bitacora_ia.md).

### Arquitectura real

- Frontend: Angular standalone.
- Backend: Node.js y Express.
- Persistencia: SQLite mediante `better-sqlite3`.
- Contraseñas: bcryptjs.
- Sesiones: `Map` en memoria con tokens aleatorios de 32 bytes.
- Binding actual: `127.0.0.1`.
- Evidencias: [backend/src/server.js](../backend/src/server.js), [backend/src/citasService.js](../backend/src/citasService.js), [backend/src/db.js](../backend/src/db.js), [frontend/src/app/app.component.ts](../frontend/src/app/app.component.ts).

### Rutas principales del backend

| Método | Ruta | Evidencia |
|---|---|---|
| POST | `/sesiones` | [backend/src/server.js](../backend/src/server.js):79 |
| POST | `/pacientes` | [backend/src/server.js](../backend/src/server.js):104 |
| GET | `/pacientes` | [backend/src/server.js](../backend/src/server.js):124 |
| POST | `/citas` | [backend/src/server.js](../backend/src/server.js):145 |
| GET | `/medicos/:id/citas` | [backend/src/server.js](../backend/src/server.js):156 |
| GET | `/citas` | [backend/src/server.js](../backend/src/server.js):176 |
| PATCH | `/citas/:id` | [backend/src/server.js](../backend/src/server.js):191 |
| PUT | `/citas/:id/estado` | [backend/src/server.js](../backend/src/server.js):203 |

### Historias de usuario

Solo existe una historia con criterio de aceptación explícito:

**HU-01:** como recepcionista, quiero impedir que dos pacientes tengan una cita a la misma hora con el mismo médico.

**Criterio:** si el Dr. Daniel tiene una cita el 2 de noviembre de 2026 a las 10:00 por 20 minutos, una nueva cita del mismo médico a la misma hora debe no guardar y avisar `Esa hora ya está ocupada`.

**Estado documentado:** terminada y cubierta por `backend/test/citas.test.js`.

NO EXISTE una matriz original de historias Must/Should ni estados verificables para otras historias. El repositorio sí muestra capacidades de pacientes y estados según rol, pero no las presenta como una matriz de historias.

Evidencia: [README.md](../README.md), [docs/requisitos.md](requisitos.md).

## D. Uso de IA por fase

| Fase | Qué se hizo con IA | Herramienta | Evidencia de bitácora | Commit verificado con `git show` | Verificación |
|---|---|---|---|---|---|
| Requisitos | Implementar y ajustar el contrato de disponibilidad; Claude ayudó a redactar el contrato. | GitHub Copilot y Claude | [Entradas 2-4](../bitacora_ia.md) | [98f1e72](https://github.com/nicolesalazaral-ai/seminario/commit/98f1e7207f6644eaa77ab91bd5fb2e584202d043), mensaje `Implementa agenda médica y pruebas HU-01` | Comparé contrato, código y pruebas. NO EXISTE evidencia que atribuya el borrador booleano directamente a Copilot. |
| Diseño | Generar una arquitectura Angular/Express/SQLite y los archivos iniciales. | GitHub Copilot | [Entrada 1](../bitacora_ia.md) | [98f1e72](https://github.com/nicolesalazaral-ai/seminario/commit/98f1e7207f6644eaa77ab91bd5fb2e584202d043) | Contraste contra [docs/diseno.md](diseno.md) y el código real. |
| Código | Generar el seed, rutas y lógica inicial; después corregir contraseñas compartidas y exposición de red. | GitHub Copilot | [Entradas 5 y 8](../bitacora_ia.md) | [bbdf24a](https://github.com/nicolesalazaral-ai/seminario/commit/bbdf24adfc3727a5e424a5a9626d9f5ad0ce5097), `Asigna contraseñas únicas a usuarios seed`; [f3b8bd6](https://github.com/nicolesalazaral-ai/seminario/commit/f3b8bd6d4f1459330de65adce488ea3788cb5684), `Limita la aplicación a conexiones locales` | `git show`, pruebas de seed y prueba de loopback. |
| Pruebas | Proponer pruebas `node:test` con SQLite simulado en memoria para HU-01. | GitHub Copilot | [Entrada 3](../bitacora_ia.md), sección “Errores que atraparon las pruebas” | [98f1e72](https://github.com/nicolesalazaral-ai/seminario/commit/98f1e7207f6644eaa77ab91bd5fb2e584202d043) | Ejecución real de `npm test`: 9 pruebas pasadas. |
| Operación | Configurar ESLint, corregir binding, documentar seguridad y preparar CI. | GitHub Copilot | [Entradas 7-9](../bitacora_ia.md) | [7ab373e](https://github.com/nicolesalazaral-ai/seminario/commit/7ab373e963134f9972330923ceeb88e2a0d043b8), `Configura ESLint de seguridad en backend`; [00a46ed](https://github.com/nicolesalazaral-ai/seminario/commit/00a46edf1c879348eb060bb4ad4d43324da7e92), `Agrega informe y bitacora de revision de seguridad` | `npm run lint` sin errores ni avisos; `git show` confirmó los cambios. |
| Documentación y ética | Crear estructura documental, informe, borrador de privacidad y entradas de bitácora. | GitHub Copilot | [Entrada 10](../bitacora_ia.md) | [1840e85](https://github.com/nicolesalazaral-ai/seminario/commit/1840e85), `Prepara documentos finales del integrador` | Archivos creados revisados en el repositorio; las decisiones jurídica, de licencia y responsabilidad permanecen pendientes. |

## E. Casos de verificación

### Caso 1: contraseñas compartidas entre cuentas

- Fase: Código/seguridad.
- Qué propuso el código inicial: un único hash de `SEED_PASSWORD` asignado a recepcionista, auxiliar y médicos.
- Error o riesgo: una contraseña conocida podía autenticar cuentas de otros roles.
- Cómo se detectó: revisión de [backend/src/seed.js](../backend/src/seed.js) y [backend/src/server.js](../backend/src/server.js).
- Prueba exacta: `el seed exige contraseñas distintas y evita autenticación cruzada entre roles`.
- Prueba adicional: `el seed rechaza la misma contraseña para cuentas con roles distintos`.
- Corrección: variables independientes por cuenta, validación de contraseñas diferentes y hash individual.
- Commit verificado: [bbdf24a](https://github.com/nicolesalazaral-ai/seminario/commit/bbdf24adfc3727a5e424a5a9626d9f5ad0ce5097), mensaje `Asigna contraseñas únicas a usuarios seed`.
- Evidencia: [backend/test/seed.security.test.js](../backend/test/seed.security.test.js).

### Caso 2: API expuesta fuera de localhost

- Fase: Operación/seguridad.
- Qué propuso el código inicial: escuchar el backend y Angular en `0.0.0.0`.
- Error o riesgo: acceso desde la red local y exposición de credenciales, tokens y datos por HTTP.
- Cómo se detectó: revisión de [backend/src/server.js](../backend/src/server.js) y [frontend/package.json](../frontend/package.json).
- Prueba exacta: `el servidor HTTP solo escucha en loopback`.
- Corrección: binding del backend y Angular a `127.0.0.1`.
- Commit verificado: [f3b8bd6](https://github.com/nicolesalazaral-ai/seminario/commit/f3b8bd6d4f1459330de65adce488ea3788cb5684), mensaje `Limita la aplicación a conexiones locales`.
- Evidencia: [backend/test/network.security.test.js](../backend/test/network.security.test.js).

### Caso 3: contraseña visible en el código

- Fase: Código/secretos.
- Qué propuso el código inicial: una clave compartida podía aparecer en `seed.js`, `README.md` y el frontend.
- Error o riesgo: una clave escrita en archivos rastreados podía quedar publicada.
- Cómo se detectó: revisión manual documentada en [Entrada 5](../bitacora_ia.md).
- Corrección: uso de variables de entorno, `.env` en `.gitignore` y variables independientes por cuenta.
- Commit base donde apareció: [98f1e72](https://github.com/nicolesalazaral-ai/seminario/commit/98f1e7207f6644eaa77ab91bd5fb2e584202d043), mensaje `Implementa agenda médica y pruebas HU-01`.
- Corrección posterior verificada: [bbdf24a](https://github.com/nicolesalazaral-ai/seminario/commit/bbdf24adfc3727a5e424a5a9626d9f5ad0ce5097).
- Evidencia: [.gitignore](../.gitignore), [.env.example](../.env.example), [backend/src/seed.js](../backend/src/seed.js).

Se descarta `.env.example` como caso principal: fue una omisión detectada por revisión, no una propuesta incorrecta verificable de la IA.

## F. Pruebas y ejecución

### Pruebas reales

| Archivo | Nombre exacto | Qué verifica |
|---|---|---|
| [backend/test/citas.test.js](../backend/test/citas.test.js) | `rechaza la misma hora del mismo médico con el mensaje de HU-01` | Estado 409 y mensaje al intentar ocupar la misma hora con el mismo médico. |
| [backend/test/citas.test.js](../backend/test/citas.test.js) | `permite la misma hora cuando corresponde a otro médico` | El mismo horario no cruza si cambia el médico. |
| [backend/test/citas.test.js](../backend/test/citas.test.js) | `permite una cita que empieza justo cuando termina la anterior` | Los intervalos contiguos no se consideran solapados. |
| [backend/test/citas.test.js](../backend/test/citas.test.js) | `ignora las citas canceladas al comprobar el mismo horario` | Una cita cancelada no ocupa disponibilidad. |
| [backend/test/citas.test.js](../backend/test/citas.test.js) | `detecta el cruce cuando una cita de 30 minutos se solapa con una existente` | Solapamiento de 30 minutos y mensaje específico. |
| [backend/test/citas.test.js](../backend/test/citas.test.js) | `permite la hora solicitada cuando la lista de citas está vacía` | Agenda vacía permite crear la solicitud. |
| [backend/test/network.security.test.js](../backend/test/network.security.test.js) | `el servidor HTTP solo escucha en loopback` | La dirección escuchada es `127.0.0.1`. |
| [backend/test/seed.security.test.js](../backend/test/seed.security.test.js) | `el seed exige contraseñas distintas y evita autenticación cruzada entre roles` | Cada cuenta compara contra su propia contraseña. |
| [backend/test/seed.security.test.js](../backend/test/seed.security.test.js) | `el seed rechaza la misma contraseña para cuentas con roles distintos` | El seed falla si todas las cuentas reciben la misma contraseña. |

### Comandos en vivo

```powershell
cd backend
npm test
npm run lint
npm test -- --test-name-pattern="seed"
npm test -- --test-name-pattern="loopback"
```

### Entrada de bitácora recomendada

- Archivo: [bitacora_ia.md](../bitacora_ia.md).
- Entrada más útil para seguridad y sustentación: Entrada 8.
- Entrada más útil para el proceso completo: Entrada 3.
- Entrada 10 registra el trabajo documental actual, pero debe verificarse el hash del commit que la contiene.

## G. Ética y legal aplicada al proyecto

### Datos personales

El sistema maneja nombre de paciente, celular, cita, horario, estado y rol.

Si incorpora diagnósticos, resultados clínicos o datos de salud, puede aplicar el régimen de datos sensibles del artículo 5 de la Ley 1581 de 2012.

### Protección actual

Medidas existentes:

- bcryptjs para hashes de contraseñas.
- Parámetros SQL enlazados en consultas.
- Variables de entorno para contraseñas de seed.
- `.env` excluido por `.gitignore`.
- Binding actual a `127.0.0.1`.

Lo que NO EXISTE:

- Cifrado de la base SQLite completa.
- Cifrado a nivel de campos.
- Política documentada de conservación y eliminación.
- Caducidad o revocación formal documentada para tokens.

### Sesgo

Riesgos concretos observados:

- Horarios fijos por día de la semana.
- Reglas manuales de asignación y atención.
- Ausencia de evaluación de impacto o sesgo.

El sistema no usa modelos predictivos ni clasificación automatizada de pacientes.

### Transparencia sobre IA

El uso de Copilot se menciona en [README.md](../README.md) y en [bitacora_ia.md](../bitacora_ia.md). NO EXISTE un aviso visible dentro de la aplicación.

**Propuesta de texto para la interfaz:** «Esta interfaz fue desarrollada con apoyo de herramientas de inteligencia artificial. Las decisiones del sistema deben ser revisadas por personal autorizado».

Este texto es una propuesta y requiere decisión de interfaz.

### Responsabilidad por errores

NO EXISTE una asignación formal de responsabilidad.

**PENDIENTE DE DECISIÓN DEL ESTUDIANTE — propuesta:** «La institución usuaria es responsable de verificar datos, autorizaciones y decisiones tomadas con el sistema, y el responsable operativo debe atender incidentes y errores».

### Licencia

El README mantiene `[elegir licencia]`.

Opciones, sin selección:

- MIT: permite reutilización amplia con conservación del aviso y atribución.
- Apache-2.0: permite reutilización y contiene términos expresos sobre patentes.
- GPL-3.0: exige compartir derivados distribuidos bajo la misma licencia.

PENDIENTE DE DECISIÓN DEL ESTUDIANTE.

### Dilema real documentado

Se decidió retirar una contraseña visible del código y usar variables de entorno con contraseñas independientes.

Alternativa descartada: mantener una contraseña compartida simplificaba el seed, pero permitía autenticación cruzada entre roles.

Alternativa conservadora aplicada: cada cuenta usa su propia variable y el seed rechaza contraseñas repetidas.

Lo que aún falta: cifrado de datos almacenados, política de conservación, rotación formal y validación jurídica del aviso de privacidad.

## H. Limitaciones y pendientes

### Dependencias frontend

Una ejecución real de `npm --prefix frontend audit --json` reportó 16 vulnerabilidades moderadas, 0 altas y 0 críticas.

La corrección disponible indicada por npm requiere actualizar `@angular/cli` a 22.3.0, una actualización mayor. No se corrigió porque NO EXISTE autorización para cambiar dependencias ni actualizar Angular.

Evidencia: [revision_seguridad.md](../revision_seguridad.md).

### Pipeline

Existe [.github/workflows/ci.yml](../.github/workflows/ci.yml). Instala dependencias de backend y ejecuta `npm test` y `npm run lint`.

Estado: **pendiente de verificación en GitHub**.

Pasos:

1. Subir el commit a GitHub.
2. Abrir la pestaña Actions.
3. Abrir la ejecución correspondiente al commit.
4. Registrar enlace, estado, fecha y resultado real.

NO se puede afirmar que el pipeline está en verde con base únicamente en el archivo local.

### Documentos que NO EXISTEN

- Una entrevista o requisitos originales del módulo 2.
- Una matriz original de historias Must/Should.
- Un documento de diseño previo del módulo 3.
- Un ADR previo al creado en la Semana 10.
- Cobertura configurada y reportada.
- Guía de despliegue previa a la creada en la Semana 10.
- Plan operativo previo.
- Licencia seleccionada.
- Texto jurídico validado de privacidad.
- Política formal de responsabilidad.
- Evidencia de ejecución de GitHub Actions.

## I. Esquema de diapositivas

Máximo 8 diapositivas; el tiempo total sugerido es 10 minutos.

### Diapositiva 1 — Problema y usuario

- Tiempo sugerido: 1 minuto.
- Contenido: consultorio pequeño, problema de cruces y usuarios con tres roles.
- Evidencia: [README.md](../README.md), [docs/propuesta.md](propuesta.md).
- Mostrar: criterio HU-01 y ausencia documentada del proceso manual previo.

### Diapositiva 2 — Solución y arquitectura

- Tiempo sugerido: 1 minuto.
- Contenido: Angular, Express, SQLite, bcryptjs y autenticación en memoria.
- Evidencia: [docs/diseno.md](diseno.md), [backend/src/server.js](../backend/src/server.js).
- Mostrar: diagrama simple de frontend → API → SQLite.

### Diapositiva 3 — Uso de IA por fase

- Tiempo sugerido: 3 minutos.
- Contenido: requisitos, diseño, código, pruebas, operación y documentación/ética.
- Evidencia: [bitacora_ia.md](../bitacora_ia.md), entradas 1-10.
- Mostrar: una evidencia real por fase y explicar cómo se verificó.

### Diapositiva 4 — Caso estrella: contraseñas compartidas

- Tiempo sugerido: 3 minutos.
- Contenido: antes, riesgo, prueba y corrección.
- Evidencia: commit [bbdf24a](https://github.com/nicolesalazaral-ai/seminario/commit/bbdf24adfc3727a5e424a5a9626d9f5ad0ce5097).
- Mostrar: diff de [backend/src/seed.js](../backend/src/seed.js) y las dos pruebas de [backend/test/seed.security.test.js](../backend/test/seed.security.test.js).

### Diapositiva 5 — API limitada a localhost

- Tiempo sugerido: 1 minuto, dentro del bloque de casos si se amplía a 10 minutos.
- Evidencia: commit [f3b8bd6](https://github.com/nicolesalazaral-ai/seminario/commit/f3b8bd6d4f1459330de65adce488ea3788cb5684).
- Mostrar: diff de binding y salida o prueba de loopback.

### Diapositiva 6 — Decisión ética o legal

- Tiempo sugerido: 1 minuto.
- Contenido: datos personales, protección actual y dilema de contraseña visible.
- Evidencia: [docs/aviso_privacidad_borrador.md](aviso_privacidad_borrador.md), [.env.example](../.env.example).
- Mostrar: que el borrador no está validado jurídicamente.

### Diapositiva 7 — Aprendizajes

- Tiempo sugerido: 1 minuto.
- Contenido: confiar menos sin verificar, comprobar código y pruebas, documentar cada decisión.
- Evidencia: sección de reflexión de [bitacora_ia.md](../bitacora_ia.md).

### Diapositiva 8 — Estado final y próximos pasos

- Tiempo sugerido: 1 minuto.
- Contenido: 9 pruebas pasadas localmente, linter limpio, pendientes, CI por verificar.
- Evidencia: salida local de `npm test`, salida local de `npm run lint`, [.github/workflows/ci.yml](../.github/workflows/ci.yml).

El esquema excede la lista mínima solicitada en duración si se usan las ocho diapositivas; se puede combinar la diapositiva 5 con la 4 o omitirla para mantener exactamente 10 minutos.

## J. Datos personales encontrados

| Ubicación | Tipo de dato | Acción |
|---|---|---|
| [backend/src/seed.js](../backend/src/seed.js), líneas 76-77 aproximadas | Nombres sintéticos de pacientes y valores de teléfono sintéticos usados por la demostración | Mantener sintéticos y evitar incorporar datos reales. |
| [frontend/src/app/app.component.html](../frontend/src/app/app.component.html), alrededor de líneas 31-69 | Campos y etiquetas para nombre y celular de pacientes | Revisar capturas o datos reales ingresados durante demostraciones. |
| [bitacora_ia.md](../bitacora_ia.md), encabezado | Nombre de la autora | No se encontró evidencia de que deba eliminarse; revisar su autorización antes de publicar. |
| Historial de Git | Metadatos de autor que incluyen una dirección de correo | Indicar en entrega pública que se revise; no se copia el valor en este documento. |
| [backend/test/seed.security.test.js](../backend/test/seed.security.test.js), líneas 12-15 | Nombres y contraseñas sintéticas de prueba | Mantener únicamente como datos ficticios. |
| [frontend/dist/](../frontend/dist/) | Artefactos compilados derivados del frontend | Revisar si se subieron datos de demostración antes de publicar. |
| Capturas o adjuntos | NO EXISTE una carpeta identificada de capturas o imágenes personales | NO EXISTE evidencia en el árbol actual. |
| Cédulas reales | NO EXISTE una coincidencia verificada en los archivos rastreados revisados | NO EXISTE. |

## K. Lista de revisión antes de entregar

1. Revisar el historial y decidir si se conserva o elimina información personal de metadatos.
2. Confirmar que no haya archivos `.env` reales ni credenciales rastreadas.
3. Revisar `backend/data/` y confirmarlo como excluido por `.gitignore`.
4. Ejecutar `cd backend; npm test`.
5. Ejecutar `cd backend; npm run lint`.
6. Ejecutar `npm --prefix frontend audit --json` y registrar el estado actual.
7. Subir el código a GitHub.
8. Abrir Actions y revisar la ejecución real del workflow.
9. Registrar el enlace, estado y fecha de esa ejecución en el informe; no asumir verde.
10. Exportar el informe a PDF si hay una herramienta disponible.
11. Revisar nombres reales de pacientes en código, capturas y datos locales.
12. PENDIENTE: decidir licencia.
13. PENDIENTE: decidir responsabilidad por errores.
14. PENDIENTE: validar el texto final del aviso de privacidad.
15. PENDIENTE: decidir frecuencia de respaldo y responsable operativo.
16. Practicar la sustentación con las pruebas y comandos exactos de este documento.

