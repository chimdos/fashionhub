const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const isLocalHost = process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';

console.log(`--- Configuração de Banco ---`);
console.log(`Ambiente: ${process.env.NODE_ENV}`);
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Usar SSL: ${isProduction && !isLocalHost ? 'Sim' : 'Não'}`);

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: isProduction ? false : console.log,
  dialectOptions: (isProduction && !isLocalHost) ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  define: {
    freezeTableName: true,
    timestamps: true
  }
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

module.exports = {
  development: { ...config, dialectOptions: {} },
  production: config,
  sequelize: sequelize
};