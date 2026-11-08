const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');
const citasService = require('./citasService');

const app = express();
const tokens = new Map();
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

app.post('/citas', autenticar, exigirPersonal, conManejoDeErrores((req, res) => {
  res.status(201).json(citasService.crearCita(req.body || {}));
}));

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

app.get('/citas', autenticar, conManejoDeErrores((req, res) => {
  if (!esPersonal(req.usuario)) return res.status(403).json({ mensaje: 'No tienes permiso' });
  if (!citasService.fechaValida(req.query.fecha)) {
    return res.status(400).json({ mensaje: 'Fecha inválida' });
  }
  res.json(listaCitas(req.query.fecha));
}));

app.patch('/citas/:id', autenticar, exigirPersonal, conManejoDeErrores((req, res) => {
  const cita = citasService.moverCita(Number(req.params.id), req.body && req.body.fecha_hora_inicio);
  res.json(cita);
}));

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

app.listen(puerto, '0.0.0.0', () => {
  console.log(`API lista en http://localhost:${puerto}`);
});
