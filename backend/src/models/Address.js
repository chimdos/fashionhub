const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Address extends Model {
    static associate(models) {
      // Um endereço pode pertencer a muitos usuários (ex: casa com múltiplos usuários)
      this.hasMany(models.User, { foreignKey: 'endereco_id', as: 'usuarios' });
      // Um endereço pode ser o local de entrega de muitas malas
      this.hasMany(models.Bag, { foreignKey: 'endereco_entrega_id', as: 'entregas' });
    }
  }

  Address.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rua: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numero: {
      type: DataTypes.STRING,
      allowNull: false
    },
    complemento: {
      type: DataTypes.STRING
    },
    bairro: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cidade: {
      type: DataTypes.STRING,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    cep: {
      type: DataTypes.STRING(9),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Address',
    tableName: 'enderecos',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: false
  });

  return Address;
};

