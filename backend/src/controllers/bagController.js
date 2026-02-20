const { Bag, BagItem, Product, ProductVariation, ProductImage, User, Address, sequelize } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');
const transactionController = require('./transactionController');

const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString();

const createBagSchema = Joi.object({
  observacoes: Joi.string().allow('').optional(),
  tipo: Joi.string().uppercase().valid('FECHADA', 'ABERTA').default('FECHADA'),
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

const addExtraItemSchema = Joi.object({
  variacao_produto_id: Joi.string().uuid().required(),
  quantidade: Joi.number().integer().positive().default(1)
});

const bagController = {
  async createBagRequest(req, res) {
    const t = await sequelize.transaction();
    try {
      const { error, value } = createBagSchema.validate(req.body, { stripUnknown: true });
      if (error) {
        return res.status(400).json({ message: 'Dados de entrada inválidos', details: error.details });
      }

      const { itens, observacoes, tipo } = value;
      const cliente_id = req.user.userId;

      const primeiraVariacao = await ProductVariation.findByPk(itens[0].variacao_produto_id, {
        include: { model: Product, as: 'produto' }
      });

      if (!primeiraVariacao || !primeiraVariacao.produto) {
        throw new Error('Produto não encontrado para identificar a loja.');
      }

      const lojista_id = primeiraVariacao.produto.lojista_id;

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
        lojista_id,
        endereco_entrega_id: usuario.endereco_id,
        observacoes,
        tipo,
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
          status_item: 'INCLUIDO'
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
        where: { lojista_id, status: ['SOLICITADA', 'PREPARANDO', 'AGUARDANDO_MOTO', 'MOTO_A_CAMINHO_LOJA', 'EM_ROTA_ENTREGA', 'ENTREGUE', 'AGUARDANDO_MOTO_DEVOLUCAO', 'MOTO_A_CAMINHO_COLETA', 'EM_ROTA_DEVOLUCAO', 'FINALIZADA', 'CONCLUIDA'] },
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

    const t = await sequelize.transaction();

    try {
      const bag = await Bag.findByPk(bagId, { transaction: t });
      if (!bag) {
        await t.rollback();
        return res.status(404).json({ message: 'Mala não encontrada' });
      }

      if (action === 'RECUSAR') {
        if (!motivo) {
          await t.rollback();
          return res.status(400).json({ message: 'Motivo é obrigatório ao recusar.' });
        }

        await bag.update({
          status: 'RECUSADA',
          motivo_recusa: motivo
        }, { transaction: t });

        await t.commit();
        return res.json({ message: 'Pedido recusado.', bag });
      }

      if (action === 'ACEITAR') {
        try {
          await transactionController.authorizePayment(bag, bag.cliente_id, t);

          const tokenRetirada = generateToken();
          const tokenEntrega = generateToken();

          await bag.update({
            status: 'PREPARANDO',
            token_retirada: tokenRetirada,
            token_entrega: tokenEntrega
          }, { transaction: t });

          await t.commit();

          return res.json({
            message: 'Pagamento autorizado e pedido aceito. Inicie o preparo',
            tokens: { retirada: tokenRetirada }
          });

        } catch (payError) {
          await t.rollback();
          return res.status(402).json({
            message: 'Pagamento recusado: O cliente não possui saldo ou o cartão é inválido.',
            details: payError.message
          });
        }
      }
    } catch (error) {
      if (t) await t.rollback();
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

      const tokenDevolucaoCliente = Math.floor(100000 + Math.random() * 900000).toString();
      const tokenRecebimentoLoja = Math.floor(100000 + Math.random() * 900000).toString();

      await bag.update({
        status: 'AGUARDANDO_MOTO_DEVOLUCAO',
        token_devolucao: tokenDevolucaoCliente,
        token_retirada: tokenRecebimentoLoja,
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
          tokenDevolucao: tokenDevolucaoCliente
        });
      }

      return res.json({
        message: 'Compra confirmada! Um entregador virá buscar a mala.',
        valorTotal: valorFinal,
        tokenDevolucao: tokenDevolucaoCliente
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
        if (item.status_item === 'COMPRADO') {
          valor_total += parseFloat(item.preco_unitario_mala);
        } else if (item.status_item === 'DEVOLVIDO') {
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
        where: { id: bagId, status: { [Op.in]: ['AGUARDANDO_MOTO', 'AGUARDANDO_MOTO_DEVOLUCAO'] } },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!bag) {
        await t.rollback();
        return res.status(409).json({ message: 'Esta entrega já foi aceita por outro parceiro.' })
      }

      const isReturn = bag.status === 'AGUARDANDO_MOTO_DEVOLUCAO';

      const novoStatus = isReturn ? 'MOTO_A_CAMINHO_COLETA' : 'MOTO_A_CAMINHO_LOJA';

      await bag.update({
        status: novoStatus,
        entregador_id: entregadorId
      }, { transaction: t });

      await t.commit();

      const responseData = bag.toJSON();

      delete responseData.token_retirada;
      delete responseData.token_entrega;
      delete responseData.token_devolucao;

      req.io.to(bag.lojista_id).emit('ENTREGA_ACEITA', {
        bagId: bag.id,
        entregadorId,
        tipo: isReturn ? 'COLETA' : 'ENTREGA'
      });

      if (isReturn) {
        req.io.to(bag.cliente_id).emit('MOTOBOY_A_CAMINHO', {
          message: 'Um entregador aceitou sua coleta e está a caminho!'
        });
      }

      return res.json({ message: 'Entrega aceita! Dirija-se à loja.', bag: responseData });
    } catch (error) {
      if (t) await t.rollback();
      console.error("ERRO AO ACEITAR CORRIDA:", error);
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

      let isTokenValid = false;
      let novoStatus = '';

      if (bag.status === 'MOTO_A_CAMINHO_LOJA') {
        isTokenValid = (bag.token_retirada === token);
        novoStatus = 'EM_ROTA_ENTREGA';
      }
      else if (bag.status === 'MOTO_A_CAMINHO_COLETA') {
        isTokenValid = (bag.token_devolucao = token);
        novoStatus = 'EM_ROTA_DEVOLUCAO';
      }

      if (!isTokenValid) {
        return res.status(400).json({ message: 'Token inválido!' });
      }

      await bag.update({
        data_retirada: new Date(),
        status: novoStatus
      });

      // TODO: Avisar cliente via Socket que o entregador retirou a mala e está a camihno
      if (req.io) {
        req.io.to(`bag_${bagId}`).emit('STATUS_UPDATED', {
          status: 'EM_ROTA_ENTREGA',
          step: 'INDO_AO_CLIENTE'
        });
      }

      const responseData = bag.toJSON();

      delete responseData.token_retirada;
      delete responseData.token_entrega;
      delete responseData.token_devolucao;

      return res.json({ message: 'Retirada confirmada! Inicie a viagem para o cliente.', bag: responseData });
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

      let isTokenValid = false;
      let novoStatus = '';

      if (bag.status === 'EM_ROTA_ENTREGA') {
        isTokenValid = (bag.token_entrega === token);
        novoStatus = 'ENTREGUE';
      }
      else if (bag.status === 'EM_ROTA_DEVOLUCAO') {
        isTokenValid = (bag.token_retirada === token);
        novoStatus = 'FINALIZADA';
      }
      else {
        await t.rollback();
        return res.status(400).json({ message: 'Esta mala não está em trajeto de entrega ou devolução.' });
      }

      if (!isTokenValid) {
        await t.rollback();
        return res.status(400).json({ message: 'Código de confirmação incorreto!' });
      }

      await bag.update({
        status: novoStatus,
        data_finalizacao: novoStatus === 'FINALIZADA' ? new Date() : bag.data_finalizacao
      }, { transaction: t });

      await t.commit();

      if (req.io) {
        req.io.to(`bag_${bagId}`).emit('STATUS_UPDATED', { status: novoStatus });
        req.io.to(`store_${bag.lojista_id}`).emit('STATUS_UPDATED', { status: novoStatus });
      }

      return res.json({
        message: novoStatus === 'FINALIZADA' ? 'Mala devolvida com sucesso!' : 'Entrega concluída!',
        status: novoStatus
      });
    } catch (error) {
      if (t) await t.rollback();
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
      const userType = req.user.tipo_usuario;

      const bag = await Bag.findByPk(bagId, {
        include: [
          { model: User, as: 'cliente', attributes: ['id', 'nome', 'email', 'telefone'] },
          { model: Address, as: 'endereco_entrega' },
          { model: User, as: 'entregador', attributes: ['id', 'nome', 'veiculo'] },
          { model: User, as: 'lojista', attributes: ['id', 'nome'] },
          {
            model: BagItem,
            as: 'itens',
            attributes: [
              'id',
              'mala_id',
              'variacao_produto_id',
              'quantidade_solicitada',
              'quantidade_incluida',
              'status_item',
              'preco_unitario_mala',
              'is_extra'
            ],
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

      const bagData = bag.toJSON();

      if (userType === 'lojista') {
        delete bagData.token_entrega;
        delete bagData.token_devolucao;
      } else if (userType === 'cliente') {
        delete bagData.token_retirada;
      } else if (userType === 'entregador') {
        delete bagData.token_entrega;
        delete bagData.token_devolucao;
        delete bagData.token_retirada;
      }

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
        where: { status: { [Op.in]: ['AGUARDANDO_MOTO', 'AGUARDANDO_MOTO_DEVOLUCAO'] } },
        include: [
          { model: Address, as: 'endereco_entrega' },
          { model: User, as: 'cliente', attributes: ['nome', 'telefone'] },
          { model: User, as: 'lojista', attributes: ['nome'] }
        ],
        order: [['data_solicitacao', 'DESC']],
        logging: console.log
      });

      console.log(`Resultado: ${deliveries.length} entregas encontradas.`);

      const formatted = deliveries.map(delivery => {
        const isReturn = delivery.status === 'AGUARDANDO_MOTO_DEVOLUCAO';

        const enderecoCliente = delivery.endereco_entrega
          ? `${delivery.endereco_entrega.rua}, ${delivery.endereco_entrega.numero} - ${delivery.endereco_entrega.bairro}`
          : 'Endereço não cadastrado!';

        if (!delivery.endereco_entrega) {
          console.log(`Alerta: Mala ID ${delivery.id} sem endereço.`);
        }

        return {
          bagId: delivery.id,
          tipo: isReturn ? 'COLETA' : 'ENTREGA',

          origem: isReturn ? enderecoCliente : `Loja: ${delivery.lojista?.nome || 'FashionHub Central'}`,
          destino: isReturn ? `Loja: ${delivery.lojista?.nome || 'FashionHub Central'}` : {
            rua: delivery.endereco_entrega?.rua || 'Rua não informada',
            numero: delivery.endereco_entrega?.numero || 'N/A',
            bairro: delivery.endereco_entrega?.bairro || 'Bairro não informado',
            cidade: delivery.endereco_entrega?.cidade || 'Cidade não informada',
            estado: delivery.endereco_entrega?.estado || 'Estado não informado',
          },
          valorFrete: Number(delivery.valor_frete) || 15.00,
          distancia: delivery.distancia_estimada || "Calculando...",
          clienteNome: delivery.cliente?.nome || 'Cliente',
          clienteTelefone: delivery.cliente?.telefone || 'Telefone não disponível',
          statusOriginal: delivery.status
        };
      });
      return res.json(formatted);
    } catch (error) {
      console.error("ERRO CRÍTICO NO BACKEND:", error);
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

  async getPending(req, res) {
    try {
      const bags = await Bag.findAll({
        where: {
          lojista_id: req.user.loja_id,
          status: ['SOLICITADA', 'PREPARANDO', 'AGUARDANDO_MOTO']
        },
        order: [['data_solicitacao', 'DESC']],
        include: [{ model: User, as: 'cliente', attributes: ['nome'] }]
      });

      return res.json(bags);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar malas pendentes.' });
    }
  },

  async getStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [total, pending] = await Promise.all([
        Bag.count({
          where: {
            lojista_id: req.user.loja_id,
            data_solicitacao: { [Op.gte]: today }
          }
        }),
        Bag.count({
          where: {
            lojista_id: req.user.loja_id,
            status: 'SOLICITADA'
          }
        })
      ]);

      return res.json({ total, pending });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  },

  async addExtraItem(req, res) {
    try {
      const { bagId } = req.params;
      const { error, value } = addExtraItemSchema.validate(req.body);

      if (error) return res.status(400).json({ message: 'Dados inválidos', details: error.details });

      const lojista_id = req.user.loja_id || req.user.userId;

      const bag = await Bag.findOne({
        where: {
          id: bagId,
          lojista_id,
          status: 'PREPARANDO'
        }
      });

      if (!bag) {
        return res.status(404).json({ message: 'Mala não encontrada ou não está em fase de preparo.' });
      }

      const variation = await ProductVariation.findByPk(value.variacao_produto_id, {
        include: [{ model: Product, as: 'produto' }]
      });

      if (!variation) return res.status(404).json({ message: 'Produto não encontrado.' });

      const extraItem = await BagItem.create({
        mala_id: bag.id,
        variacao_produto_id: value.variacao_produto_id,
        quantidade_solicitada: value.quantidade,
        preco_unitario_mala: variation.produto.preco,
        status_item: 'INCLUIDO',
        is_extra: true
      });

      if (bag.tipo === 'FECHADA') {
        await bag.update({ tipo: 'ABERTA' });
      }

      return res.json({
        message: 'Item extra adicionado!',
        item: extraItem
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao adicionar item extra.' });
    }
  },

  async finalizeAudit(req, res) {
    const t = await sequelize.transaction();
    try {
      const { bagId } = req.params;
      const lojista_id = req.user.userId;

      const bag = await Bag.findOne({
        where: { id: bagId, lojista_id, status: 'FINALIZADA' },
        include: ['itens'],
        transaction: t
      });

      if (!bag) {
        await t.rollback();
        return res.status(404).json({ message: 'Mala não encontrada para conferência.' });
      }

      try {
        await transactionController.captureFinalPayment(bag, t);
      } catch (paymentError) {
        await t.rollback();
        return res.status(402).json({
          message: 'Falha ao processar o pagamento final da mala.',
          details: paymentError.message
        });
      }

      await bag.update({ status: 'CONCLUIDA', data_conclusao: new Date() }, { transaction: t });

      for (const item of bag.itens) {
        if (item.status_item === 'DEVOLVIDO') {
          await ProductVariation.increment('quantidade_estoque', {
            by: 1,
            where: { id: item.variacao_produto_id },
            transaction: t
          });
        }
      }

      await t.commit();
      return res.json({ message: 'Mala conferida e estoque atualizado!' });
    } catch (error) {
      if (t) await t.rollback();
      console.error('Erro no finalize-audit:', error)
      res.status(500).json({ error: 'Erro ao finalizar conferência.' });
    }
  },
};
module.exports = bagController;