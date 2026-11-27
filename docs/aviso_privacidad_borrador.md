# Aviso de privacidad — BORRADOR

Fecha de creación: 2026-11-27

**Estado:** BORRADOR SIN VALIDACIÓN JURÍDICA.

Este borrador pretende apoyar una revisión posterior. NO sustituye asesoría legal ni un análisis formal del responsable del tratamiento.

## Datos tratados

El sistema maneja nombres de usuarios, nombres de pacientes, celulares, citas, horarios, estados y roles. Si se incorporan diagnósticos, resultados clínicos o datos de salud, pueden ser datos sensibles según el artículo 5 de la Ley 1581 de 2012.

## Finalidades propuestas

- Gestionar citas.
- Consultar agendas según el rol.
- Registrar cambios de estado.

## Medidas descritas

- Contraseñas protegidas con bcryptjs.
- Variables de entorno para claves de seed.
- Consultas SQLite con parámetros enlazados.
- Acceso de aplicación limitado a loopback.
- NO EXISTE cifrado de la base de datos ni cifrado a nivel de campos.
- NO EXISTE política documentada de conservación o eliminación.

## Derechos y responsable

PENDIENTE DE DECISIÓN DEL ESTUDIANTE:

- Responsable del tratamiento.
- Contacto para consultas y ejercicio de derechos.
- Periodo de conservación.
- Autorización y procedimiento de tratamiento.
- Información para pacientes y trabajadores.
