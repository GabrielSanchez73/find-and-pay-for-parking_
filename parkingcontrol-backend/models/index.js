const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const dialectOptions = process.env.DB_SSL === 'true'
  ? { ssl: { rejectUnauthorized: false } }
  : {};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: false,
      dialectOptions
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: false,
        dialectOptions
      }
    );

const Usuario = sequelize.define('Usuario', {
  nombre:   { type: DataTypes.STRING, allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  rol:      { type: DataTypes.ENUM('ADMINISTRADOR', 'OPERADOR'), defaultValue: 'OPERADOR' }
});

const Espacio = sequelize.define('Espacio', {
  numero: { type: DataTypes.STRING, allowNull: false },
  zona:   { type: DataTypes.STRING, allowNull: false },
  tipo:   { type: DataTypes.ENUM('CARRO', 'MOTO', 'DISCAPACITADO'), defaultValue: 'CARRO' },
  estado: { type: DataTypes.ENUM('DISPONIBLE', 'OCUPADO', 'RESERVADO'), defaultValue: 'DISPONIBLE' }
});

const Registro = sequelize.define('Registro', {
  placa:        { type: DataTypes.STRING, allowNull: false },
  tipoVehiculo: { type: DataTypes.ENUM('CARRO', 'MOTO'), defaultValue: 'CARRO' },
  horaIngreso:  { type: DataTypes.DATE, allowNull: false },
  horaSalida:   { type: DataTypes.DATE, allowNull: true },
  minutosTotal: { type: DataTypes.INTEGER, allowNull: true },
  totalPagar:   { type: DataTypes.DECIMAL(10,2), allowNull: true }
});

const Tarifa = sequelize.define('Tarifa', {
  tipoVehiculo: { type: DataTypes.ENUM('CARRO', 'MOTO'), allowNull: false },
  valorHora:    { type: DataTypes.DECIMAL(10,2), allowNull: false },
  activa:       { type: DataTypes.BOOLEAN, defaultValue: true }
});

// Relaciones
Espacio.hasMany(Registro, { foreignKey: 'espacioId' });
Registro.belongsTo(Espacio, { foreignKey: 'espacioId' });
Usuario.hasMany(Registro, { foreignKey: 'operadorId' });
Registro.belongsTo(Usuario, { foreignKey: 'operadorId' });

module.exports = { sequelize, Usuario, Espacio, Registro, Tarifa };
