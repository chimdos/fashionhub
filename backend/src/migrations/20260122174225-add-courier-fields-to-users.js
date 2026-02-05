'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('usuarios');

    if (!tableInfo.veiculo) {
      await queryInterface.addColumn('usuarios', 'veiculo', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableInfo.placa) {
      await queryInterface.addColumn('usuarios', 'placa', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableInfo.cnh) {
      await queryInterface.addColumn('usuarios', 'cnh', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'veiculo');
    await queryInterface.removeColumn('usuarios', 'placa');
    await queryInterface.removeColumn('usuarios', 'cnh');
  }
};