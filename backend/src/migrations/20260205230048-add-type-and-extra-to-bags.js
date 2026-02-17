'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const malasTable = await queryInterface.describeTable('malas');
    const itensMalaTable = await queryInterface.describeTable('itens_mala');

    if (!malasTable.tipo) {
      await queryInterface.addColumn('malas', 'tipo', {
        type: Sequelize.ENUM('FECHADA', 'ABERTA'),
        defaultValue: 'FECHADA'
      });
    }

    if (!itensMalaTable.is_extra) {
      await queryInterface.addColumn('itens_mala', 'is_extra', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const malasTable = await queryInterface.describeTable('malas');
    const itensMalaTable = await queryInterface.describeTable('itens_mala');

    if (malasTable.tipo) {
      await queryInterface.removeColumn('malas', 'tipo');
    }

    if (itensMalaTable.is_extra) {
      await queryInterface.removeColumn('itens_mala', 'is_extra');
    }

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_malas_tipo";');
  }
};