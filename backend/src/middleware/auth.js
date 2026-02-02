const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token de acesso requerido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);

    if (!user || !user.ativo) {
      return res.status(401).json({ message: 'Falha na autenticação.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
    }
    res.status(401).json({ message: 'Falha na autenticação.' });
  }
};

const requireUserType = (allowedTypes) => {
  const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];

  return (req, res, next) => {
    const { tipo_usuario } = req.user;

    if (!types.includes(tipo_usuario)) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para realizar esta ação.' });
    }
    next();
  };
};

const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    const { role } = req.user;
    if (!roles.includes(role)) {
      return res.status(403).json({ message: 'Acesso restrito. Apenas administradores da loja podem realizar esta ação.' });
    }

    next();
  };
};

module.exports = { authMiddleware, requireUserType, requireRole };