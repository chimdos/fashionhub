const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Lojista extends Model {
    static associate(models) {
      // Um perfil de lojista pertence a um usuário
      this.belongsTo(models.User, { foreignKey: 'id', as: 'user' });
      // Um lojista pode ter muitos produtos
      this.hasMany(models.Product, { foreignKey: 'lojista_id', as: 'produtos' });
    }
  }

  Lojista.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: { // Garante que o ID do lojista seja o mesmo do usuário
        model: 'usuarios',
        key: 'id'
      }
    },
    nome_loja: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cnpj: {
      type: DataTypes.STRING,
      unique: true
    },
    descricao: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Lojista',
    tableName: 'lojistas',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: false
  });

  return Lojista;
};

