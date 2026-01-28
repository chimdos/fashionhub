const { Bag, BagItem, Product, ProductVariation, ProductImage, User, Address, sequelize } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString();

const createBagSchema = Joi.object({
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

const storeActionSchema = Joi.object({
  action: Joi.string()
    .uppercase()
    .valid('ACEITAR', 'RECUSAR')
    .required(),
  motivo: Joi.string().allow('').optional()
});

const bagController = {
  async createBagRequest(req, res) {
    const t = await sequelize.transaction();
    try {
      const { error, value } = createBagSchema.validate(req.body, { stripUnknown: true });
      if (error) {
        return res.status(400).json({ message: 'Dados de entrada inválidos', details: error.details });
      }

      const { itens, observacoes } = value;
      const cliente_id = req.user.userId;

      const usuario = await User.findByPk(cliente_id);

      if (!usuario || !usuario.endereco_id) {
        await t.rollback();
        return res.status(400).json({ message: 'Cadastre um endereço para solicitar malas' });
      }

      if (req.user.tipo_usuario !== 'cliente') {
        return res.status(403).json({ message: 'Apenas clientes podem solicitar malas' });
      }

      const newBag = await Bag.create({
        cliente_id,
        endereco_entrega_id: usuario.endereco_id,
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

  async getStoreBagRequests(req, res) {
    try {
      const lojista_id = req.user.userId;

      const bags = await Bag.findAll({
        where: { status: ['SOLICITADA', 'PREPARANDO', 'AGUARDANDO_MOTO', 'EM_ROTA_ENTREGA'] },
        include: [
          { model: User, as: 'cliente', attributes: ['id', 'nome', 'email', 'telefone'] },
          { model: Address, as: 'endereco_entrega' },
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
                attributes: ['id', 'nome'],
                include: [{
                  model: ProductImage,
                  as: 'imagens',
                  attributes: ['url_imagem'],
                  limit: 1
                }]
              }]
            }]
          }
        ],
        order: [['data_solicitacao', 'DESC']],
      });

      const filteredBags = bags.filter(bag => bag.itens.length > 0);

      res.json(filteredBags);

      /*const simplifiedBags = bags.map(bag => ({
        id: bag.id,
        status: bag.status,
        data_solicitacao: bag.data_solicitacao,
        cliente: bag.cliente,
        itemCount: bag.itens.length,
      }));

      res.json(simplifiedBags);*/

    } catch (error) {
      console.error('ERRO REAL NAS MALAS:', error);
      res.status(500).json({
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  },

  async updateStatusByStore(req, res) {
    const { bagId } = req.params;

    const { error, value } = storeActionSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Entrada inválida', details: error.details });

    const { action, motivo } = value;

    try {
      const bag = await Bag.findByPk(bagId);
      if (!bag) return res.status(404).json({ message: 'Mala não encontrada' });

      if (action === 'RECUSAR') {
        if (!motivo) return res.status(400).json({ message: 'Motivo é obrigatório ao recusar.' });

        await bag.update({
          status: 'RECUSADA',
          motivo_recusa: motivo
        });

        // TODO: Notificar cliente (push notification)
        return res.json({ message: 'Pedido recusado.', bag });
      }

      if (action === 'ACEITAR') {
        const tokenRetirada = generateToken();
        const tokenEntrega = generateToken();

        await bag.update({
          status: 'PREPARANDO',
          token_retirada: tokenRetirada,
          token_entrega: tokenEntrega
        });

        // TODO: Notificar cliente ("Sua mala já está sendo preparada")
        return res.json({
          message: 'Pedido aceito. Inicie o preparo',
          tokens: { retirada: tokenRetirada }
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao processar ação do lojista.' });
    }
  },

  async requestCourier(req, res) {
    const { bagId } = req.params;

    try {
      const bag = await Bag.findByPk(bagId, {
        include: [
          { model: Address, as: 'endereco_entrega' }
        ]
      });

      if (!bag) return res.status(404).json({ message: 'Mala não encontrada.' });

      if (bag.status !== 'PREPARANDO') {
        return res.status(400).json({ message: 'A mala precisa estar no status PREPARANDO para chamar motoboy.' });
      }

      await bag.update({ status: 'AGUARDANDO_MOTO' });

      if (req.io) {
        req.io.emit('NOVA_ENTREGA_DISPONIVEL', {
          bagId: bag.id,
          origem: "Endereço da Loja A",
          destino: bag.endereco_entrega,
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

  async confirmPurchase(req, res) {
    const t = await sequelize.transaction();
    try {
      let valorFinal = 0;
      const { bagId } = req.params;
      const { error, value } = confirmPurchaseSchema.validate(req.body, { stripUnknown: true });

      if (error) {
        return res.status(400).json({ message: 'Dados inválidos', details: error.details });
      }

      const { itens_comprados } = value;
      const clienteId = req.user.userId;

      const bag = await Bag.findOne({
        where: { id: bagId, cliente_id: req.user.userId, status: 'ENTREGUE' },
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

      const tokenDevolucao = Math.floor(100000 + Math.random() * 900000).toString();

      await bag.update({
        status: 'AGUARDANDO_MOTO_DEVOLUCAO',
        token_retirada: tokenDevolucao,
        entregador_id: null,
        data_entrega_cliente: bag.data_entrega_cliente,
        data_retirada: null
      }, { transaction: t });

      await t.commit();

      if (req.io) {
        req.io.emit('NOVA_ENTREGA_DISPONIVEL', {
          bagId: bag.id,
          tipo: 'DEVOLUCAO',
          origem: "Casa do Cliente",
          destino: "Loja Tal",
          valorFrete: 12.00,
          tokenDevolucao: tokenDevolucao
        });
      }

      return res.json({
        message: 'Compra confirmada! Um entregador virá buscar a mala.',
        valorTotal: valorFinal,
        tokenDevolucao: tokenDevolucao
      });

    } catch (error) {
      await t.rollback();
      console.error('Erro ao confirmar compra:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

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
        status: 'AGUARDANDO_MOTO',
        entregador_id: entregadorId
      }, { transaction: t });

      await t.commit();

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

      if (bag.entregador_id !== entregadorId) {
        return res.status(403).json({ message: 'Você não é o entregador desta mala.' });
      }

      if (bag.token_retirada !== token) {
        return res.status(401).json({ message: 'Token de retirada inválido.' });
      }

      await bag.update({
        data_retirada: new Date(),
        status: 'EM_ROTA_ENTREGA'
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
              include: [{
                model: Product,
                as: 'produto',
                attributes: ['id', 'nome', 'descricao', 'preco'],
                include: [{
                  model: ProductImage,
                  as: 'imagens',
                  attributes: ['url_imagem'],
                  limit: 1
                }]
              }]
            }]
          }
        ],
        order: [['data_solicitacao', 'DESC']]
      });

      return res.json(bags);
    } catch (error) {
      console.error('Erro ao buscar malas do cliente:', error);
      return res.status(500).json({ error: 'Erro ao buscar histórico de pedidos.' });
    }
  },

  async getBagById(req, res) {
    try {
      const { bagId } = req.params;
      const bag = await Bag.findByPk(bagId, {
        include: [
          { model: User, as: 'cliente', attributes: ['id', 'nome', 'email', 'telefone'] },
          { model: Address, as: 'endereco_entrega' },
          { model: User, as: 'entregador', attributes: ['id', 'nome', 'veiculo'] },
          { model: User, as: 'lojista', attributes: ['id', 'nome'] },
          {
            model: BagItem,
            as: 'itens',
            include: [{
              model: ProductVariation,
              as: 'variacao_produto',
              include: [{
                model: Product,
                as: 'produto',
                attributes: ['id', 'nome', 'descricao', 'preco'],
                include: [{
                  model: ProductImage,
                  as: 'imagens',
                  attributes: ['url_imagem'],
                  limit: 1
                }]
              }]
            }]
          }
        ]
      });

      if (!bag) return res.status(404).json({ message: 'Mala não encontrada.' });

      if (bag.cliente_id !== req.user.userId && req.user.tipo_usuario !== 'lojista') {
        return res.status(403).json({ message: 'Você não tem permissão para acessar esta mala.' });
      }
      return res.json(bag);
    } catch (error) {
      console.error('Erro ao buscar mala por ID:', error);
      return res.status(500).json({ error: 'Erro ao buscar mala.' });
    }
  },

  async getAvailableDeliveries(req, res) {
    try {
      console.log("--- NOVA BUSCA DE ENTREGAS ---");

      const deliveries = await Bag.findAll({
        where: { status: 'AGUARDANDO_MOTO' },
        include: [
          { model: Address, as: 'endereco_entrega' },
          { model: User, as: 'cliente', attributes: ['nome', 'telefone'] }
        ],
        order: [['data_solicitacao', 'DESC']],
        logging: console.log
      });

      console.log(`Resultado: ${deliveries.length} entregas encontradas.`);

      const formatted = deliveries.map(delivery => {
        if (!delivery.endereco_entrega) {
          console.log(`⚠️ Alerta: Mala ID ${delivery.id} sem endereço.`);
        }

        return {
          bagId: delivery.id,
          origem: "Endereço da Loja A",
          destino: {
            rua: delivery.endereco_entrega?.rua || 'Rua não informada',
            numero: delivery.endereco_entrega?.numero || 'N/A',
            bairro: delivery.endereco_entrega?.bairro || 'Bairro não informado',
            cidade: delivery.endereco_entrega?.cidade || 'Cidade não informada',
            estado: delivery.endereco_entrega?.estado || 'Estado não informado',
          },
          valorFrete: Number(delivery.valor_frete) || 15.00,
          distancia: "3.5 km",
          clienteNome: delivery.cliente?.nome || 'Cliente',
          clienteTelefone: delivery.cliente?.telefone || 'Telefone não disponível'
        };
      });

      return res.json(formatted);

    } catch (error) {
      console.error("❌ ERRO CRÍTICO NO BACKEND:", error);
      return res.status(500).json({
        message: 'Erro interno no servidor',
        error: error.message
      });
    }
  },

  async getActiveDeliveries(req, res) {
    try {
      const entregadorId = req.user.userId;

      const activeBags = await Bag.findAll({
        where: { entregador_id: entregadorId, status: { [Op.in]: ['AGUARDANDO_MOTO', 'EM_ROTA_ENTREGA', 'ENTREGUE', 'EM_ROTA_DEVOLUCAO'] } },
        include: [
          {
            model: User,
            as: 'lojista',
            attributes: ['nome', 'endereco_id'],
            include: [{ model: Address, as: 'endereco' }]
          },
          { model: Address, as: 'endereco_entrega' }
        ],
        order: [['data_solicitacao', 'DESC']]
      });

      const formattedBags = activeBags.map(bag => ({
        bagId: bag.id,
        origem: bag.lojista?.nome || 'Loja Parceira',
        enderecoColeta: bag.lojista?.endereco ? {
          rua: bag.lojista.endereco.rua,
          numero: bag.lojista.endereco.numero,
          bairro: bag.lojista.endereco.bairro
        } : null,
        destino: {
          rua: bag.endereco_entrega?.rua,
          numero: bag.endereco_entrega?.numero,
          bairro: bag.endereco_entrega?.bairro,
        },
        valorFrete: bag.valor_frete,
        distancia: bag.distancia_estimada || '--- km',
        status: bag.status,
      }));

      return res.json(formattedBags);
    } catch (error) {
      console.error('Erro ao buscar entregas ativas:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar suas entregas.' });
    }
  },

  async finalizeSelection(req, res) {
    try {
      const { bagId } = req.params;
      const { itens_comprados } = req.body;

      const tokenDevolucao = Math.floor(100000 + Math.random() * 900000).toString();

      const bag = await Bag.findByPk(bagId);
      await bag.update({
        status: 'AGUARDANDO_MOTO_DEVOLUCAO',
        token_devolucao: tokenDevolucao,
      });

      return res.json({
        message: 'Coleta solicitada!',
        tokenDevolucao
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao processar devolução!' });
    }
  },

  async getActiveWithClient(req, res) {
    try {
      const userId = req.user.userId;

      const bag = await Bag.findOne({
        where: {
          cliente_id: userId,
          status: {
            [Op.in]: ['ENTREGUE', 'AGUARDANDO_MOTO_DEVOLUCAO', 'EM_ROTA_DEVOLUCAO']
          }
        },
        include: [
          {
            model: BagItem,
            as: 'itens',
            include: [{
              model: ProductVariation,
              as: 'variacao_produto',
              include: [{
                model: Product,
                as: 'produto',
                include: [{ model: ProductImage, as: 'imagens', limit: 1 }]
              }]
            }]
          }
        ],
        order: [['data_solicitacao', 'DESC']]
      });

      if (!bag) return res.json(null);

      return res.json(bag);
    } catch (error) {
      console.error('Erro ao buscar mala ativa:', error);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  },
};
module.exports = bagController;