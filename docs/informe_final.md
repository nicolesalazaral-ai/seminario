# Informe final del proyecto integrador

Proyecto: Agenda del consultorio
Estudiante: Nicole Salazar
Repositorio: https://github.com/nicolesalazaral-ai/seminario
Fecha: 2026-11-27

Fecha de elaboración: 2026-11-27. Este documento fue preparado en la Semana 10 con base en una plantilla encontrada fuera del repositorio y en evidencia verificable. No fue entregable original de módulos anteriores.

## 1. Resumen

Desarrollé una aplicación local para gestionar citas de un consultorio pequeño. El sistema permite iniciar sesión, consultar agendas, crear pacientes, agendar, mover y cancelar citas según el rol del usuario. Utilicé Angular para el frontend, Node.js y Express para la API, SQLite mediante `better-sqlite3` para persistencia y bcryptjs para contraseñas.

Usé GitHub Copilot y Claude para apoyar fundamentos, requisitos, código, pruebas, operación y documentación. Verifiqué las propuestas mediante lectura del código, pruebas con `node:test`, ESLint y revisiones documentadas. El resultado final comprobado localmente fue de 9 pruebas pasadas y ausencia de errores o avisos en ESLint.

No puedo afirmar que GitHub Actions esté en verde: el pipeline está preparado, pero su ejecución real depende de subir el código y revisar la plataforma.

## 2. Problema y usuario

El problema es evitar cruces al agendar citas y separar las operaciones disponibles para personal de recepción, auxiliares y médicos. Mi solución central valida que el intervalo solicitado no se solape con otras citas del mismo médico. También controla la agenda propia de cada médico y limita las cancelaciones y cambios generales al personal.

El usuario objetivo es el personal de un consultorio pequeño. NO EXISTE en el repositorio una entrevista ni una descripción verificable del proceso manual previo, por lo que no puedo afirmar cómo resolvían el problema antes. La propuesta creada esta semana está en [docs/propuesta.md](propuesta.md). Las requerimientos derivados del código están en [docs/requisitos.md](requisitos.md).

