'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'veiculo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('usuarios', 'placa', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('usuarios', 'cnh', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'veiculo');
    await queryInterface.removeColumn('usuarios', 'placa');
    await queryInterface.removeColumn('usuarios', 'cnh');
  }
};