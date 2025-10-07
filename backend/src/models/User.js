// src/models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_usuario: {
    type: DataTypes.ENUM('cliente', 'lojista', 'entregador'),
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false // CORRIGIDO
  },
  endereco_id: {
    type: DataTypes.UUID,
    references: {
      model: 'enderecos',
      key: 'id'
    }
  },
  data_cadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: false,
  
  // SUGESTÃO 2: Oculta o campo senha_hash por padrão em todas as consultas
  defaultScope: {
    attributes: { exclude: ['senha_hash'] }
  },
  scopes: {
    // Escopo para poder buscar o usuário COM a senha quando necessário (ex: no login)
    withPassword: {
      attributes: { include: ['senha_hash'] }
    }
  },

  // SUGESTÃO 1: Hooks para hashear a senha automaticamente
  hooks: {
    beforeCreate: async (user) => {
      if (user.senha_hash) {
        const salt = await bcrypt.genSalt(12);
        user.senha_hash = await bcrypt.hash(user.senha_hash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('senha_hash')) {
        const salt = await bcrypt.genSalt(12);
        user.senha_hash = await bcrypt.hash(user.senha_hash, salt);
      }
    }
  }
});

// SUGESTÃO 3: Método para definir associações
User.associate = (models) => {
  // Um usuário pertence a um endereço
  User.belongsTo(models.Address, {
    foreignKey: 'endereco_id',
    as: 'endereco'
  });
  // Um usuário (se for lojista) tem um perfil de lojista
  User.hasOne(models.Lojista, {
      foreignKey: 'id', // O ID do lojista é o mesmo do usuário
      as: 'lojistaProfile'
  });
};

// Adicionando um método de instância para verificar a senha
// Isso também move a lógica do controller para o modelo
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.senha_hash);
};


module.exports = User;