const { User, Address, Lojista } = require('../models');
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
      const { nome, email, endereco, senha_atual, nova_senha } = req.body;

      if (req.user.userId !== id) {
        return res.status(403).json({ message: 'Acesso negado.' });
      }

      const user = await User.scope('withPassword').findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado. '});
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

      if (!veiculo || !placa) {
        return res.status(400).json({ message: 'Dados do veículo são obrigatórios' });
      }

      user.tipo_usuario = 'entregador';

      await user.save();

      return res.json({
        message: 'Você agora é um entregador!',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo_usuario: 'entregador'
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

      const lojista = await Lojista.findByPk(req.userId);

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
};

module.exports = userController;