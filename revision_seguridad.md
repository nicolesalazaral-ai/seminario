# Informe de revisión de código y seguridad

Proyecto: Agenda de citas para un consultorio médico  
Estudiante: Nicole Salazar  
Fecha: 2026-11-27  
Commit revisado: 98f1e7207f6644eaa77ab91bd5fb2e584202d043

## 1. Herramientas y criterios

- **Linter:** ESLint 10.15.0 con `@eslint/js` 10.0.1 y `eslint-plugin-security` 4.2.1. Configuración en `backend/eslint.config.js`; reglas recomendadas de JavaScript y reglas recomendadas de seguridad.
- **Auditoría de dependencias:** `npm audit` sobre los lockfiles existentes. Backend: 0 vulnerabilidades. Frontend: 16 vulnerabilidades moderadas, 0 altas y 0 críticas.
- **Lista de revisión:** criterios de la semana 6: inyección, secretos, contraseñas, control de acceso, dependencias, corrección, valores mágicos, funciones largas y duplicación.
- **Revisión con IA:** GitHub Copilot realizó una revisión de solo lectura y reportó hallazgos después de comprobar el código y los comandos disponibles.

### Puntos de seguridad revisados

| Punto | ¿Aplica? | Resultado |
|---|---|---|
| Inyección (consultas con parámetros) | Sí | Sin hallazgos confirmados. Las consultas usan parámetros enlazados o fragmentos fijados por el código. |
| Secretos (código, historial, `.gitignore`, `.env.example`) | Sí | No se encontró una clave real rastreada ni en el historial revisado. `.env` está ignorado y existe `.env.example` sin valores. |
| Contraseñas (bcrypt, scrypt o argon2 con sal) | Sí | bcryptjs con costo 10 genera y verifica hash con sal. El seed corrigido exige contraseñas distintas por usuario. |
| Control de acceso (rol verificado y prueba de abuso) | Sí | Las rutas restringidas verifican token y rol. Las pruebas de seed verifican autenticación separada; no se encontraron bypasses en las cinco rutas nombradas. |
| Dependencias (necesarias, versión fijada y auditoría) | Sí | Backend sin vulnerabilidades. Frontend tiene 16 hallazgos moderados en el árbol de herramientas de desarrollo; no se modificaron dependencias sin autorización. |

## 2. Tabla de hallazgos

| Id | Archivo y línea | Problema | Categoría (OWASP o tipo) | Severidad | Corrección | Commit |
|---|---|---|---|---|---|---|
| H-01 | `backend/src/seed.js:4-32` y `backend/src/seed.js:70-71` | Las cuatro cuentas compartían la misma contraseña; una clave conocida podía autenticarse como una cuenta de otro rol. | OWASP A01 Broken Access Control | Alta | Cada cuenta usa su propia variable de entorno y el seed rechaza contraseñas repetidas. Se agregaron pruebas para contraseñas distintas y repetidas. | bbdf24adfc3727a5e424a5a9626d9f5ad0ce5097 |
| H-02 | `backend/src/server.js:9` y `backend/src/server.js:230-243`; antes se encontraba `backend/src/server.js:173` | La API escuchaba en todas las interfaces y permitía acceso HTTP desde la red local. | OWASP A07 Authentication Failures | Alta | El backend quedó limitado a `127.0.0.1` y el servidor de Angular a `127.0.0.1`. Se agregó una prueba de binding loopback. | f3b8bd6d4f1459330de65adce488ea3788cb5684 |
| P-01 | `.env.example` ausente antes de la corrección documental | Faltaba la plantilla con nombres de variables de entorno sin valores reales. | Configuración | Baja | Se creó `.env.example` con `PORT`, `DB_PATH` y las cuatro contraseñas de seed. | 9dac0f9f1f4c77689411ad1624bf224e0e635ab2 |

**Severidad:** alta (permite acceder o cambiar datos sin permiso, o expone secretos), media (error probable o riesgo con condiciones), baja (estilo o mantenibilidad).

### Avisos del linter no corregidos

| Regla | Archivo y línea | Por qué se mantiene |
|---|---|---|
| Ninguna | No aplica | `npm run lint` terminó sin errores ni avisos en la última ejecución. |

## 3. Revisión con IA

**Prompt usado:** Revisión de solo lectura de todo `backend/` y del frontend que llama a la API. Se pidió comprobar SQL parametrizado, secretos e historial, `.env`, hashes bcrypt, las rutas nombradas de control de acceso, auditoría de dependencias y calidad. Después se pidió cerrar brechas en la evidencia por archivo y línea.

| Hallazgo de la IA | ¿Real o falso positivo? | Cómo lo verifiqué |
|---|---|---|
| H-01: las cuatro cuentas usaban la misma contraseña | Real | Leí `backend/src/seed.js:4-32,70-71`, el login con username y contraseña en `backend/src/server.js:71-86`, y ejecuté las pruebas temporales de `backend/test/seed.security.test.js:18-68`. |
| H-02: HTTP en `0.0.0.0` exponía tráfico LAN | Real | Comprobé el antiguo binding en `backend/src/server.js:173` y el uso HTTP del frontend en `frontend/src/app/app.component.ts:40`. Lo corregí a loopback y lo comprobé con `backend/test/network.security.test.js:14-37`. |
| `.env.example` ausente | Real como omisión, baja severidad | Comprobé el historial de archivos rastreados y creé la plantilla solicitada con variables vacías. |

**Lo que la IA no encontró:** Documenté y verificé como omisión propia la ausencia del archivo `.env.example`, que no es una vulnerabilidad de ejecución pero sí una brecha de la plantilla y de la configuración reproducible.

## 4. Pendientes

| Pendiente | Por qué no se corrigió todavía | Plan |
|---|---|---|
| Actualizar las 16 dependencias moderadas del frontend | No fue autorizado corregirlas; además `npm audit` indica una actualización mayor de Angular como solución de parte del árbol. | Evaluar primero compatibilidad con Angular 20 y revisar el fix disponible antes de subir la versión mayor. |
| Rama `revision-semana-6` | La rama no existía al iniciar la revisión; la instrucción posterior fue continuar en `main`. | No reescribir ramas ni cambiar historial; conservar el commit revisado indicado arriba. |

**Claves expuestas:** Ninguna. No se encontró una clave real en el código, archivos rastreados o historial revisado. Las contraseñas de seed se leen mediante variables de entorno.
