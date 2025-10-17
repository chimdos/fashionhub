const { User, Address, Lojista } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

const authController = {
  /**
   * Registra um novo usuário.
   * Se o tipo de usuário for 'lojista', cria também o perfil na tabela de lojistas.
   */
  async register(req, res) {
    const t = await sequelize.transaction();
    try {
      const { nome, email, senha, tipo_usuario, telefone, endereco, nome_loja } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Um usuário já existe com este e-mail.' });
      }

      const newUser = await User.create({
        nome,
        email,
        senha_hash: senha, // O hook do modelo User irá criptografar a senha
        tipo_usuario,
        telefone,
      }, { transaction: t });

      // Se um endereço foi fornecido, cria e o associa ao usuário
      if (endereco) {
        const newAddress = await Address.create(endereco, { transaction: t });
        await newUser.setEndereco(newAddress, { transaction: t });
      }

      // Se o usuário for um lojista, cria o seu perfil
      if (tipo_usuario === 'lojista') {
        if (!nome_loja) {
          throw new Error('O nome da loja é obrigatório para o registro de lojista.');
        }
        await Lojista.create({
          id: newUser.id, // Usa o mesmo ID do usuário
          nome_loja: nome_loja,
        }, { transaction: t });
      }
      
      // Confirma todas as operações no banco de dados
      await t.commit();
      
      // Gera o token de autenticação para o novo usuário
      const token = jwt.sign(
        { userId: newUser.id, tipo_usuario: newUser.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      // Prepara a resposta, removendo a senha
      const userResponse = newUser.get({ plain: true });
      delete userResponse.senha_hash;

      res.status(201).json({ message: 'Usuário criado com sucesso!', token, user: userResponse });

    } catch (error) {
      await t.rollback(); // Desfaz tudo se houver um erro
      console.error('Erro no registro:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  /**
   * Autentica um usuário existente.
   */
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Busca o usuário pelo e-mail, incluindo a senha para verificação
      const user = await User.scope('withPassword').findOne({ where: { email, ativo: true } });

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      // Usa o método do modelo para verificar a senha
      const isPasswordValid = await user.checkPassword(senha);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      // Gera o token de autenticação
      const token = jwt.sign(
        { userId: user.id, tipo_usuario: user.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      // Prepara a resposta, removendo a senha
      const userResponse = user.get({ plain: true });
      delete userResponse.senha_hash;

      res.json({ message: 'Login realizado com sucesso!', token, user: userResponse });

    } catch (error) {
      console.error('ERRO DURANTE O LOGIN:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
};

module.exports = authController;

