# Guía de despliegue local

Fecha de creación: 2026-11-27

Esta guía describe la ejecución local. NO EXISTE una guía de despliegue a un servidor público.

## Requisitos

- Node.js y npm.
- En Windows, herramientas de compilación de C++ si `better-sqlite3` requiere compilarse.

## Backend

```powershell
cd backend
npm install
$env:SEED_PASSWORD_MARCELA = Read-Host "Contraseña de Marcela"
$env:SEED_PASSWORD_LAURA = Read-Host "Contraseña de Laura"
$env:SEED_PASSWORD_DANIEL = Read-Host "Contraseña de Daniel"
$env:SEED_PASSWORD_PATRICIA = Read-Host "Contraseña de Patricia"
npm run seed
npm start
```

La API usa `http://localhost:3000` por defecto y escucha en `127.0.0.1`.

## Frontend

En otra terminal:

```powershell
cd frontend
npm install
npm start
```

Abrir `http://localhost:4200`.

## Pruebas

```powershell
cd backend
npm test
npm run lint
```

Evidencia: [package.json backend](../backend/package.json) y [README](../README.md).
