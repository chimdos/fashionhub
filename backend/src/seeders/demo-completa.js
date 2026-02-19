'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const lojistaId = '91634c2c-087c-4d8c-b0ba-84089480b497';
    const clienteId = '46bd0d2c-dfe7-4dc4-a098-e2841faee8e4';

    const produtoId = uuidv4();
    const variacaoId = uuidv4();
    const malaId = uuidv4();

    await queryInterface.bulkInsert('produtos', [{
      id: produtoId,
      nome: 'Camiseta Teste Fashion Hub',
      descricao: 'Produto para validar fluxo de pagamento',
      preco: 100.00,
      categoria: 'TESTE',
      lojista_id: lojistaId,
      data_cadastro: new Date(),
      ativo: true
    }]);

    await queryInterface.bulkInsert('variacoes_produto', [{
      id: variacaoId,
      produto_id: produtoId,
      tamanho: 'G',
      cor: 'Preto',
      quantidade_estoque: 10
    }]);

    await queryInterface.bulkInsert('malas', [{
      id: malaId,
      status: 'SOLICITADA',
      tipo: 'FECHADA',
      cliente_id: clienteId,
      lojista_id: lojistaId,
      valor_frete: 15.00,
      data_solicitacao: new Date()
    }]);

    return queryInterface.bulkInsert('itens_mala', [{
      id: uuidv4(),
      mala_id: malaId,
      variacao_produto_id: variacaoId,
      quantidade_solicitada: 1,
      quantidade_incluida: 1,
      status_item: 'INCLUIDO',
      preco_unitario_mala: 100.00,
      is_extra: false
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('itens_mala', null, {});
    await queryInterface.bulkDelete('malas', null, {});
    await queryInterface.bulkDelete('variacoes_produto', null, {});
    await queryInterface.bulkDelete('produtos', null, {});
  }
};