# Agenda del consultorio

Aplicación local para gestionar citas de un consultorio pequeño. El backend usa Express y SQLite; el frontend es Angular standalone. No necesita internet mientras se usa, aunque la primera instalación de paquetes sí requiere acceso al registro de npm.

## Requisitos

- Node.js y npm
- En Windows, herramientas de compilación de C++ pueden ser necesarias para instalar `better-sqlite3`.

## Instalación y ejecución

Abre dos terminales en la carpeta del proyecto.

### Backend

```powershell
cd backend
npm install
$env:SEED_PASSWORD = 'TU_CLAVE_LOCAL'
npm run seed
npm start
```

Reemplaza `TU_CLAVE_LOCAL` por una contraseña elegida para el entorno local. No guardes ese valor en archivos del proyecto ni lo publiques.

La API queda disponible en `http://localhost:3000`. La base de datos se crea en `backend/data/agenda.sqlite3`.

### Frontend

```powershell
cd frontend
npm install
npm start
```

Abre `http://localhost:4200`. Para acceder desde otro equipo de la red local, usa la IP del computador del consultorio y permite las conexiones en el firewall.

## Usuarios de prueba

Los usuarios de prueba reciben la contraseña definida en `SEED_PASSWORD` al ejecutar `npm run seed`.

| Usuario | Rol |
|---|---|
| marcela | recepcionista |
| laura | auxiliar |
| daniel | médico (Dr. Daniel) |
| patricia | médica (Dra. Patricia) |

`npm run seed` crea los médicos, sus horarios, los usuarios, cinco pacientes ficticios y citas de ejemplo. Puede ejecutarse otra vez sin duplicar estos datos.

## Reglas principales

- Las citas duran 20 minutos; las de primera vez duran 30.
- Dr. Daniel atiende de lunes a sábado; Dra. Patricia atiende martes, jueves y sábado.
- Ambos atienden de 08:00 a 12:00 y de 13:00 a 17:00.
- El personal de recepción puede crear pacientes, agendar, mover y cancelar. Cada médico solo consulta su agenda y puede marcar sus citas como atendidas o no llegó.
- El token de sesión se mantiene en memoria del backend y las contraseñas se guardan con bcryptjs.

## Endpoints

Todas las rutas excepto `POST /sesiones` requieren `Authorization: Bearer <token>`.

| Método | Ruta | Uso |
|---|---|---|
| POST | `/sesiones` | Iniciar sesión |
| POST | `/pacientes` | Crear paciente |
| GET | `/pacientes?nombre=...` | Consultar paciente y número de faltas |
| POST | `/citas` | Agendar cita |
| GET | `/medicos/:id/citas?fecha=AAAA-MM-DD` | Consultar la agenda de un médico |
| GET | `/citas?fecha=AAAA-MM-DD` | Consultar todas las citas del día (personal) |
| PATCH | `/citas/:id` | Mover cita; recibe `fecha_hora_inicio` |
| PUT | `/citas/:id/estado` | Cambiar estado a `pendiente`, `atendida`, `cancelada` o `no_llego` |

Las fechas y horas de citas se envían como `AAAA-MM-DDTHH:mm`. Las respuestas de error contienen un campo `mensaje`.

## Archivos

- `backend/src/db.js`: crea las tablas y abre SQLite.
- `backend/src/citasService.js`: validación y lógica de creación, disponibilidad y movimiento de citas.
- `backend/src/server.js`: rutas REST, autenticación en memoria y permisos.
- `backend/src/seed.js`: datos locales iniciales.
- `backend/package.json` y `backend/package-lock.json`: dependencias y comandos del servidor; el lockfile fija las versiones instaladas.
- `frontend/src/main.ts`: inicia la aplicación Angular standalone.
- `frontend/src/app/app.component.ts`: llamadas a la API, inicio de sesión y acciones de la pantalla.
- `frontend/src/app/app.component.html`: formularios y listas de citas.
- `frontend/src/app/app.component.css` y `frontend/src/styles.css`: estilos de la interfaz.
- `frontend/angular.json` y archivos `tsconfig*.json`: configuración de Angular y TypeScript.
- `frontend/package.json` y `frontend/package-lock.json`: dependencias y comando para ejecutar Angular; el lockfile fija las versiones instaladas.
- `.gitignore`: excluye dependencias instaladas, archivos de compilación y la base de datos local.

## Funcionalidad de la semana 5

### Historia HU-01

Como recepcionista, quiero que el sistema no me deje agendar a dos pacientes a la misma hora con el mismo médico, para evitar los cruces.

**Criterio de aceptación:** dado que el Dr. Daniel ya tiene a «Paciente 1» el lunes 2 de noviembre a las 10:00, cuando intento agendar a «Paciente 2» con él a esa hora, entonces la cita no se guarda y el sistema avisa «Esa hora ya está ocupada».

### Contrato de disponibilidad

La función existente tiene la firma `validarDisponibilidad(medicoId, fechaHora, duracion, citaId = null)` en `backend/src/citasService.js`.

- `medicoId: number`: identificador del médico cuya agenda se consulta.
- `fechaHora: string`: fecha y hora de inicio en formato `AAAA-MM-DDTHH:mm`.
- `duracion: number`: duración solicitada en minutos; las citas habituales duran 20 minutos y las de primera vez 30.
- `citaId: number | null`: identificador opcional de la cita que se excluye al moverla.
- Devuelve `undefined` cuando no hay cruce; ante un cruce lanza `ErrorDeSolicitud` con estado 409. Para 20 minutos el mensaje es «Esa hora ya está ocupada»; para una solicitud de 30 minutos es «No hay 30 minutos libres a esa hora».
- Solo cuentan las citas del mismo médico cuyo estado no sea `cancelada`. No hay cruce si una cita termina justo cuando empieza la otra. Una lista vacía no presenta cruces y la función no modifica las citas recibidas.

Ejemplos de entrada y salida:

| Citas existentes y solicitud | Salida |
|---|---|
| Médico 1 ocupado el `2026-11-02 10:00` por 20 minutos; solicitar médico 1 a `2026-11-02T10:00` por 20 minutos | Lanza error 409: «Esa hora ya está ocupada» |
| La misma cita de médico 1; solicitar médico 2 a `2026-11-02T10:00` por 20 minutos | `undefined` |
| La cita de médico 1 termina a las 10:20; solicitar médico 1 a `2026-11-02T10:20` por 20 minutos | `undefined` |
| La cita de médico 1 está cancelada; solicitar médico 1 a `2026-11-02T10:00` por 20 minutos | `undefined` |
| Médico 1 ocupado desde `2026-11-02 09:20` por 20 minutos; solicitar a `2026-11-02T09:00` por 30 minutos | Lanza error 409: «No hay 30 minutos libres a esa hora» |
| Sin citas existentes; solicitar médico 1 a `2026-11-02T10:00` por 20 minutos | `undefined` |

Las pruebas sustituyen el módulo de base de datos por una lista en memoria; no abren ni modifican la base SQLite del consultorio.

### Ejecutar las pruebas

```powershell
cd backend
npm test
```
