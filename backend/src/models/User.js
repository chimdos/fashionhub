const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    async checkPassword(password) {
      return await bcrypt.compare(password, this.senha_hash);
    }

    static associate(models) {
      this.belongsTo(models.Address, {
        foreignKey: 'endereco_id',
        as: 'endereco'
      });
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
    },
    password_reset_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'data_cadastro',
    updatedAt: false,
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