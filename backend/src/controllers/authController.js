const { User, Address, Lojista } = require('../models'); // 1. Importa o modelo Lojista
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

const authController = {
  async register(req, res) {
    const t = await sequelize.transaction();
    try {
      const { nome, email, senha, tipo_usuario, telefone, endereco, nome_loja } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Utilizador já existe com este email' });
      }

      const newUser = await User.create({
        nome,
        email,
        senha_hash: senha,
        tipo_usuario,
        telefone,
      }, { transaction: t });

      if (endereco) {
        const newAddress = await Address.create(endereco, { transaction: t });
        await newUser.setEndereco(newAddress, { transaction: t });
      }

      // --- ALTERAÇÃO IMPORTANTE AQUI ---
      // 2. Se o utilizador for um lojista, cria o perfil do lojista
      if (tipo_usuario === 'lojista') {
        if (!nome_loja) {
           // Garante que o nome da loja foi enviado
          throw new Error('O nome da loja é obrigatório para o registo de lojista.');
        }
        await Lojista.create({
          id: newUser.id, // Usa o mesmo ID do utilizador
          nome_loja: nome_loja,
        }, { transaction: t });
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

  // A sua função de login (com as pistas de depuração) permanece a mesma
  async login(req, res) {
    try {
      console.log("--- INÍCIO DA TENTATIVA DE LOGIN ---");
      const { email, senha } = req.body;

      console.log("Passo 1: A procurar o utilizador no banco de dados...");
      const user = await User.scope('withPassword').findOne({ where: { email, ativo: true } });

      if (!user) {
        console.log("Resultado: Utilizador não encontrado ou inativo.");
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      console.log("Passo 2: Utilizador encontrado. A verificar a senha...");

      const isPasswordValid = await user.checkPassword(senha);

      if (!isPasswordValid) {
        console.log("Resultado: Senha inválida.");
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      console.log("Passo 3: Senha válida. A gerar o token JWT...");

      const token = jwt.sign(
        { userId: user.id, tipo_usuario: user.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      console.log("Passo 4: Token gerado. A enviar resposta de sucesso.");
      
      const userResponse = user.get({ plain: true });
      delete userResponse.senha_hash;

      res.json({ message: 'Login realizado com sucesso', token, user: userResponse });

    } catch (error) {
      console.error('ERRO DURANTE O LOGIN:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
};

module.exports = authController;

