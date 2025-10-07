// src/models/index.js

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// IMPORTANTE: Este require() assume que você tem um arquivo de configuração do Sequelize.
// Se você está definindo a conexão diretamente no database.js, podemos adaptar.
// Por enquanto, vamos manter a lógica de conexão que você já tem.
const sequelize = require('../config/database');

const db = {};

// Lê todos os arquivos do diretório atual
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Para cada arquivo, importa o modelo e o adiciona ao objeto 'db'
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Executa o método 'associate' de cada modelo, se ele existir
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;