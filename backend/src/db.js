const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const archivoDb = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '..', 'data', 'agenda.sqlite3');
// DB_PATH is trusted local operator configuration, not request data.
// eslint-disable-next-line security/detect-non-literal-fs-filename
fs.mkdirSync(path.dirname(archivoDb), { recursive: true });

const db = new Database(archivoDb);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS medico (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS horario_medico (
    id INTEGER PRIMARY KEY,
    medico_id INTEGER NOT NULL REFERENCES medico(id),
    dia_semana INTEGER NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    UNIQUE (medico_id, dia_semana, hora_inicio)
  );

  CREATE TABLE IF NOT EXISTS paciente (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    celular TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cita (
    id INTEGER PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES paciente(id),
    medico_id INTEGER NOT NULL REFERENCES medico(id),
    fecha_hora_inicio TEXT NOT NULL,
    motivo TEXT NOT NULL CHECK (motivo IN ('primera_vez', 'control', 'urgencia')),
    duracion_min INTEGER NOT NULL CHECK (duracion_min IN (20, 30)),
    estado TEXT NOT NULL DEFAULT 'pendiente'
      CHECK (estado IN ('pendiente', 'atendida', 'cancelada', 'no_llego'))
  );

  CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY,
    nombre_usuario TEXT NOT NULL UNIQUE,
    contrasena_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('recepcionista', 'auxiliar', 'medico')),
    medico_id INTEGER REFERENCES medico(id)
  );
`);

module.exports = db;
