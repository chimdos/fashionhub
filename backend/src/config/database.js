const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: isProduction ? false : console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
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