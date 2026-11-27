# Plan de pruebas

Fecha de creación: 2026-11-27

## Ejecución

```powershell
cd backend
npm test
npm run lint
```

## Pruebas reales

### `backend/test/citas.test.js` - 6 pruebas

1. `rechaza la misma hora del mismo médico con el mensaje de HU-01`: espera estado 409 y el mensaje de ocupación.
2. `permite la misma hora cuando corresponde a otro médico`: otro `medico_id` no genera cruce.
3. `permite una cita que empieza justo cuando termina la anterior`: verifica límites de intervalo.
4. `ignora las citas canceladas al comprobar el mismo horario`: una cita cancelada no ocupa disponibilidad.
5. `detecta el cruce cuando una cita de 30 minutos se solapa con una existente`: espera estado 409 y mensaje de 30 minutos.
6. `permite la hora solicitada cuando la lista de citas está vacía`: una agenda vacía permite la solicitud.

### `backend/test/seed.security.test.js` - 2 pruebas

1. `el seed exige contraseñas distintas y evita autenticación cruzada entre roles`.
2. `el seed rechaza la misma contraseña para cuentas con roles distintos`.

### `backend/test/network.security.test.js` - 1 prueba

1. `el servidor HTTP solo escucha en loopback`: verifica que la dirección sea `127.0.0.1`.

## Cobertura

NO EXISTE una configuración o reporte de cobertura. El proyecto no tiene pipeline ni herramienta de cobertura reportada.
