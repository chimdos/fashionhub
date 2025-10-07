const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Address } = require('../models');
// Importe a instância do sequelize
const sequelize = require('../config/database'); 

const authController = {
  // Registro de usuário com transação
  async register(req, res) {
    // Inicia uma transação gerenciada pelo Sequelize
    const t = await sequelize.transaction();

    try {
      const { nome, email, senha, tipo_usuario, telefone, endereco } = req.body;

      // [SUGESTÃO] Aqui seria o local ideal para a validação de dados com Joi ou express-validator

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe com este email' });
      }

      const saltRounds = 12;
      const senha_hash = await bcrypt.hash(senha, saltRounds);

      let endereco_id = null;
      if (endereco) {
        // Passamos a transação para a operação de criação
        const newAddress = await Address.create(endereco, { transaction: t });
        endereco_id = newAddress.id;
      }

      const newUser = await User.create({
        nome,
        email,
        senha_hash,
        tipo_usuario,
        telefone,
        endereco_id
      }, { transaction: t }); // Passamos a transação aqui também

      // Se tudo deu certo até aqui, a transação é confirmada (commit)
      await t.commit();

      const token = jwt.sign(
        { userId: newUser.id, tipo_usuario: newUser.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
        user: { /* ... dados do usuário ... */ }
      });
    } catch (error) {
      // Se qualquer erro ocorrer, a transação é desfeita (rollback)
      await t.rollback();
      console.error('Erro no registro:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  },

  // A função de login permanece a mesma, pois é apenas leitura
  async login(req, res) {
    // ... seu código de login existente ...
  }
};

module.exports = authController;