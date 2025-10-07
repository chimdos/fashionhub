const { Bag, BagItem, ProductVariation, Product, Transaction, Address } = require('../models');
const sequelize = require('../config/database');
const Joi = require('joi');

// --- Esquemas de Validação ---
const createBagSchema = Joi.object({
  endereco_entrega_id: Joi.string().uuid().required(),
  observacoes: Joi.string().allow('').optional(),
  itens: Joi.array().items(
    Joi.object({
      variacao_produto_id: Joi.string().uuid().required(),
      quantidade: Joi.number().integer().positive().required()
    })
  ).min(1).required()
});

const confirmPurchaseSchema = Joi.object({
  itens_comprados: Joi.array().items(
    Joi.object({
      item_id: Joi.string().uuid().required(),
      comprar: Joi.boolean().required()
    })
  ).min(1).required()
});


// --- Controller ---
const bagController = {
  /**
   * Cliente cria uma nova solicitação de mala.
   */
  async createBagRequest(req, res) {
    const t = await sequelize.transaction();
    try {
      const { error, value } = createBagSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: 'Dados de entrada inválidos', details: error.details });
      }
      
      const { itens, endereco_entrega_id, observacoes } = value;
      const cliente_id = req.user.userId;

      if (req.user.tipo_usuario !== 'cliente') {
        return res.status(403).json({ message: 'Apenas clientes podem solicitar malas' });
      }

      const newBag = await Bag.create({
        cliente_id,
        endereco_entrega_id,
        observacoes,
        status: 'solicitada'
      }, { transaction: t });

      // Busca os produtos e seus preços do banco para garantir a segurança
      const bagItemsData = await Promise.all(itens.map(async (item) => {
        const variation = await ProductVariation.findByPk(item.variacao_produto_id, {
          include: { model: Product, as: 'produto' }
        });
        if (!variation || !variation.produto) {
          throw new Error(`Variação de produto com ID ${item.variacao_produto_id} não encontrada.`);
        }
        // [SEGURANÇA] O preço vem do banco, não do cliente!
        return {
          mala_id: newBag.id,
          variacao_produto_id: item.variacao_produto_id,
          quantidade_solicitada: item.quantidade,
          preco_unitario_mala: variation.produto.preco,
          status_item: 'incluido' // Status inicial
        };
      }));

      await BagItem.bulkCreate(bagItemsData, { transaction: t });

      await t.commit();

      res.status(201).json({
        message: 'Mala solicitada com sucesso',
        bag: newBag
      });
    } catch (error) {
      await t.rollback();
      console.error('Erro ao criar solicitação de mala:', error);
      res.status(500).json({ message: error.message || 'Erro interno do servidor' });
    }
  },

  /**
   * Cliente confirma quais itens da mala foram comprados e quais foram devolvidos.
   */
  async confirmPurchase(req, res) {
    const t = await sequelize.transaction();
    try {
      const { bagId } = req.params;
      const { error, value } = confirmPurchaseSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: 'Dados de entrada inválidos', details: error.details });
      }
      
      const { itens_comprados } = value;
      const cliente_id = req.user.userId;

      const bag = await Bag.findOne({
        where: { id: bagId, cliente_id, status: 'entregue_cliente' },
        transaction: t
      });

      if (!bag) {
        return res.status(404).json({ message: 'Mala não encontrada ou não está disponível para confirmação.' });
      }

      // Atualiza todos os itens de uma vez
      await Promise.all(itens_comprados.map(item =>
        BagItem.update(
          { status_item: item.comprar ? 'comprado' : 'devolvido' },
          { where: { id: item.item_id, mala_id: bagId }, transaction: t }
        )
      ));

      await bag.update({ status: 'em_devolucao' }, { transaction: t });

      await t.commit();

      res.json({
        message: 'Confirmação de compra registrada com sucesso.',
        bag
      });
    } catch (error) {
      await t.rollback();
      console.error('Erro ao confirmar compra:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  /**
   * Lojista confirma o recebimento da mala devolvida e finaliza o processo.
   */
  async confirmReturn(req, res) {
    const t = await sequelize.transaction();
    try {
        const { bagId } = req.params;
        const lojista_id = req.user.userId;

        const bag = await Bag.findOne({
            where: { id: bagId, status: 'devolvida_lojista' },
            include: [{
                model: BagItem,
                as: 'itens',
                include: [{
                    model: ProductVariation,
                    as: 'variacao_produto',
                    required: true,
                    include: [{
                        model: Product,
                        as: 'produto',
                        where: { lojista_id },
                        required: true
                    }]
                }]
            }]
        });

        if (!bag || !bag.itens || bag.itens.length === 0) {
            return res.status(404).json({ message: 'Mala não encontrada, vazia, ou você não tem permissão para acessá-la.' });
        }

        let valor_total = 0;
        const stockUpdates = [];

        // [PERFORMANCE] Usa os dados já buscados, sem novas queries no loop
        for (const item of bag.itens) {
            if (item.status_item === 'comprado') {
                valor_total += parseFloat(item.preco_unitario_mala);
            } else if (item.status_item === 'devolvido') {
                // [LÓGICA DE NEGÓCIO] Adiciona a atualização de estoque
                stockUpdates.push(
                    ProductVariation.increment(
                        { quantidade_estoque: item.quantidade_solicitada },
                        { where: { id: item.variacao_produto_id }, transaction: t }
                    )
                );
            }
        }
        
        // Executa todas as atualizações de estoque
        await Promise.all(stockUpdates);

        // Cria a transação de pagamento se houver valor a ser cobrado
        if (valor_total > 0) {
            // Aqui ocorreria a integração com o gateway de pagamento
            await Transaction.create({
                cliente_id: bag.cliente_id,
                mala_id: bag.id,
                valor_total,
                status_pagamento: 'aprovado', // Simulação
                metodo_pagamento: 'cartao_credito', // Simulação
                id_transacao_gateway: `sim_${Date.now()}`
            }, { transaction: t });
        }

        await bag.update({ status: 'finalizada' }, { transaction: t });

        await t.commit();

        res.json({
            message: 'Devolução confirmada com sucesso. A mala foi finalizada.'
        });
    } catch (error) {
        await t.rollback();
        console.error('Erro ao confirmar devolução:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
};

module.exports = bagController;
