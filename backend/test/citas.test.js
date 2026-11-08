const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

let citasDePrueba = [];
const dbDePrueba = {
  prepare() {
    return {
      all(medicoId, citaId) {
        return citasDePrueba.filter((cita) =>
          cita.medico_id === medicoId
          && cita.estado !== 'cancelada'
          && cita.id !== citaId
        );
      },
    };
  },
};

const cargarModulo = Module._load;
Module._load = function (solicitud, padre, esPrincipal) {
  if (solicitud === './db' && padre.filename.endsWith('citasService.js')) {
    return dbDePrueba;
  }
  return cargarModulo.call(this, solicitud, padre, esPrincipal);
};

let citasService;
try {
  citasService = require('../src/citasService');
} finally {
  Module._load = cargarModulo;
}

const { ErrorDeSolicitud, validarDisponibilidad } = citasService;
const citaDaniel = {
  id: 1,
  medico_id: 1,
  fecha_hora_inicio: '2026-11-02 10:00',
  duracion_min: 20,
  estado: 'pendiente',
};

test('rechaza la misma hora del mismo médico con el mensaje de HU-01', () => {
  citasDePrueba = [{ ...citaDaniel }];
  const copiaAntes = structuredClone(citasDePrueba);

  assert.throws(
    () => validarDisponibilidad(1, '2026-11-02T10:00', 20),
    (error) => error instanceof ErrorDeSolicitud
      && error.estado === 409
      && error.message === 'Esa hora ya está ocupada'
  );
  assert.deepEqual(citasDePrueba, copiaAntes);
});

test('permite la misma hora cuando corresponde a otro médico', () => {
  citasDePrueba = [{ ...citaDaniel }];

  assert.doesNotThrow(() => validarDisponibilidad(2, '2026-11-02T10:00', 20));
});

test('permite una cita que empieza justo cuando termina la anterior', () => {
  citasDePrueba = [{ ...citaDaniel }];

  assert.doesNotThrow(() => validarDisponibilidad(1, '2026-11-02T10:20', 20));
});

test('ignora las citas canceladas al comprobar el mismo horario', () => {
  citasDePrueba = [{ ...citaDaniel, estado: 'cancelada' }];

  assert.doesNotThrow(() => validarDisponibilidad(1, '2026-11-02T10:00', 20));
});

test('detecta el cruce cuando una cita de 30 minutos se solapa con una existente', () => {
  citasDePrueba = [{
    ...citaDaniel,
    fecha_hora_inicio: '2026-11-02 09:20',
  }];

  assert.throws(
    () => validarDisponibilidad(1, '2026-11-02T09:00', 30),
    (error) => error instanceof ErrorDeSolicitud
      && error.estado === 409
      && error.message === 'No hay 30 minutos libres a esa hora'
  );
});

test('permite la hora solicitada cuando la lista de citas está vacía', () => {
  citasDePrueba = [];

  assert.doesNotThrow(() => validarDisponibilidad(1, '2026-11-02T10:00', 20));
});
