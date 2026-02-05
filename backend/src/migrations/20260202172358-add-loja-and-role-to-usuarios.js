'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('usuarios');

    if (!tableInfo.loja_id) {
      await queryInterface.addColumn('usuarios', 'loja_id', {
        type: Sequelize.UUID,
        references: { model: 'lojas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      });
    }

    if (!tableInfo.role) {
      await queryInterface.addColumn('usuarios', 'role', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'worker',
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('usuarios', 'loja_id');
    await queryInterface.removeColumn('usuarios', 'role');
  }
};