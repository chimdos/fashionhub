'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_itens_mala_status_item" ADD VALUE IF NOT EXISTS 'COMPRADO';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_itens_mala_status_item" ADD VALUE IF NOT EXISTS 'DEVOLVIDO';
    `);
  },

  down: async (queryInterface, Sequelize) => {
  }
};