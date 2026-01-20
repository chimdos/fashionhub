const { User, Address, Lojista, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');

const authController = {

  async register(req, res) {
    const t = await sequelize.transaction();
    try {
      const { nome, email, senha, tipo_usuario, telefone, endereco, nome_loja, cnpj } = req.body;

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
          cnpj: cnpj,
          cep: endereco?.cep,
          rua: endereco?.rua,
          numero: endereco?.numero,
          bairro: endereco?.bairro,
          cidade: endereco?.cidade,
          estado: endereco?.estado,
        }, { transaction: t });
      }

      if (senha && senha.length < 8) {
        return res.status(400).json({
          message: 'A senha deve conter no mínimo 8 caracteres.'
        });
      }

      await t.commit();

      const token = jwt.sign(
        { userId: newUser.id, tipo_usuario: newUser.tipo_usuario },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const userResponse = newUser.get({ plain: true });
      delete userResponse.senha_hash;

      if (tipo_usuario === 'lojista') {
        userResponse.nome_loja = nome_loja;
        userResponse.cnpj = cnpj;
        userResponse.rua = endereco?.rua;
        userResponse.numero = endereco?.numero;
        userResponse.bairro = endereco?.bairro;
        userResponse.cidade = endereco?.cidade;
        userResponse.estado = endereco?.estado;
      }

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

      const user = await User.scope('withPassword').findOne({
        where: { email, ativo: true },
        include: [{ model: Lojista, as: 'lojista' }]
      });

      console.log("--> USUÁRIO ENCONTRADO:", user?.nome);
      console.log("--> DADOS DA LOJA:", user?.lojista ? "SIM" : "NÃO (NULL)");
      if (user?.lojista) {
        console.log("--> CONTEÚDO DA LOJA:", user.lojista.toJSON());
      }

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

      return res.json({ message: 'TESTE DE CONEXÃO: 12345' })
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
          password_reset_expires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Token inválido ou expirado.' });
      }

      user.senha_hash = novaSenha;
      user.password_reset_token = null;
      user.password_reset_expires = null;

      if (senha && senha.length < 8) {
        return res.status(400).json({
          message: 'A senha deve conter no mínimo 8 caracteres.'
        });
      }

      await user.save();

      res.json({ message: 'Senha atualizada com sucesso.' });

    } catch (error) {
      console.error('ERRO DURANTE A REDEFINIÇÃO DE SENHA:', error);
      res.status(500).json({ message: 'Erro ao processar solicitação.' });
    }
  },

  async checkAvailability(req, res) {
    console.log("--- INICIANDO VERIFICAÇÃO ---");
    console.log("Dados recebidos no Body:", req.body);
    try {
      const { email, telefone, nome_loja, cnpj } = req.body;
      const errors = {};

      if (email) {
        console.log("Checando email...");
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) errors.email = 'Este e-mail já está em uso.';
      }

      if (telefone) {
        const existingPhone = await User.findOne({ where: { telefone } });
        if (existingPhone) errors.telefone = 'Este telefone já está em uso.';
      }

      if (nome_loja) {
        console.log("Checando nome da loja...");
        const existingStore = await Lojista.findOne({ where: { nome_loja } });
        if (existingStore) errors.nomeLoja = 'Este nome de loja já está em uso.';
      }

      if (cnpj) {
        const cleanedCnpj = cnpj.replace(/[^\d]/g, '');
        const existingCnpj = await Lojista.findOne({ where: { cnpj: cleanedCnpj } });
        if (existingCnpj) errors.cnpj = 'Este CNPJ já está em uso.';
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      console.log("Tudo disponível!");
      return res.status(200).json({ message: 'Disponível' });

      return res.status(200).json({ message: 'E-mail e telefone disponíveis.' });
    } catch (error) {
      console.error("ERRO DETALHADO NO BACKEND:", error);
      res.status(500).json({ message: 'Erro ao verificar disponibilidade.', detalhe: error.message });
    }
  },
};
module.exports = authController;