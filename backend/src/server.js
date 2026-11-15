const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');
const citasService = require('./citasService');

const app = express();
const tokens = new Map();
const host = '127.0.0.1';
const puerto = process.env.PORT || 3000;
const estadosValidos = new Set(['pendiente', 'atendida', 'cancelada', 'no_llego']);

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function conManejoDeErrores(manejador) {
  return (req, res, next) => {
    try {
      manejador(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function autenticar(req, res, next) {
  const token = (req.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const usuario = tokens.get(token);
  if (!usuario) return res.status(403).json({ mensaje: 'No tienes permiso' });
  req.usuario = usuario;
  next();
}

function esPersonal(usuario) {
  return usuario.rol === 'recepcionista' || usuario.rol === 'auxiliar';
}

function exigirPersonal(req, res, next) {
  if (!esPersonal(req.usuario)) return res.status(403).json({ mensaje: 'No tienes permiso' });
  next();
}

function citaPorId(id) {
  return db.prepare('SELECT * FROM cita WHERE id = ?').get(id);
}

function listaCitas(fecha, medicoId = null) {
  const condiciones = ['substr(c.fecha_hora_inicio, 1, 10) = ?'];
  const parametros = [fecha];
  if (medicoId !== null) {
    condiciones.push('c.medico_id = ?');
    parametros.push(medicoId);
  }
  return db.prepare(`
    SELECT c.id, c.paciente_id, p.nombre AS paciente, p.celular,
      c.medico_id, m.nombre AS medico, c.fecha_hora_inicio, c.motivo,
      c.duracion_min, c.estado
    FROM cita c
    JOIN paciente p ON p.id = c.paciente_id
    JOIN medico m ON m.id = c.medico_id
    WHERE ${condiciones.join(' AND ')}
    ORDER BY c.fecha_hora_inicio
  `).all(...parametros);
}

/**
 * Inicia sesión y entrega un token temporal en memoria.
 * @route POST /sesiones
 * @param {import('express').Request} req Body JSON con usuario y contrasena.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {void} 201 con token y usuario; 400 si faltan datos; 401 si no coinciden; 500 ante error interno.
 */
app.post('/sesiones', conManejoDeErrores((req, res) => {
  const { usuario, contrasena } = req.body || {};
  if (!usuario || !contrasena) return res.status(400).json({ mensaje: 'Datos incompletos' });
  const registro = db.prepare('SELECT * FROM usuario WHERE nombre_usuario = ?').get(usuario);
  if (!registro || !bcrypt.compareSync(contrasena, registro.contrasena_hash)) {
    return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  const datosUsuario = {
    id: registro.id,
    usuario: registro.nombre_usuario,
    rol: registro.rol,
    medico_id: registro.medico_id,
  };
  tokens.set(token, datosUsuario);
  res.status(201).json({ token, usuario: datosUsuario });
}));

/**
 * Crea un paciente para uso del personal autenticado.
 * @route POST /pacientes
 * @param {import('express').Request} req Body JSON con nombre y celular.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {void} 201 con el paciente; 400 ante campos vacíos; 403 sin token o rol autorizado; 500 ante error interno.
 */
app.post('/pacientes', autenticar, exigirPersonal, conManejoDeErrores((req, res) => {
  const { nombre, celular } = req.body || {};
  if (typeof celular !== 'string' || !celular.trim()) {
    return res.status(400).json({ mensaje: 'El celular es obligatorio' });
  }
  if (typeof nombre !== 'string' || !nombre.trim()) {
    return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
  }
  const resultado = db.prepare('INSERT INTO paciente (nombre, celular) VALUES (?, ?)')
    .run(nombre.trim(), celular.trim());
  res.status(201).json(db.prepare('SELECT * FROM paciente WHERE id = ?').get(resultado.lastInsertRowid));
}));

/**
 * Busca un paciente por nombre y cuenta sus faltas.
 * @route GET /pacientes?nombre=...
 * @param {import('express').Request} req Query string con nombre.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {void} 200 con el paciente; 400 sin nombre; 404 si no existe; 403 sin acceso; 500 ante error interno.
 */
app.get('/pacientes', autenticar, exigirPersonal, conManejoDeErrores((req, res) => {
  const nombre = typeof req.query.nombre === 'string' ? req.query.nombre.trim() : '';
  if (!nombre) return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
  const paciente = db.prepare(`
    SELECT p.id, p.nombre, p.celular,
      (SELECT COUNT(*) FROM cita c
       WHERE c.paciente_id = p.id AND c.estado = 'no_llego') AS faltas
    FROM paciente p
    WHERE p.nombre = ? COLLATE NOCASE
  `).get(nombre);
  if (!paciente) return res.status(404).json({ mensaje: 'No hay un paciente con ese nombre' });
  res.json(paciente);
}));

/**
 * Valida y agenda una cita; solo puede usarla el personal.
 * @route POST /citas
 * @param {import('express').Request} req Body con paciente_id, medico_id, fecha_hora_inicio y motivo.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {void} 201 con la cita; 400, 404, 409 o 422 ante errores de validación; 403 sin acceso; 500 ante error interno.
 */
app.post('/citas', autenticar, exigirPersonal, conManejoDeErrores((req, res) => {
  res.status(201).json(citasService.crearCita(req.body || {}));
}));

/**
 * Consulta las citas de un médico; un médico solo puede consultar su propia agenda.
 * @route GET /medicos/:id/citas?fecha=AAAA-MM-DD
 * @param {import('express').Request} req ID en params y fecha en query.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {void} 200 con las citas; 400 ante fecha inválida; 403 sin acceso; 404 si no existe el médico; 500 ante error interno.
 */
app.get('/medicos/:id/citas', autenticar, conManejoDeErrores((req, res) => {
  const medicoId = Number(req.params.id);
  if (!Number.isInteger(medicoId)) return res.status(404).json({ mensaje: 'No existe ese médico' });
  const medico = db.prepare('SELECT id FROM medico WHERE id = ?').get(medicoId);
  if (!medico) return res.status(404).json({ mensaje: 'No existe ese médico' });
  const fecha = req.query.fecha;
  if (!citasService.fechaValida(fecha)) return res.status(400).json({ mensaje: 'Fecha inválida' });
  if (!esPersonal(req.usuario) && req.usuario.medico_id !== medicoId) {
    return res.status(403).json({ mensaje: 'No tienes permiso' });
  }
  res.json(listaCitas(fecha, medicoId));
}));

/**
 * Consulta todas las citas de una fecha para el personal autenticado.
 * @route GET /citas?fecha=AAAA-MM-DD
 * @param {import('express').Request} req Fecha en query.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {void} 200 con las citas; 400 ante fecha inválida; 403 si no es personal; 500 ante error interno.
 */
app.get('/citas', autenticar, conManejoDeErrores((req, res) => {
  if (!esPersonal(req.usuario)) return res.status(403).json({ mensaje: 'No tienes permiso' });
  if (!citasService.fechaValida(req.query.fecha)) {
    return res.status(400).json({ mensaje: 'Fecha inválida' });
  }
  res.json(listaCitas(req.query.fecha));
}));

/**
 * Mueve una cita; solo puede usarla el personal autenticado.
 * @route PATCH /citas/:id
 * @param {import('express').Request} req ID en params y fecha_hora_inicio en body.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {void} 200 con la cita; 400, 404, 409 o 422 ante errores de validación; 403 sin acceso; 500 ante error interno.
 */
app.patch('/citas/:id', autenticar, exigirPersonal, conManejoDeErrores((req, res) => {
  const cita = citasService.moverCita(Number(req.params.id), req.body && req.body.fecha_hora_inicio);
  res.json(cita);
}));

/**
 * Cambia el estado de una cita con permisos de personal o del médico asignado.
 * @route PUT /citas/:id/estado
 * @param {import('express').Request} req ID en params y estado en body.
 * @param {import('express').Response} res Respuesta HTTP.
 * @returns {void} 200 con la cita; 400 ante estado inválido; 403 sin permiso; 404 si no existe; 500 ante error interno.
 */
app.put('/citas/:id/estado', autenticar, conManejoDeErrores((req, res) => {
  const cita = citaPorId(Number(req.params.id));
  if (!cita) return res.status(404).json({ mensaje: 'No existe esa cita' });
  const { estado } = req.body || {};
  if (!estadosValidos.has(estado)) return res.status(400).json({ mensaje: 'Estado no válido' });

  if (esPersonal(req.usuario)) {
    // El personal puede administrar cualquier estado de la cita.
  } else if (req.usuario.medico_id === cita.medico_id && ['atendida', 'no_llego'].includes(estado)) {
    // Cada médico puede registrar el resultado de sus propias citas.
  } else {
    return res.status(403).json({ mensaje: 'No tienes permiso' });
  }

  db.prepare('UPDATE cita SET estado = ? WHERE id = ?').run(estado, cita.id);
  res.json(citaPorId(cita.id));
}));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof citasService.ErrorDeSolicitud) {
    return res.status(error.estado).json({ mensaje: error.message });
  }
  console.error(error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

function iniciarServidor(puertoServidor = puerto) {
  const servidor = app.listen(puertoServidor, host, () => {
    const direccion = servidor.address();
    const puertoEscuchando = typeof direccion === 'object' && direccion
      ? direccion.port
      : puertoServidor;
    console.log(`API lista en http://localhost:${puertoEscuchando}`);
  });
  return servidor;
}

if (require.main === module) iniciarServidor();

module.exports = { iniciarServidor };
