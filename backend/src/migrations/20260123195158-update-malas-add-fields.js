'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Comentamos tudo porque as colunas já existem no banco físico.
    // Ao rodar a migration "vazia", o Sequelize apenas registra que ela foi "concluída".
    /*
    await queryInterface.addColumn('malas', 'data_solicitacao', { ... });
    await queryInterface.addColumn('malas', 'lojista_id', { ... });
    await queryInterface.addColumn('malas', 'entregador_id', { ... });
    await queryInterface.addColumn('malas', 'distancia_estimada', { ... });
    */
  },

  async down(queryInterface, Sequelize) {
    /*
    await queryInterface.removeColumn('malas', 'data_solicitacao');
    await queryInterface.removeColumn('malas', 'lojista_id');
    await queryInterface.removeColumn('malas', 'entregador_id');
    await queryInterface.removeColumn('malas', 'distancia_estimada');
    */
  }
};