/**
 * Corrige contrasenas de usuarios de prueba a parking123
 * Uso: node scripts/fix-passwords.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { sequelize, Usuario } = require('../models');

const USUARIOS = [
  { email: 'admin@parking.com', nombre: 'Admin ParkingControl', rol: 'ADMINISTRADOR' },
  { email: 'operador@parking.com', nombre: 'Operador 1', rol: 'OPERADOR' }
];

async function main() {
  const hash = await bcrypt.hash('parking123', 12);
  await sequelize.authenticate();
  console.log('Conectado a MySQL');

  for (const u of USUARIOS) {
    const [row, created] = await Usuario.findOrCreate({
      where: { email: u.email },
      defaults: { ...u, password: hash }
    });
    if (!created) {
      await row.update({ password: hash });
      console.log('Actualizado:', u.email);
    } else {
      console.log('Creado:', u.email);
    }
  }

  console.log('Listo. Contrasena para todos: parking123');
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
