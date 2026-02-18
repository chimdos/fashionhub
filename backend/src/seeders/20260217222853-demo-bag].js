'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const malaId = uuidv4();

    await queryInterface.bulkInsert('malas', [{
      id: malaId,
      status: 'SOLICITADA',
      tipo: 'FECHADA',
      valor_frete: 15.00,
      data_solicitacao: new Date(),
      cliente_id:  '46bd0d2c-dfe7-4dc4-a098-e2841faee8e4',
      lojista_id: '91634c2c-087c-4d8c-b0ba-84089480b497',
    }], {});

    return queryInterface.bulkInsert('itens_mala', [
      {
        id: uuidv4(),
        mala_id: malaId,
        quantidade_solicitada: 1,
        quantidade_incluida: 1,
        status_item: 'INCLUIDO',
        preco_unitario_mala: 89.90,
        is_extra: false
      },
      {
        id: uuidv4(),
        mala_id: malaId,
        quantidade_solicitada: 2,
        quantidade_incluida: 2,
        status_item: 'INCLUIDO',
        preco_unitario_mala: 45.00,
        is_extra: true
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('itens_mala', null, {});
    await queryInterface.bulkDelete('malas', null, {});
  }
};