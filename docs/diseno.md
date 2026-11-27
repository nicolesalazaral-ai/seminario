# Diseño del sistema

Fecha de creación: 2026-11-27
Documento creado en la Semana 10 para describir la arquitectura real.

## Componentes

- **Frontend:** Angular standalone. Carga datos mediante `HttpClient` y guarda el token y el usuario en memoria del componente.
- **Backend:** Node.js con Express. Expone sesiones, pacientes y citas.
- **Persistencia:** SQLite mediante `better-sqlite3`.
- **Credenciales:** bcryptjs genera y compara hashes.
- **Sesiones:** un `Map` local mantiene tokens aleatorios de 32 bytes.
- **Seguridad actual:** parámetros SQL enlazados, controles de rol y binding a `127.0.0.1`.

Evidencia: [README](../README.md), [server](../backend/src/server.js), [citasService](../backend/src/citasService.js), [db](../backend/src/db.js).

## Flujo principal

1. El usuario inicia sesión en `/sesiones`.
2. El backend verifica el usuario y el hash bcrypt.
3. El backend devuelve un token y datos de usuario.
4. El frontend usa el token en solicitudes posteriores.
5. Las rutas verifican autenticación y, cuando corresponde, el rol.
6. `citasService` valida datos, horarios y solapamientos antes de escribir una cita.

## Limitaciones

- NO EXISTE una base de datos cifrada.
- NO EXISTE cifrado a nivel de campos.
- Los tokens no tienen persistencia ni caducidad implementada en el código revisado.
- El sistema está limitado a localhost.
