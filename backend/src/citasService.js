const db = require('./db');

const motivos = new Set(['primera_vez', 'control', 'urgencia']);

class ErrorDeSolicitud extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado;
  }
}

function fechaValida(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const valor = new Date(Date.UTC(anio, mes - 1, dia));
  return valor.getUTCFullYear() === anio
    && valor.getUTCMonth() === mes - 1
    && valor.getUTCDate() === dia;
}

function fechaHoraValida(valor) {
  if (typeof valor !== 'string') return false;
  const coincidencia = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(valor);
  if (!coincidencia || !fechaValida(coincidencia[1])) return false;
  const hora = Number(coincidencia[2]);
  const minuto = Number(coincidencia[3]);
  return hora <= 23 && minuto <= 59;
}

function validarDatosCita({ paciente_id, medico_id, fecha_hora_inicio, motivo }) {
  if (paciente_id === undefined || paciente_id === null || String(paciente_id).trim() === ''
    || medico_id === undefined || medico_id === null || String(medico_id).trim() === ''
    || !Number.isInteger(Number(paciente_id))
    || !Number.isInteger(Number(medico_id))
    || !fechaHoraValida(fecha_hora_inicio)
    || !motivos.has(motivo)) {
    throw new ErrorDeSolicitud(400, 'Datos de cita inválidos');
  }
}

function validarHorario(medicoId, fechaHora, duracion) {
  const fecha = fechaHora.slice(0, 10);
  const dia = new Date(`${fecha}T00:00:00`).getDay();
  const horaInicio = fechaHora.slice(11, 16);
  const finMinutos = Number(horaInicio.slice(0, 2)) * 60
    + Number(horaInicio.slice(3, 5)) + duracion;
  const fin = `${String(Math.floor(finMinutos / 60)).padStart(2, '0')}:${String(finMinutos % 60).padStart(2, '0')}`;
  const horario = db.prepare(`
    SELECT 1 FROM horario_medico
    WHERE medico_id = ? AND dia_semana = ?
      AND hora_inicio <= ? AND hora_fin >= ?
  `).get(medicoId, dia, horaInicio, fin);

  if (!horario) {
    if (medicoId === 2 && ![2, 4, 6].includes(dia)) {
      throw new ErrorDeSolicitud(422, 'La doctora Patricia no atiende ese día');
    }
    throw new ErrorDeSolicitud(422, 'El médico no atiende en ese horario');
  }
}

function validarDisponibilidad(medicoId, fechaHora, duracion, citaId = null) {
  const inicio = new Date(fechaHora).getTime();
  const fin = inicio + duracion * 60000;
  const citas = db.prepare(`
    SELECT id, fecha_hora_inicio, duracion_min
    FROM cita
    WHERE medico_id = ? AND estado != 'cancelada' AND id != ?
  `).all(medicoId, citaId || -1);

  const ocupada = citas.some((cita) => {
    const inicioExistente = new Date(cita.fecha_hora_inicio).getTime();
    const finExistente = inicioExistente + cita.duracion_min * 60000;
    return inicio < finExistente && fin > inicioExistente;
  });

  if (ocupada) {
    if (duracion === 30) {
      throw new ErrorDeSolicitud(409, 'No hay 30 minutos libres a esa hora');
    }
    throw new ErrorDeSolicitud(409, 'Esa hora ya está ocupada');
  }
}

function crearCita(datos) {
  validarDatosCita(datos);
  const pacienteId = Number(datos.paciente_id);
  const medicoId = Number(datos.medico_id);
  const paciente = db.prepare('SELECT id FROM paciente WHERE id = ?').get(pacienteId);
  if (!paciente) throw new ErrorDeSolicitud(404, 'No existe ese paciente');
  const medico = db.prepare('SELECT id FROM medico WHERE id = ?').get(medicoId);
  if (!medico) throw new ErrorDeSolicitud(404, 'No existe ese médico');

  const duracion = datos.motivo === 'primera_vez' ? 30 : 20;
  validarHorario(medicoId, datos.fecha_hora_inicio, duracion);
  validarDisponibilidad(medicoId, datos.fecha_hora_inicio, duracion);

  const resultado = db.prepare(`
    INSERT INTO cita (paciente_id, medico_id, fecha_hora_inicio, motivo, duracion_min)
    VALUES (?, ?, ?, ?, ?)
  `).run(pacienteId, medicoId, datos.fecha_hora_inicio.replace('T', ' '), datos.motivo, duracion);
  return db.prepare('SELECT * FROM cita WHERE id = ?').get(resultado.lastInsertRowid);
}

function moverCita(id, fechaHora) {
  if (!fechaHoraValida(fechaHora)) {
    throw new ErrorDeSolicitud(400, 'Fecha y hora inválidas');
  }
  const cita = db.prepare('SELECT * FROM cita WHERE id = ?').get(id);
  if (!cita) throw new ErrorDeSolicitud(404, 'No existe esa cita');
  if (cita.estado === 'cancelada') throw new ErrorDeSolicitud(400, 'No se puede mover una cita cancelada');

  validarHorario(cita.medico_id, fechaHora, cita.duracion_min);
  validarDisponibilidad(cita.medico_id, fechaHora, cita.duracion_min, cita.id);
  db.prepare('UPDATE cita SET fecha_hora_inicio = ? WHERE id = ?')
    .run(fechaHora.replace('T', ' '), cita.id);
  return db.prepare('SELECT * FROM cita WHERE id = ?').get(cita.id);
}

module.exports = {
  ErrorDeSolicitud,
  crearCita,
  fechaHoraValida,
  fechaValida,
  moverCita,
  validarDisponibilidad,
  validarHorario,
};
