'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`ALTER TYPE "enum_malas_status" ADD VALUE IF NOT EXISTS 'MOTO_A_CAMINHO_LOJA';`);
    await queryInterface.sequelize.query(`ALTER TYPE "enum_malas_status" ADD VALUE IF NOT EXISTS 'MOTO_A_CAMINHO_COLETA';`);
    await queryInterface.sequelize.query(`ALTER TYPE "enum_malas_status" ADD VALUE IF NOT EXISTS 'AGUARDANDO_MOTO_DEVOLUCAO';`);
  },

  down: async (queryInterface, Sequelize) => {
    //
  }
};