// src/middleware/auth.js

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token de acesso requerido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Usamos o escopo 'withPassword' se precisarmos de dados que estão
    // normalmente ocultos, mas aqui o padrão já é suficiente.
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.ativo) {
      // Usamos uma mensagem genérica para não dar pistas a possíveis atacantes
      return res.status(401).json({ message: 'Falha na autenticação.' });
    }

    // Anexa os dados do token ao objeto da requisição
    req.user = decoded; 
    next();
  } catch (error) {
    // SUGESTÃO 2: Tratar erro de token expirado especificamente
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
    }
    // Para outros erros (token malformado, etc.), usamos uma mensagem genérica.
    res.status(401).json({ message: 'Falha na autenticação.' });
  }
};

/**
 * Middleware para verificar o tipo de usuário.
 * Aceita um único tipo (string) ou múltiplos tipos (array de strings).
 */
const requireUserType = (allowedTypes) => {
  // Garante que allowedTypes seja sempre um array para simplificar a lógica
  const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];

  return (req, res, next) => {
    // A propriedade req.user é adicionada pelo authMiddleware
    const { tipo_usuario } = req.user;

    if (!types.includes(tipo_usuario)) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para realizar esta ação.' });
    }
    next();
  };
};

module.exports = { authMiddleware, requireUserType };