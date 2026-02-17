'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_malas_status" ADD VALUE 'CONCLUIDA';`
      );
    } catch (e) {
      console.log('Status CONCLUIDA já existe ou não pôde ser adicionado.');
    }

    const tableInfo = await queryInterface.describeTable('malas');

    if (!tableInfo.data_conclusao) {
      await queryInterface.addColumn('malas', 'data_conclusao', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('malas');

    if (tableInfo.data_conclusao) {
      await queryInterface.removeColumn('malas', 'data_conclusao');
    }
  }
};