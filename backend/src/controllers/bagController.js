const { Bag, BagItem, Product, ProductVariation, User, Address } = require('../models');
const sequelize = require('../config/database');
const Joi = require('joi');

// Função que gera o token de 6 dígitos
const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString();

// Schemas Joi
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

// Schema para validação da ação do lojista
const storeActionSchema = Joi.object({
  action: Joi.string().valid('ACEITAR', 'RECUSAR').required(),
  motivo: Joi.string().optional()
});

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
        status: 'SOLICITADA'
      }, { transaction: t });

      const bagItemsData = await Promise.all(itens.map(async (item) => {
        const variation = await ProductVariation.findByPk(item.variacao_produto_id, {
          include: { model: Product, as: 'produto' }
        });
        if (!variation || !variation.produto) {
          throw new Error(`Variação ${item.variacao_produto_id} não encontrada.`);
        }

        // TODO: Verificar variation.quantidade_estoque > 0

        return {
          mala_id: newBag.id,
          variacao_produto_id: item.variacao_produto_id,
          quantidade_solicitada: item.quantidade,
          preco_unitario_mala: variation.produto.preco,
          status_item: 'incluido'
        };
      }));

      await BagItem.bulkCreate(bagItemsData, { transaction: t });
      await t.commit();

      res.status(201).json({ message: 'Mala solicitada com sucesso', bag: newBag });

    } catch (error) {
      await t.rollback();
      console.error('Erro ao criar solicitação de mala:', error);
      res.status(500).json({ message: error.message || 'Erro interno do servidor' });
    }
  },

  /**
   * Lojista busca as solicitações de malas para a sua loja.
   */
  async getStoreBagRequests(req, res) {
    try {
      const lojista_id = req.user.userId;

      const bags = await Bag.findAll({
        where: { status: ['SOLICITADA', 'PREPARANDO', 'AGUARDANDO_MOTO', 'EM_ROTA_ENTREGA'] },
        include: [
          { model: User, as: 'cliente', attributes: ['id', 'nome', 'email', 'telefone'] },
          { model: Address, as: 'endereco' },
          {
            model: BagItem,
            as: 'itens',
            required: true,
            include: [{
              model: ProductVariation,
              as: 'variacao_produto',
              required: true,
              include: [{
                model: Product,
                as: 'produto',
                where: { lojista_id },
                required: true,
                attributes: ['id', 'nome', 'imagem_url']
              }]
            }]
          }
        ],
        order: [['createdAt', 'DESC']],
      });

      // Filtra malas que não contém itens da loja
      const filteredBags = bags.filter(bag => bag.itens.length > 0);

      res.json(filteredBags);

      const simplifiedBags = bags.map(bag => ({
        id: bag.id,
        status: bag.status,
        data_solicitacao: bag.data_solicitacao,
        cliente: bag.cliente,
        itemCount: bag.itens.length,
      }));

      res.json(simplifiedBags);

    } catch (error) {
      console.error('Erro ao buscar malas da loja:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  // Lojista aceita ou recusa a mala
  async updateStatusByStore(req, res) {
    const { bagId } = req.params;

    // Validação Joi
    const { error, value } = storeActionSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Entrada inválida', details: error.details });

    const { action, motivo } = value;

    try {
      const bag = await Bag.findByPk(bagId);
      if (!bag) return res.status(404).json({ message: 'Mala não encontrada' });

      // Fluxo de recusa
      if (action === 'RECUSAR') {
        if (!motivo) return res.status(400).json({ message: 'Motivo é obrigatório ao recusar.' });

        await bag.update({
          status: 'RECUSADA',
          motivo_recusa: motivo
        });

        // TODO: Notificar cliente (push notification)
        return res.json({ message: 'Pedido recusado.', bag });
      }

      // Fluxo de aceite
      if (action === 'ACEITAR') {
        const tokenRetirada = generateToken();
        const tokenEntrega = generateToken();

        await bag.update({
          status: 'PREPARANDO',
          token_retirada: tokenRetirada,
          token_entrega: tokenEntrega
        });

        //TODO: Notificar cliente ("Sua mala já está sendo preparada")
        return res.json({
          message: 'Pedido aceito. Inicie o preparo',
          tokens: { retirada: tokenRetirada }
        });
      }
    } catch (error) {
      console.error(error);
      return res.json(500)({ error: 'Erro ao processar ação do lojista.' });
    }
  },

  // Lojista solicita entregador/motoboy
  async requestCourier(req, res) {
    const { bagId } = req.params;

    try {
      // Busca a mala e o endereço da loja
      const bag = await Bag.findByPk(bagId, {
        include: [
          { model: Address, as: 'endereco' } // Endereço do cliente (destino)
        ]
      });

      if (!bag) return res.status(404).json({ message: 'Mala não encontrada.' });

      if (bag.status !== 'PREPARANDO') {
        return res.status(400).json({ message: 'A mala precisa estar no status PREPARANDO para chamar motoboy.' });
      }

      // Atualiza o status após o processo
      await bag.update({ status: 'AGUARDANDO_MOTO' });

      // SOCKET.IO
      // Emite o evento para a sala 'entregadores
      // Envia lat/lng da loja (origem) e do cliente (destino)
      if (req.io) {
        req.io.emit('NOVA_ENTREGA_DISPONIVEL', {
          bagId: bag.id,
          origem: "Endereço da Loja A",
          destino: bag.endereco,
          valorFrete: 15.50, // Calcular via API do Google Maps depois
          distancia: "3.2 km"
        });
        console.log(`Socket emitido: Motoboys notificados para mala ${bag.id}`);
      } else {
        console.warn("Socket.io não está configurado no req.io");
      }

      return res.json({ message: 'Procurando entregadores...', status: 'AGUARDANDO_MOTO' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao solicitar entregador.' });
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
      const { itens_comprados } = req.body;
      const clienteId = req.user.userId;

      if (error) {
        return res.status(400).json({ message: 'Dados inválidos', details: error.details });
      }

      const bag = await Bag.findOne({
        where: { id: bagId, cliente_id, status: 'ENTREGUE' },
        transaction: t
      });

      if (!bag) {
        return res.status(404).json({ message: 'Mala não encontrada ou não está disponível para confirmação.' });
      }

      for (const itemSelection of itens_comprados) {
        const itemDb = await BagItem.findOne({
          where: { id: itemSelection.item_id, mala_id: bagId },
          transaction: t
        });

        if (itemDb) {
          const novoStatus = itemSelection.comprar ? 'COMPRADO' : 'DEVOLVIDO';
          await itemDb.update({ status_item: novoStatus }, { transaction: t });

          if (itemSelection.comprar) {
            valorFinal += parseFloat(itemDb.preco_unitario_mala);
          }
        }
      }

      await Promise.all(itens_comprados.map(item =>
        BagItem.update(
          { status_item: item.comprar ? 'comprado' : 'devolvido' },
          { where: { id: item.item_id, mala_id: bagId }, transaction: t }
        )
      ));

      // IMPORTANTE: Agora a mala precisa voltar para a loja!
      // Mudamos o status para AGUARDANDO_MOTO (para aparecer no painel do motoboy de novo)
      // Mas precisamos de uma flag para saber que é uma "Volta" e não "Ida".
      // Vamos usar o status 'AGUARDANDO_MOTO' e o motoboy vai saber pela origem/destino
      // Ou, se preferir usar 'EM_ROTA_DEVOLUCAO' direto se a loja busca depois. 
      // Vamos manter a lógica do Uber: Gera nova corrida.

      // Reseta o entregador para NULL para que qualquer um possa pegar a volta
      // E gera token de retirada novo (agora o cliente é quem fornece o token pro motoboy)
      const novoTokenRetirada = Math.floor(100000 + Math.random() * 900000).toString();

      // Muda o status para EM_ROTA_DEVOLUCAO (assumindo que o motoboy busca depois)
      // Ou 'AGUARDANDO_RETIRADA' se o sistema gera nova corrida automática
      await bag.update({
        status: 'AGUARDANDO_MOTO',
        token_retirada: novoTokenRetirada,
        entregador_id: null,
        data_entrega: null,
        data_retirada: null
      }, { transaction: t });

      await t.commit();

      // Envia Socket para os entregadores
      if (req.io) {
        req.io.emit('NOVA_ENTREGA_DISPONIVEL', {
          bagId: bag.id,
          tipo: 'DEVOLUCAO',
          origem: "Casa do Cliente", // Endereço real no futuro
          destino: "Loja Tal", // Endereço real no futuro
          valorFrete: 12.00 // Valor exemplo
        });
      }

      return res.json({
        message: 'Compra confirmada! Um entregador virá buscar a mala.',
        valorTotal: valorFinal,
        tokenDevolucao: novoTokenRetirada
      });

      res.json({ message: 'Confirmação de compra registrada com sucesso.', bag });

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
        where: { id: bagId, status: 'EM_ROTA_DEVOLUCAO' }, // Ajustar conforme fluxo real
        include: [{ model: BagItem, as: 'itens' }]
      });

      if (!bag || !bag.itens || bag.itens.length === 0) {
        return res.status(404).json({ message: 'Mala não encontrada, vazia, ou você não tem permissão para acessá-la.' });
      }

      let valor_total = 0;
      const stockUpdates = [];

      for (const item of bag.itens) {
        if (item.status_item === 'comprado') {
          valor_total += parseFloat(item.preco_unitario_mala);
        } else if (item.status_item === 'devolvido') {
          stockUpdates.push(
            ProductVariation.increment(
              { quantidade_estoque: item.quantidade_solicitada },
              { where: { id: item.variacao_produto_id }, transaction: t }
            )
          );
        }
      }

      await Promise.all(stockUpdates);

      // Pagamento
      if (valor_total > 0) {
        await Transaction.create({ /* ... dados da transação ... */ }, { transaction: t });
      }

      await bag.update({ status: 'FINALIZADA' }, { transaction: t });
      await t.commit();

      res.json({ message: 'Devolução confirmada com sucesso. A mala foi finalizada.' });

    } catch (error) {
      await t.rollback();
      console.error('Erro ao confirmar devolução:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async acceptDelivery(req, res) {
    const t = await sequelize.transaction();
    try {
      const { bagId } = req.params;
      const entregadorId = req.user.userId;

      // Verifica se a mala ainda está disponível
      const bag = await Bag.findOne({
        where: { id: bagId, status: 'AGUARDANDO_MOTO' },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!bag) {
        await t.rollback();
        return res.status(409).json({ message: 'Esta entrega já foi aceita por outro parceiro.' })
      }

      await bag.update({
        status: 'EM_ROTA_ENTREGA',
        entregador_id: entregadorId
      }, { transaction: t });

      await t.commit();

      // Avisa o lojista via Socket que alguém aceitou a entrega
      req.io.to(bag.lojista_id).emit('ENTREGA_ACEITA', { entregadorId });

      return res.json({ message: 'Entrega aceita! Dirija-se à loja.', bag });
    } catch (error) {
      await t.rollback();
      console.error(error);
      return res.status(500).json({ error: 'Erro ao aceitar entrega.' });
    }
  },

  async confirmPickup(req, res) {
    try {
      const { bagId } = req.params;
      const { token } = req.body;
      const entregadorId = req.user.userId;

      const bag = await Bag.findByPk(bagId);

      if (!bag) {
        return res.status(404).json({ message: 'Mala não encontrada.' });
      }

      // Verificações de segurança
      if (bag.entregador_id !== entregadorId) {
        return res.status(403).json({ message: 'Você não é o entregador desta mala.' });
      }

      if (bag.token_retirada !== token) {
        return res.status(401).json({ message: 'Token de retirada inválido.' });
      }

      // Atualiza a data de retirada para marcar que a primeira fase (ir buscar) terminou
      await bag.update({
        data_retirada: new Date(),
      });

      // TODO: Avisar cliente via Socket que o entregador retirou a mala e está a camihno
      if (req.io) {
        req.io.to(`bag_${bagId}`).emit('STATUS_UPDATED', {
          status: 'EM_ROTA_ENTREGA',
          step: 'INDO_AO_CLIENTE'
        });
      }

      return res.json({ message: 'Retirada confirmada! Inicie a viagem para o cliente.', bag });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao confirmar retirada.' });
    }
  },

  async confirmDelivery(req, res) {
    const t = await sequelize.transaction();
    try {
      const { bagId } = req.params;
      const { token } = req.body;
      const entregadorId = req.user.userId;

      const bag = await Bag.findByPk(bagId);

      if (!bag) {
        await t.rollback();
        return res.status(404).json({ message: 'Mala não encontrada.' });
      }

      if (bag.entregador_id !== entregadorId) {
        await t.rollback();
        return res.status(403).json({ message: 'Você não é o entregador responsável por esta mala.' });
      }

      if (bag.token_entrega !== token) {
        await t.rollback();
        return res.status(401).json({ message: 'Token de entrega incorreto.' });
      }

      await bag.update({
        status: 'ENTREGUE',

      }, { transaction: t });

      await t.commit();

      // Notifica o lojista e o cliente via socket
      if (req.io) {
        req.io.to(`bag_${bagId}`).emit('STATUS_UPDATED', { status: 'ENTREGUE' });
        req.io.to(`store_${bag.lojista_id}`).emit('STATUS_UPDATED', { status: 'ENTREGUE' });
      }

      return res.json({ message: 'Entrega finalizada com sucesso! Bom trabalho.', bag });
    } catch (error) {
      await t.rollback();
      console.error(error);
      return res.status(500).json({ error: 'Erro ao confirmar entrega.' });
    }
  },

  async getClientBags(req, res) {
    try {
      const cliente_id = req.user.userId;

      const bags = await Bag.findAll({
        where: { cliente_id },
        
        include: [
          {
            model: BagItem,
            as: 'itens',
            include: [{
              model: ProductVariation,
              as: 'variacao_produto',
              include: [{ model: Product, as: 'produto', attributes: ['nome'] }]
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return res.json(bags);
    } catch (error) {
      console.error('Erro ao buscar malas do cliente:', error);
      return res.status(500).json({ error: 'Erro ao buscar histórico de pedidos.' });
    }
  },
}

module.exports = bagController;