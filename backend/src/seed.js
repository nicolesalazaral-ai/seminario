const bcrypt = require('bcryptjs');
const db = require('./db');

const contrasena = process.env.SEED_PASSWORD;
if (!contrasena) {
  throw new Error('Define SEED_PASSWORD antes de cargar los datos de prueba.');
}

const insertarDatos = db.transaction(() => {
  db.prepare('INSERT OR IGNORE INTO medico (id, nombre) VALUES (?, ?)')
    .run(1, 'Dr. Daniel');
  db.prepare('INSERT OR IGNORE INTO medico (id, nombre) VALUES (?, ?)')
    .run(2, 'Dra. Patricia');

  const horario = db.prepare(`
    INSERT OR IGNORE INTO horario_medico (medico_id, dia_semana, hora_inicio, hora_fin)
    VALUES (?, ?, ?, ?)
  `);
  for (const medicoId of [1, 2]) {
    const dias = medicoId === 1 ? [1, 2, 3, 4, 5, 6] : [2, 4, 6];
    for (const dia of dias) {
      horario.run(medicoId, dia, '08:00', '12:00');
      horario.run(medicoId, dia, '13:00', '17:00');
    }
  }

  const contrasenaHash = bcrypt.hashSync(contrasena, 10);
  const usuario = db.prepare(`
    INSERT OR IGNORE INTO usuario (nombre_usuario, contrasena_hash, rol, medico_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(nombre_usuario) DO UPDATE SET contrasena_hash = excluded.contrasena_hash
  `);
  usuario.run('marcela', contrasenaHash, 'recepcionista', null);
  usuario.run('laura', contrasenaHash, 'auxiliar', null);
  usuario.run('daniel', contrasenaHash, 'medico', 1);
  usuario.run('patricia', contrasenaHash, 'medico', 2);

  const paciente = db.prepare('INSERT OR IGNORE INTO paciente (id, nombre, celular) VALUES (?, ?, ?)');
  for (let numero = 1; numero <= 5; numero += 1) {
    paciente.run(numero, `Paciente ${numero}`, `300123456${numero}`);
  }

  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  while (manana.getDay() === 0 || manana.getDay() === 1 || manana.getDay() === 3 || manana.getDay() === 5) {
    manana.setDate(manana.getDate() + 1);
  }
  const fecha = `${manana.getFullYear()}-${String(manana.getMonth() + 1).padStart(2, '0')}-${String(manana.getDate()).padStart(2, '0')}`;
  const ejemplo = db.prepare(`
    INSERT INTO cita (paciente_id, medico_id, fecha_hora_inicio, motivo, duracion_min)
    SELECT ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM cita WHERE paciente_id = ? AND medico_id = ? AND fecha_hora_inicio = ?
    )
  `);
  ejemplo.run(1, 1, `${fecha} 09:00`, 'control', 20, 1, 1, `${fecha} 09:00`);
  ejemplo.run(2, 2, `${fecha} 10:00`, 'primera_vez', 30, 2, 2, `${fecha} 10:00`);
});

insertarDatos();
console.log('Datos de prueba listos. Contraseña definida desde SEED_PASSWORD.');
db.close();
