'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('malas', 'data_solicitacao', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('malas', 'lojista_id', {
      type: Sequelize.UUID,
      references: { model: 'usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    await queryInterface.addColumn('malas', 'entregador_id', {
      type: Sequelize.UUID,
      references: { model: 'usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    await queryInterface.addColumn('malas', 'distancia_estimada', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('malas', 'data_solicitacao');
    await queryInterface.removeColumn('malas', 'lojista_id');
    await queryInterface.removeColumn('malas', 'entregador_id');
    await queryInterface.removeColumn('malas', 'distancia_estimada');
  }
};