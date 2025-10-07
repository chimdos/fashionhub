// src/config/database.js
// configuração do banco de dados com sequelize

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Garante que o .env foi lido

// Validação básica para garantir que as variáveis de ambiente essenciais existem
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Erro de configuração: A variável de ambiente ${varName} não foi definida.`);
  }
});

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,

    // SUGESTÃO 1: Habilita os logs SQL apenas em ambiente de desenvolvimento
    logging: isProduction ? false : console.log,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    // SUGESTÃO 2: Configuração de SSL necessária para ambientes de produção na nuvem
    ...(isProduction && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Esta opção pode ser necessária em algumas plataformas
        }
      }
    }),
    
    // Opcional: Define um padrão para a nomenclatura das tabelas
    define: {
      // Ex: impede que o Sequelize pluralize os nomes dos modelos
      freezeTableName: true, 
      // Ex: adiciona timestamps (createdAt, updatedAt) a todos os modelos
      timestamps: true 
    }
  }
);

module.exports = sequelize;