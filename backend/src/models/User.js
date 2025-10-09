const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    // Método para verificar a senha
    async checkPassword(password) {
      // Usa a senha_hash da instância atual para comparar
      return await bcrypt.compare(password, this.senha_hash);
    }

    static associate(models) {
      // Um usuário pertence a um endereço
      this.belongsTo(models.Address, {
        foreignKey: 'endereco_id',
        as: 'endereco'
      });
      // Um usuário (se for lojista) tem um perfil de lojista
      this.hasOne(models.Lojista, {
        foreignKey: 'id',
        as: 'lojistaProfile'
      });
    }
  }

  User.init({
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
      allowNull: false
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
    // O campo endereco_id é gerenciado pela associação
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'usuarios',
    timestamps: true, // Habilitado para usar createdAt
    createdAt: 'data_cadastro', // Mapeia createdAt para data_cadastro
    updatedAt: false, // Desabilita updatedAt se não existir
    defaultScope: {
      attributes: { exclude: ['senha_hash'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['senha_hash'] }
      }
    },
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

  return User;
};

