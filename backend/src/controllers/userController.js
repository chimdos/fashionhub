const { User, Address } = require('../models');

exports.becomeCourier = async (req, res) => {
  const userId = req.user.userId;
  const { veiculo, placa, cnh } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Validação de CNH, Placa, etc.
    if (!veiculo || !placa) {
      return res.status(400).json({ message: 'Dados do veículo são obrigatórios' });
    }

    // Atualiza o usuário
    // PENDING_APPROVAL
    user.tipo_usuario = 'entregador';

    // user.veiculo_modelo = veiculo
    // user.veiculo_placa = placa;

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
};

// Objeto para agrupar todas as funções do controller
const userController = {
  /**
   * Função NOVA: Busca o perfil do usuário atualmente logado.
   * Os dados do usuário (como o ID) vêm do `authMiddleware`.
   */
  async getCurrentUserProfile(req, res) {
    try {
      // req.user.userId é adicionado pelo authMiddleware
      const userId = req.user.userId; 
      
      const user = await User.findByPk(userId, {
        // Ocultamos a senha por padrão no modelo, então não precisamos nos preocupar aqui.
        include: [{ model: Address, as: 'endereco' }] 
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

  // Função para buscar um usuário pelo ID (para uso geral)
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

  // Função para atualizar um usuário
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      // Garante que o usuário só possa atualizar seu próprio perfil
      if (req.user.userId !== id) {
          return res.status(403).json({ message: 'Acesso negado.' });
      }
      
      const [updatedRows] = await User.update(req.body, {
        where: { id: id }
      });

      if (updatedRows > 0) {
        const updatedUser = await User.findByPk(id);
        return res.json({ message: 'Usuário atualizado com sucesso', user: updatedUser });
      }

      return res.status(404).json({ message: 'Usuário não encontrado' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },
};

// Exporta o objeto com todas as funções
module.exports = userController;

