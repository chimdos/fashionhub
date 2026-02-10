'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_malas_status" ADD VALUE 'CONCLUIDA';`
    ).catch(() => console.log('Status CONCLUIDA já existe.'));

    await queryInterface.addColumn('malas', 'data_conclusao', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('malas', 'data_conclusao');
  }
};