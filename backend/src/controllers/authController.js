const { User, Address } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

const authController = {
  // Registo de utilizador
  async register(req, res) {
    const t = await sequelize.transaction();
    try {
      const { nome, email, senha, tipo_usuario, telefone, endereco } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Utilizador já existe com este email' });
      }

      // O hook do modelo User irá tratar do hashing da senha
      const newUser = await User.create({
        nome,
        email,
        senha_hash: senha, // Passamos a senha pura, o hook trata do resto
        tipo_usuario,
        telefone,
      }, { transaction: t });

      if (endereco) {
        const newAddress = await Address.create(endereco, { transaction: t });
        await newUser.setEndereco(newAddress, { transaction: t });
      }
      
      await t.commit();
      
      const token = jwt.sign(
        { userId: newUser.id, tipo_usuario: newUser.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      const userResponse = newUser.get({ plain: true });
      delete userResponse.senha_hash;

      res.status(201).json({ message: 'Utilizador criado com sucesso', token, user: userResponse });

    } catch (error) {
      await t.rollback();
      console.error('Erro no registo:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // Login de utilizador
  async login(req, res) {
    try {
      console.log("--- INÍCIO DA TENTATIVA DE LOGIN ---"); // PISTA 1
      const { email, senha } = req.body;

      console.log("Passo 1: A procurar o utilizador no banco de dados..."); // PISTA 2
      // Usamos o escopo 'withPassword' para garantir que o hash da senha é retornado
      const user = await User.scope('withPassword').findOne({ where: { email, ativo: true } });

      if (!user) {
        console.log("Resultado: Utilizador não encontrado ou inativo."); // PISTA 3
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      console.log("Passo 2: Utilizador encontrado. A verificar a senha..."); // PISTA 4

      // A função checkPassword foi adicionada ao protótipo do modelo User
      const isPasswordValid = await user.checkPassword(senha);

      if (!isPasswordValid) {
        console.log("Resultado: Senha inválida."); // PISTA 5
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      console.log("Passo 3: Senha válida. A gerar o token JWT..."); // PISTA 6

      const token = jwt.sign(
        { userId: user.id, tipo_usuario: user.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      console.log("Passo 4: Token gerado. A enviar resposta de sucesso."); // PISTA 7
      
      const userResponse = user.get({ plain: true });
      delete userResponse.senha_hash;

      res.json({ message: 'Login realizado com sucesso', token, user: userResponse });

    } catch (error) {
      console.error('ERRO DURANTE O LOGIN:', error); // PISTA DE ERRO
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
};

module.exports = authController;