'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Lojas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nome_loja: { type: Sequelize.STRING, allowNull: false },
      cnpj: { type: Sequelize.STRING, unique: true },
      descricao: Sequelize.TEXT,
      cep: Sequelize.STRING,
      rua: Sequelize.STRING,
      numero: Sequelize.STRING,
      bairro: Sequelize.STRING,
      cidade: Sequelize.STRING,
      estado: Sequelize.STRING,
      criado_em: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('lojas'); }
};