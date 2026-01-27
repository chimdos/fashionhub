'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Comentado pois a coluna já existe no banco físico
    /*
    await queryInterface.addColumn('malas', 'token_devolucao', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    */
  },

  down: async (queryInterface, Sequelize) => {
    /*
    await queryInterface.removeColumn('malas', 'token_devolucao');
    */
  }
};