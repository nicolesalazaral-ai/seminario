const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const test = require('node:test');

const backend = path.join(__dirname, '..');
const usuarios = [
  { nombreUsuario: 'marcela', variable: 'SEED_PASSWORD_MARCELA', contrasena: 'clave-marcela-distinta' },
  { nombreUsuario: 'laura', variable: 'SEED_PASSWORD_LAURA', contrasena: 'clave-laura-distinta' },
  { nombreUsuario: 'daniel', variable: 'SEED_PASSWORD_DANIEL', contrasena: 'clave-daniel-distinta' },
  { nombreUsuario: 'patricia', variable: 'SEED_PASSWORD_PATRICIA', contrasena: 'clave-patricia-distinta' },
];

test('el seed exige contraseñas distintas y evita autenticación cruzada entre roles', (t) => {
  const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-seed-'));
  t.after(() => fs.rmSync(carpetaTemporal, { recursive: true, force: true }));

  const dbPath = path.join(carpetaTemporal, 'agenda.sqlite3');
  const env = {
    ...process.env,
    DB_PATH: dbPath,
    SEED_PASSWORD_MARCELA: usuarios[0].contrasena,
    SEED_PASSWORD_LAURA: usuarios[1].contrasena,
    SEED_PASSWORD_DANIEL: usuarios[2].contrasena,
    SEED_PASSWORD_PATRICIA: usuarios[3].contrasena,
  };
  const seed = spawnSync(process.execPath, ['src/seed.js'], { cwd: backend, env, encoding: 'utf8' });
  assert.equal(seed.status, 0, seed.stderr);

  const db = new Database(dbPath);
  try {
    const registros = db.prepare('SELECT nombre_usuario, contrasena_hash FROM usuario').all();
    assert.equal(registros.length, usuarios.length);

    for (const { nombreUsuario, contrasena } of usuarios) {
      const propio = registros.find((registro) => registro.nombre_usuario === nombreUsuario);
      assert.ok(bcrypt.compareSync(contrasena, propio.contrasena_hash));
      for (const { nombreUsuario: otroUsuario, contrasena: otraContrasena } of usuarios) {
        if (otroUsuario !== nombreUsuario) {
          assert.equal(bcrypt.compareSync(otraContrasena, propio.contrasena_hash), false);
        }
      }
    }
  } finally {
    db.close();
  }
});

test('el seed rechaza la misma contraseña para cuentas con roles distintos', (t) => {
  const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'agenda-seed-duplicate-'));
  t.after(() => fs.rmSync(carpetaTemporal, { recursive: true, force: true }));

  const env = {
    ...process.env,
    DB_PATH: path.join(carpetaTemporal, 'agenda.sqlite3'),
    SEED_PASSWORD_MARCELA: 'misma-clave-para-todos',
    SEED_PASSWORD_LAURA: 'misma-clave-para-todos',
    SEED_PASSWORD_DANIEL: 'misma-clave-para-todos',
    SEED_PASSWORD_PATRICIA: 'misma-clave-para-todos',
  };
  const seed = spawnSync(process.execPath, ['src/seed.js'], { cwd: backend, env, encoding: 'utf8' });

  assert.notEqual(seed.status, 0);
  assert.match(seed.stderr, /Cada usuario de seed debe tener una contraseña diferente/);
});
