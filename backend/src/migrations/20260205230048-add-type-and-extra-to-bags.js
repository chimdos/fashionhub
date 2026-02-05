'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('malas', 'tipo', {
      type: Sequelize.ENUM('FECHADA', 'ABERTA'),
      defaultValue: 'FECHADA'
    });

    await queryInterface.addColumn('itens_mala', 'is_extra', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('malas', 'tipo');
    await queryInterface.removeColumn('itens_mala', 'is_extra');
  }
};