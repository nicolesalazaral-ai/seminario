const bcrypt = require('bcryptjs');
const db = require('./db');

const usuariosSemilla = [
  {
    nombreUsuario: 'marcela',
    variable: 'SEED_PASSWORD_MARCELA',
    contrasena: process.env.SEED_PASSWORD_MARCELA,
    rol: 'recepcionista',
    medicoId: null,
  },
  {
    nombreUsuario: 'laura',
    variable: 'SEED_PASSWORD_LAURA',
    contrasena: process.env.SEED_PASSWORD_LAURA,
    rol: 'auxiliar',
    medicoId: null,
  },
  {
    nombreUsuario: 'daniel',
    variable: 'SEED_PASSWORD_DANIEL',
    contrasena: process.env.SEED_PASSWORD_DANIEL,
    rol: 'medico',
    medicoId: 1,
  },
  {
    nombreUsuario: 'patricia',
    variable: 'SEED_PASSWORD_PATRICIA',
    contrasena: process.env.SEED_PASSWORD_PATRICIA,
    rol: 'medico',
    medicoId: 2,
  },
];
const contrasenas = usuariosSemilla.map(({ contrasena }) => contrasena);
if (contrasenas.some((contrasena) => !contrasena)) {
  throw new Error(`Define estas variables antes de cargar los datos: ${usuariosSemilla.map(({ variable }) => variable).join(', ')}.`);
}
if (contrasenas.some((contrasena) => Buffer.byteLength(contrasena, 'utf8') > 72)) {
  throw new Error('Las contraseñas de seed no pueden superar 72 bytes (límite de bcrypt).');
}
const huellasContrasena = contrasenas.map((contrasena) =>
  Buffer.from(contrasena, 'utf8').subarray(0, 72).toString('hex'));
if (new Set(huellasContrasena).size !== huellasContrasena.length) {
  throw new Error('Cada usuario de seed debe tener una contraseña diferente.');
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

  const usuario = db.prepare(`
    INSERT OR IGNORE INTO usuario (nombre_usuario, contrasena_hash, rol, medico_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(nombre_usuario) DO UPDATE SET contrasena_hash = excluded.contrasena_hash
  `);
  for (const { nombreUsuario, contrasena, rol, medicoId } of usuariosSemilla) {
    usuario.run(nombreUsuario, bcrypt.hashSync(contrasena, 10), rol, medicoId);
  }

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
