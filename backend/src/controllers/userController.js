const { User, Address, Lojista, sequelize } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const userController = {
  async getCurrentUserProfile(req, res) {
    try {
      const userId = req.user.userId;

      const user = await User.findByPk(userId, {
        include: [{ model: Address, as: 'endereco' }], attributes: { exclude: ['senha_hash'] }
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        include: [{ model: Address, as: 'endereco' }]
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, endereco, senha_atual, nova_senha, veiculo, placa, cnh } = req.body;

      if (req.user.userId !== id) {
        return res.status(403).json({ message: 'Acesso negado.' });
      }

      const user = await User.scope('withPassword').findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado. ' });
      }

      if (nova_senha) {
        if (!senha_atual) {
          return res.status(400).json({ message: 'Para alterar a senha, informe sua senha atual' });
        }

        const isPasswordValid = await user.checkPassword(senha_atual);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Senha atual incorreta.' });
        }

        user.senha_hash = nova_senha;
      }

      user.nome = nome || user.nome;
      user.email = email || user.email;

      user.veiculo = veiculo || user.veiculo;
      user.placa = placa || user.placa;
      user.cnh = cnh || user.cnh;

      if (endereco) {
        if (user.endereco_id) {
          const addr = await Address.findByPk(user.endereco_id);
          if (addr) await addr.update(endereco);
        } else {
          const newAddr = await Address.create(endereco);
          user.endereco_id = newAddr.id;
        }
      }

      await user.save();

      const userFinal = await User.findByPk(id, {
        include: [{ model: Address, as: 'endereco' }]
      });

      return res.json({
        message: 'Perfil atualizado com sucesso!',
        user: userFinal
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Este e-mail já está em uso.' });
      }

      res.status(500).json({ message: 'Erro interno do servidor ao atualizar perfil.' });
    }
  },

  async becomeCourier(req, res) {
    const userId = req.user.userId;
    const { veiculo, placa, cnh } = req.body;

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (user.tipo_usuario !== 'cliente') {
        return res.status(400).json({
          message: `Um usuário do tipo ${user.tipo_usuario} não pode se tornar entregador.`
        });
      }

      if (!veiculo || !placa || !cnh) {
        return res.status(400).json({ message: 'Dados do veículo são obrigatórios' });
      }

      user.tipo_usuario = 'entregador';
      user.veiculo = veiculo;
      user.placa = placa;
      user.cnh = cnh;

      await user.save();

      const newToken = jwt.sign(
        { userId: user.id, tipo_usuario: 'entregador' },
        proccess.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Você agora é um entregador!',
        token: newToken,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo_usuario: 'entregador',
          veiculo: user.veiculo,
          placa: user.placa,
          cnh: user.cnh
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao processar solicitação.' });
    }
  },

  async updateStoreProfile(req, res) {
    try {
      const { nome_loja, descricao } = req.body;

      if (!nome_loja) {
        return res.status(400).json({ error: 'O nome da loja é obrigatório.' });
      }

      const lojista = await Lojista.findByPk(req.user.userId);

      if (!lojista) {
        return res.status(404).json({ error: 'Perfil de lojista não encontrado.' });
      }

      await lojista.update({
        nome_loja,
        descricao
      });

      return res.json({
        message: 'Perfil da loja atualizado!',
        lojista: {
          nome_loja: lojista.nome_loja,
          descricao: lojista.descricao,
          cnpj: lojista.cnpj
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar o perfil da sua loja:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar perfil da sua loja.' });
    }
  },

  async updateResponsibleData(req, res) {
    try {
      const { nome, email, telefone } = req.body;

      if (email) {
        const emailExists = await User.findOne({
          where: {
            email,
            id: { [Op.ne]: req.user.userId }
          }
        });
        if (emailExists) {
          return res.status(400).json({ message: 'Este e-mail já está em uso!' });
        }
      }

      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      await user.update({
        nome,
        email,
        telefone
      });

      return res.json({ message: 'Dados atualizados!' });
    } catch (error) {
      console.error('Erro ao atualizar responsável:', error);
      return res.status(500).json({ message: 'Erro interno ao atualizar dados.' });
    }
  },

  async updateStoreAddress(req, res) {
    const t = await sequelize.transaction();
    try {
      const { cep, rua, numero, bairro, cidade, estado } = req.body;

      const lojista = await Lojista.findByPk(req.user.userId, { transaction: t });
      if (!lojista) {
        await t.rollback();
        return res.status(404).json({ error: 'Perfil de lojista não encontrado.' });
      }

      const user = await User.findByPk(req.user.userId, { transaction: t });

      if (user && user.endereco_id) {
        const address = await Address.findByPk(user.endereco_id, { transaction: t });
        if (address) {
          await address.update({ cep, rua, numero, bairro, cidade, estado }, { transaction: t });
        }
      }

      await lojista.update({
        cep,
        rua,
        numero,
        bairro,
        cidade,
        estado
      }, { transaction: t });

      await t.commit();

      const userAtualizado = await User.findByPk(req.user.userId, {
        include: [
          { model: Address, as: 'endereco' },
          { model: Lojista, as: 'lojista' }
        ]
      });

      const userResponse = userAtualizado.get({ plain: true });
      if (userResponse.lojista) {
        userResponse.nome_loja = userResponse.lojista.nome_loja;
        userResponse.cnpj = userResponse.lojista.cnpj;
        userResponse.cep = userResponse.lojista.cep;
        userResponse.rua = userResponse.lojista.rua;
        userResponse.numero = userResponse.lojista.numero;
        userResponse.bairro = userResponse.lojista.bairro;
        userResponse.cidade = userResponse.lojista.cidade;
        userResponse.estado = userResponse.lojista.estado;
        delete userResponse.lojista;
      }

      return res.json({ message: 'Endereço atualizado!', user: userResponse });
    } catch (error) {
      if (t) await t.rollback();
      console.error('Erro ao atualizar endereço:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar endereço.' });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.scope('withPassword').findByPk(req.user.userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      const isMatch = await user.checkPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'A senha atual está incorreta.' });
      }

      user.senha_hash = newPassword;
      await user.save();

      return res.json({ message: 'Senha alterada!' });
    } catch (error) {
      console.error('Erro ao mudar senha:', error);
      return res.status(500).json({ message: 'Erro interno ao processar a alteração.' });
    }
  },
};

module.exports = userController;