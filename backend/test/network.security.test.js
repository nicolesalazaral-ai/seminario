const assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-network-'));
process.env.DB_PATH = path.join(carpetaTemporal, 'agenda.sqlite3');

const db = require('../src/db');
const { iniciarServidor } = require('../src/server');

test('el servidor HTTP solo escucha en loopback', async (t) => {
  const servidor = iniciarServidor(0);
  await once(servidor, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    servidor.close((error) => (error ? reject(error) : resolve()));
  }));

  const direccion = servidor.address();
  assert.equal(typeof direccion, 'object');
  assert.equal(direccion.address, '127.0.0.1');

  const respuesta = await fetch(`http://127.0.0.1:${direccion.port}/sesiones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(respuesta.status, 400);
});

test.after(() => {
  db.close();
  fs.rmSync(carpetaTemporal, { recursive: true, force: true });
});
