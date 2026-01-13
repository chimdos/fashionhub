const { User, Address, Lojista } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const crypto = require('crypto');
const { Op } = require('sequelize');

const authController = {

  async register(req, res) {
    const t = await sequelize.transaction();
    try {
      const { nome, email, senha, tipo_usuario, telefone, endereco, nome_loja } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        await t.rollback();
        return res.status(400).json({ message: 'Um usuário já existe com este e-mail.' });
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

      if (tipo_usuario === 'lojista') {
        if (!nome_loja) {
          throw new Error('O nome da loja é obrigatório para o registro de lojista.');
        }
        await Lojista.create({
          id: newUser.id,
          nome_loja: nome_loja,
        }, { transaction: t });
      }

      await t.commit();

      const token = jwt.sign(
        { userId: newUser.id, tipo_usuario: newUser.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const userResponse = newUser.get({ plain: true });
      delete userResponse.senha_hash;

      res.status(201).json({ message: 'Usuário criado com sucesso!', token, user: userResponse });

    } catch (error) {
      if (t && !t.finished) {
        await t.rollback();
      }

      console.error('ERRO REAL NO REGISTRO:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor.',
        error: error.message
      });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const user = await User.scope('withPassword').findOne({ where: { email, ativo: true } });

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const isPasswordValid = await user.checkPassword(senha);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { userId: user.id, tipo_usuario: user.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const userResponse = user.get({ plain: true });
      delete userResponse.senha_hash;

      res.json({ message: 'Login realizado com sucesso!', token, user: userResponse });

    } catch (error) {
      console.error('ERRO DURANTE O LOGIN:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      const token = crypto.randomBytes(20).toString('hex');

      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      await user.update({
        password_reset_token: token,
        password_reset_expires: expires
      });

      console.log(`\n--- RECUPERAÇÃO DE SENHA ---`);
      console.log(`Usuário: ${user.nome}`);
      console.log(`Token: ${token}`);
      console.log(`----------------------------\n`);

      return res.json({ message: 'Se o e-mail exisitr, um token de recuperação foi enviado.' });
    } catch (error) {
      console.error('ERRO DURANTE O ESQUECI MINHA SENHA:', error);
      res.status(500).json({ message: 'Erro ao processar solicitação.' });
    }
  },

  async resetPassword(req, res) {
    const { email, token, novaSenha } = req.body;
    try {
      const user = await User.findOne({
        where: {
          email,
          password_reset_token: token,
          password_reset_expires: { [sequelize.Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Token inválido ou expirado.' });
      }

      user.senha_hash = novaSenha;
      user.password_reset_token = null;
      user.password_reset_expires = null;
      await user.save();

      res.json({ message: 'Senha atualizada com sucesso.' });

    } catch (error) {
      console.error('ERRO DURANTE A REDEFINIÇÃO DE SENHA:', error);
      res.status(500).json({ message: 'Erro ao processar solicitação.' });
    }
  },
};
module.exports = authController;