# Agenda del consultorio

## Qué es

Aplicación local para gestionar citas de un consultorio pequeño. El backend usa Node.js, Express y SQLite con `better-sqlite3`; el frontend está hecho con Angular. El backend y el servidor de desarrollo del frontend escuchan solo en `127.0.0.1`; no se puede acceder a la aplicación desde otros equipos de la red.

## Requisitos

- Node.js y npm.
- En Windows, herramientas de compilación de C++ pueden ser necesarias para instalar `better-sqlite3`.

## Instalación

Instala las dependencias en cada proyecto:

```powershell
cd backend
npm install
```

En otra terminal, desde la raíz del repositorio:

```powershell
cd frontend
npm install
```

## Ejecución

En una terminal, configura cuatro contraseñas diferentes para las cuentas de prueba y carga los datos:

```powershell
cd backend
$env:SEED_PASSWORD_MARCELA = Read-Host "Contraseña de Marcela"
$env:SEED_PASSWORD_LAURA = Read-Host "Contraseña de Laura"
$env:SEED_PASSWORD_DANIEL = Read-Host "Contraseña de Daniel"
$env:SEED_PASSWORD_PATRICIA = Read-Host "Contraseña de Patricia"
npm run seed
npm start
```

El seed rechaza contraseñas repetidas y contraseñas de más de 72 bytes. Las contraseñas se guardan con bcrypt. La base de datos se crea en `backend/data/agenda.sqlite3`; `DB_PATH` puede configurarse para indicar otra ruta local. `PORT` permite cambiar el puerto del backend, cuyo valor predeterminado es 3000.

En otra terminal, ejecuta el frontend:

```powershell
cd frontend
npm start
```

Abre `http://localhost:4200`. La API local está en `http://localhost:3000`. Las cuentas son `marcela` (recepcionista), `laura` (auxiliar), `daniel` (Dr. Daniel) y `patricia` (Dra. Patricia); cada cuenta usa la contraseña distinta configurada para ella. No se requiere ni se permite acceso desde otros equipos de la red.

## Pruebas

Desde `backend/`:

```powershell
npm test
npm run lint
```

Las pruebas de HU-01 sustituyen SQLite por datos en memoria. Las pruebas de seguridad usan bases SQLite temporales para comprobar la separación de credenciales de seed y que el servidor HTTP se limite a loopback; no alteran la base de datos del consultorio.

### Funcionalidad de la semana 5

#### Historia HU-01

Como recepcionista, quiero que el sistema no me deje agendar a dos pacientes a la misma hora con el mismo médico, para evitar los cruces.

**Criterio de aceptación:** dado que el Dr. Daniel ya tiene a «Paciente 1» el lunes 2 de noviembre a las 10:00, cuando intento agendar a «Paciente 2» con él a esa hora, entonces la cita no se guarda y el sistema avisa «Esa hora ya está ocupada».

#### Contrato de disponibilidad

La función `validarDisponibilidad(medicoId, fechaHora, duracion, citaId = null)` está en `backend/src/citasService.js`.

- `medicoId`: identificador del médico.
- `fechaHora`: fecha y hora de inicio en formato `AAAA-MM-DDTHH:mm`.
- `duracion`: duración solicitada en minutos (20 o 30).
- `citaId`: identificador opcional de la cita que se excluye al moverla.
- Devuelve `undefined` cuando no hay cruce; ante un cruce lanza `ErrorDeSolicitud` con estado 409. Para 20 minutos el mensaje es «Esa hora ya está ocupada»; para una solicitud de 30 minutos es «No hay 30 minutos libres a esa hora».
- Solo cuentan las citas del mismo médico cuyo estado no sea `cancelada`. No hay cruce si una cita termina justo cuando empieza la otra. Una lista vacía no presenta cruces y la función no modifica las citas existentes.

## Estructura

- `backend/src/db.js`: crea las tablas y abre SQLite.
- `backend/src/citasService.js`: validación y lógica de creación, disponibilidad y movimiento de citas.
- `backend/src/server.js`: rutas REST, autenticación en memoria y permisos; escucha en loopback.
- `backend/src/seed.js`: crea médicos, horarios, usuarios y datos de ejemplo.
- `backend/test/`: pruebas de disponibilidad y de seguridad.
- `backend/package.json` y `backend/package-lock.json`: scripts y dependencias del servidor.
- `frontend/src/main.ts`: inicia Angular.
- `frontend/src/app/app.component.ts`: interfaz y llamadas a la API local.
- `frontend/package.json` y `frontend/package-lock.json`: scripts y dependencias de Angular.
- `.env.example`: nombres de variables de entorno opcionales, sin valores.
- `.gitignore`: excluye `.env`, dependencias instaladas, artefactos de compilación y la base SQLite local.

## Uso de IA

Se usó GitHub Copilot para apoyar implementación, pruebas y revisión de seguridad. Las propuestas se contrastaron con el código, las pruebas y los comandos del proyecto. La bitácora registra prompts, decisiones y verificaciones.

## Autor y licencia

Autora: Nicole Salazar
Licencia: [elegir licencia]

## Documentación de la Semana 10

Los documentos verificables preparados para el informe final están en [docs/](docs/):

- [Estado verificado](docs/estado_verificado.md)
- [Propuesta](docs/propuesta.md)
- [Requisitos](docs/requisitos.md)
- [Diseño](docs/diseno.md)
- [ADR-001](docs/adr/ADR-001.md)
- [Plan de pruebas](docs/plan_pruebas.md)
- [Guía de despliegue](docs/guia_despliegue.md)
- [Plan de operación](docs/plan_operacion.md)
- [Borrador de aviso de privacidad](docs/aviso_privacidad_borrador.md)
- [Informe final](docs/informe_final.md)

El pipeline se define en [.github/workflows/ci.yml](.github/workflows/ci.yml). Su última ejecución no puede afirmarse hasta subir el repositorio y revisar GitHub Actions.
