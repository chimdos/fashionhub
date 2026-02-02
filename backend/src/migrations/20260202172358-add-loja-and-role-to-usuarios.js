'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'loja_id', {
      type: Sequelize.UUID,
      references: { model: 'lojas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
    await queryInterface.addColumn('usuarios', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'worker',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('usuarios', 'loja_id');
    await queryInterface.removeColumn('usuarios', 'role');
  }
};