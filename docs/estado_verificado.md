# Estado verificado

Fecha de creación: 2026-11-27

Este documento registra comprobaciones ejecutadas en la sesión de preparación de la Semana 10. Los comandos se ejecutaron localmente en el repositorio y no incluyen una afirmación de GitHub Actions.

## Rama e historial

Comando ejecutado:

```powershell
git branch --show-current
git branch --list
git log --oneline
```

Salida real:

```text
main
* main
a455f10 Completa referencias finales de revision documental
00a46ed Agrega informe y bitacora de revision de seguridad
7fb9251 Limpia el formato del README
9dac0f9 Documenta uso local y contratos de la API
f3b8bd6 Limita la aplicación a conexiones locales
bbdf24a Asigna contraseñas únicas a usuarios seed
7ab373e Configura ESLint de seguridad en backend
98f1e72 Implementa agenda médica y pruebas HU-01
```

## Pruebas backend

Comando ejecutado:

```powershell
cd backend
npm test
```

Salida real verificada:

```text
9 pruebas listadas y pasadas:
- rechaza la misma hora del mismo médico con el mensaje de HU-01
- permite la misma hora cuando corresponde a otro médico
- permite una cita que empieza justo cuando termina la anterior
- ignora las citas canceladas al comprobar el mismo horario
- detecta el cruce cuando una cita de 30 minutos se solapa con una existente
- permite la hora solicitada cuando la lista de citas está vacía
- el servidor HTTP solo escucha en loopback
- el seed exige contraseñas distintas y evita autenticación cruzada entre roles
- el seed rechaza la misma contraseña para cuentas con roles distintos

Resultado: 9 pasadas, 0 fallidas.
```

## Linter backend

Comando ejecutado:

```powershell
cd backend
npm run lint
```

Salida real verificada: sin errores ni avisos.

## Auditoría frontend

Comando ejecutado:

```powershell
npm --prefix frontend audit --json
```

Resultado real: 16 vulnerabilidades moderadas, 0 altas y 0 críticas. `@angular/cli` propone una actualización mayor a Angular 22.3.0 como corrección disponible.

## Inventario documental

| Documento exigido | Estado |
|---|---|
| Propuesta del módulo 1 | NO EXISTE como documento identificable; se crea `docs/propuesta.md` en esta sesión. |
| Entrevista/requisitos del módulo 2 | NO EXISTE como documento identificable; se crea `docs/requisitos.md` en esta sesión. |
| Diseño | NO EXISTE como documento anterior; se crea `docs/diseno.md`. |
| ADR | NO EXISTE como archivo anterior; se crea `docs/adr/ADR-001.md`. |
| Revisión de código | Existe `revision_seguridad.md` en la raíz y se mantiene; la Semana 10 documenta su enlace desde `docs/informe_final.md`. |
| Plan de pruebas | NO EXISTE como documento anterior; se crea `docs/plan_pruebas.md`. |
| Guía de despliegue | NO EXISTE como documento anterior; se crea `docs/guia_despliegue.md`. |
| Plan de operación | NO EXISTE como documento anterior; se crea `docs/plan_operacion.md`. |
| README | Existe y se amplía con enlaces a `docs/`. |

## Datos personales reales encontrados

El historial contiene una dirección de correo asociada al autor en metadatos de Git. No se copia aquí y debe ser corregida o retirada por la estudiante antes de una entrega pública si corresponde. Los registros de pacientes que están en el código son datos sintéticos marcados por el propio proyecto como pacientes de prueba.