La historia original con criterio verificable es HU-01: como recepcionista, quiero impedir que dos pacientes tengan una cita a la misma hora con el mismo médico. El contrato está en [README](../README.md#funcionalidad-de-la-semana-5).

## 3. La IA en el ciclo de vida

| Módulo y fase | Qué hice con IA | Herramienta | Evidencia enlazada | Cómo lo verificamos o verificó |
|---|---|---|---|---|
| Fundamentos | Pedí y recibí apoyo para definir el proyecto como una aplicación Angular/Express/SQLite y para generar la estructura inicial. | GitHub Copilot | [Entrada 1 de la bitácora](../bitacora_ia.md#entrada-1), 2026-11-07 | Verifiqué manualmente que iniciaba sesión como `marcela` y podía agendar una cita. El commit base es [98f1e72](https://github.com/nicolesalazaral-ai/seminario/commit/98f1e7207f6644eaa77ab91bd5fb2e584202d043). |
| Requisitos | Copilot implementó `validarDisponibilidad` y Claude ayudó a redactar el contrato; después corregí el borrador para reflejar que la función devuelve `undefined` o lanza un error 409. | GitHub Copilot y Claude | [Entradas 2-4](../bitacora_ia.md) | Comparé las pruebas y el código real en [citasService](../backend/src/citasService.js). No atribuyo al asistente el borrador de `hayCruce` porque la bitácora no lo atribuye explícitamente. |
| Diseño | Pedí que se describiera una arquitectura local con Angular, Express y SQLite. | GitHub Copilot | [Diseño creado en Semana 10](diseno.md), [ADR-001](adr/ADR-001.md), [Entrada 1](../bitacora_ia.md#entrada-1) | Contraste con el código real; el commit base es [98f1e72](https://github.com/nicolesalazaral-ai/seminario/commit/98f1e7207f6644eaa77ab91bd5fb2e584202d043). |
| Código | La IA propuso el seed, las rutas y las correcciones documentadas. Rechacé propuestas inseguras y confirmé cambios mediante revisiones y pruebas. | GitHub Copilot | [Entrada 5](../bitacora_ia.md#entrada-5), [Entrada 8](../bitacora_ia.md#entrada-8), [revisión de seguridad](../revision_seguridad.md) | Verifiqué `git show` en [bbdf24a](https://github.com/nicolesalazaral-ai/seminario/commit/bbdf24adfc3727a5e424a5a9626d9f5ad0ce5097) y [f3b8bd6](https://github.com/nicolesalazaral-ai/seminario/commit/f3b8bd6d4f1459330de65adce488ea3788cb5684). |
| Pruebas | Copilot propuso pruebas con `node:test` y SQLite simulado en memoria para HU-01. | GitHub Copilot | [Entrada 3](../bitacora_ia.md#entrada-3), [citas.test.js](../backend/test/citas.test.js) | Ejecuté `npm test` y comprobé los 9 casos actuales. |
| Operación | Pedí configuración de ESLint, correcciones de seguridad, documentación y preparación del pipeline. | GitHub Copilot | [Entradas 7-9](../bitacora_ia.md), [estado verificado](estado_verificado.md), [workflow](../../.github/workflows/ci.yml) | Ejecuté `npm test` y `npm run lint`; la ejecución de GitHub pendiente requiere subir el código y revisarla. |
| Documentación y ética | Preparé documentos derivados del código y un borrador de privacidad marcado sin validación jurídica. | GitHub Copilot | [Informe](informe_final.md), [borrador de privacidad](aviso_privacidad_borrador.md), [bitácora](../bitacora_ia.md) | La revisión final es humana y estas decisiones quedan marcadas como pendientes si requieren criterio del estudiante. |

## 4. Verificación: lo que la IA hizo mal y cómo lo encontré

### Caso 1: contraseña compartida por todas las cuentas

- **Fase:** Código y seguridad.
- **Qué propuso la IA:** El código inicial calculaba un único hash de `SEED_PASSWORD` y lo asignaba a `marcela`, `laura`, `daniel` y `patricia`.
- **Qué estaba mal:** Una persona que conociera una de las contraseñas podía iniciar sesión como otra cuenta y obtener su rol.
- **Cómo lo detecté:** Revisé [backend/src/seed.js](../backend/src/seed.js) y el inicio de sesión de [backend/src/server.js](../backend/src/server.js). Después confirmé el comportamiento con una prueba temporal de base SQLite.
- **Corrección verificada:** Cambié el seed a variables independientes y rechacé contraseñas repetidas. Git `show` verificó el commit [bbdf24a](https://github.com/nicolesalazaral-ai/seminario/commit/bbdf24adfc3727a5e424a5a9626d9f5ad0ce5097). La corrección incluye [seed.security.test.js](../backend/test/seed.security.test.js).
- **Pruebas:** `el seed exige contraseñas distintas y evita autenticación cruzada entre roles` y `el seed rechaza la misma contraseña para cuentas con roles distintos`.

### Caso 2: API expuesta fuera de localhost

- **Fase:** Operación y seguridad.
- **Qué propuso la IA:** El backend y el servidor Angular estaban configurados para escuchar fuera de localhost mediante `0.0.0.0`.
- **Qué estaba mal:** Permitía alcanzar la API por la red local y aumentaba la exposición de credenciales y datos.
- **Cómo lo detecté:** Revisé el binding de [backend/src/server.js](../backend/src/server.js) y el host de [frontend/package.json](../frontend/package.json).
- **Corrección verificada:** Cambié ambos puntos a `127.0.0.1` y agregué una prueba que exige loopback. Git `show` verificó el commit [f3b8bd6](https://github.com/nicolesalazaral-ai/seminario/commit/f3b8bd6d4f1459330de65adce488ea3788cb5684).
- **Prueba:** `el servidor HTTP solo escucha en loopback`, en [network.security.test.js](../backend/test/network.security.test.js).

### Caso 3: contraseña visible en el código

- **Fase:** Código y secretos.
- **Qué propuso la IA:** El código inicial podía mostrar una contraseña compartida en `seed.js`, `README.md` y `app.component.html`.
- **Qué estaba mal:** La clave quedaba visible en archivos rastreados y podía publicarse.
- **Cómo lo detecté:** Fue una revisión manual de archivos documentada en [Entrada 5](../bitacora_ia.md#entrada-5) y verificada contra el commit base [98f1e72](https://github.com/nicolesalazaral-ai/seminario/commit/98f1e7207f6644eaa77ab91bd5fb2e584202d043).
- **Corrección:** Usé variables de entorno, agregué `.env` a `.gitignore` y separé las variables por usuario en [bbdf24a](https://github.com/nicolesalazaral-ai/seminario/commit/bbdf24adfc3727a5e424a5a9626d9f5ad0ce5097).
- **Evidencia:** [.gitignore](../.gitignore), [.env.example](../.env.example) y [seed.js](../backend/src/seed.js).

No incluyo el contrato booleano de `hayCruce` como caso principal porque la bitácora no demuestra que fue una propuesta de IA y el hash no identifica una corrección separada. Tampoco uso `.env.example` como propuesta fallida: fue una omisión documentada en la revisión.

## 5. Estado final del sistema

- **Arquitectura:** Angular standalone consume una API Express desde [frontend/src/app/app.component.ts](../frontend/src/app/app.component.ts). Express usa rutas REST y SQLite mediante `better-sqlite3`, mientras bcryptjs protege contraseñas y un `Map` mantiene tokens en memoria. Detalle en [docs/diseno.md](diseno.md).
- **ADR:** [ADR-001](adr/ADR-001.md) documenta SQLite como decisión previa, creada en la Semana 10.
- **Funcionalidades:** Verifico terminada HU-01. NO EXISTE una matriz Must/Should original; por eso no puedo declarar el estado histórico de otras historias.
- **Pruebas:** Ejecución local real: 9 pruebas pasadas y 0 fallidas. Las 6 pruebas originales están en [citas.test.js](../backend/test/citas.test.js), las 2 pruebas de seed están en [seed.security.test.js](../backend/test/seed.security.test.js) y 1 prueba de loopback está en [network.security.test.js](../backend/test/network.security.test.js).
- **Cobertura:** NO EXISTE un reporte de cobertura.
- **Pipeline:** `.github/workflows/ci.yml` ejecuta instalación, `npm test` y `npm run lint` en backend. Pendiente de verificación en GitHub después de subir el código.
- **Pendientes:** Permanecen 16 vulnerabilidades moderadas en el frontend, detectadas por `npm audit`. No las corregí porque requieren una actualización mayor de Angular y no fui autorizado a cambiar dependencias.

## 6. Reflexión ética y legal

| Principio | Decisión en mi proyecto | Evidencia |
|---|---|---|
| Datos personales | Manejo nombres de pacientes, celulares, citas y roles. Los registros iniciales son sintéticos. Si incorporo diagnósticos o datos de salud, debo aplicar el régimen de datos sensibles del artículo 5 de la Ley 1581 de 2012. | [seed.js](../backend/src/seed.js), [borrador de privacidad](aviso_privacidad_borrador.md) |
| Protección | Uso bcryptjs, parámetros SQL enlazados, variables de entorno y binding a loopback. NO EXISTEN cifrado de la base completa ni cifrado a nivel de campos. | [server](../backend/src/server.js), [db](../backend/src/db.js), [.gitignore](../.gitignore) |
| Sesgo | El sistema usa horarios fijos y reglas manuales de asignación, no modelos predictivos. Aun así, los horarios pueden excluir o afectar a personas según disponibilidad. | [citasService](../backend/src/citasService.js), [seed](../backend/src/seed.js) |
| Transparencia | Existe información en README y bitácora sobre el uso de Copilot, pero NO EXISTE aviso visible dentro de la interfaz. Propongo: «Esta interfaz se desarrolló con apoyo de herramientas de inteligencia artificial; las decisiones del sistema deben ser revisadas por personal autorizado». La propuesta requiere aprobación de interfaz. | [README](../README.md), [Entrada 8](../bitacora_ia.md#entrada-8) |
| Responsabilidad | NO EXISTE una asignación formal de responsabilidad por errores. PENDIENTE DE DECISIÓN DEL ESTUDIANTE el texto exacto. Propongo: «La institución usuaria conserva responsabilidad por verificar datos, autorizaciones y decisiones clínicas o administrativas tomadas con el sistema». | NO EXISTE evidencia formal anterior |
| Propiedad intelectual | El proyecto declara licencia pendiente. Propongo estudiar MIT, Apache-2.0 y GPL-3.0, sin elegir. MIT permite reutilización amplia con atribución; Apache-2.0 añade una licencia expresa de patentes; GPL-3.0 exige que derivados distribuidos permanezcan bajo GPL. PENDIENTE DE DECISIÓN DEL ESTUDIANTE. | [README](../README.md), [package-lock backend](../backend/package-lock.json), [package-lock frontend](../frontend/package-lock.json) |

El dilema ético real fue retirar una contraseña visible del código y reemplazarla por variables de entorno. La alternativa de mantener una clave compartida aceleraba el uso de prueba, pero permitía impersonación cruzada. La alternativa conservadora fue exigir contraseñas independientes y mantenerlas fuera del repositorio. Todavía faltan cifrado de SQLite, cifrado de campos, política de conservación, autorización jurídica y validación del borrador de privacidad.

## 7. Aprendizajes

Aprendí a comprobar una propuesta de IA contra código, pruebas y `git show`, en lugar de aceptar un hallazgo por apariencia. También aprendí que una prueba de disponibilidad debe describir límites exactos y errores verificables.

Confío con menos facilidad en respuestas completas de asistentes: una contraseña compartida, un binding público y un contrato mal alineado podían parecer plausibles sin revisión. Me queda como aprendizaje documentar el archivo, el commit, la prueba y el resultado antes de presentar una corrección.

Para una siguiente entrega escribiría primero el contrato y las pruebas, separaría credenciales desde el diseño y no afirmaría estado de CI sin ver una ejecución. Mantendré las decisiones pendientes visibles y pediré validación humana para licencia, responsabilidad y privacidad.

## 8. Anexos

- [Bitácora de uso de IA](../bitacora_ia.md)
- [Revisión de seguridad](../revision_seguridad.md)
- [Estado verificado](estado_verificado.md)
- [Propuesta](propuesta.md)
- [Requisitos](requisitos.md)
- [Diseño](diseno.md)
- [ADR-001](adr/ADR-001.md)
- [Plan de pruebas](plan_pruebas.md)
- [Guía de despliegue](guia_despliegue.md)
- [Plan de operación](plan_operacion.md)
- [Aviso de privacidad, borrador](aviso_privacidad_borrador.md)
