const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Lojista extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'id', as: 'user' });
      this.hasMany(models.Product, { foreignKey: 'lojista_id', as: 'produtos' });
    }
  }

  Lojista.init({
    id: { type: DataTypes.UUID, primaryKey: true, references: { model: 'usuarios', key: 'id' } },
    nome_loja: { type: DataTypes.STRING, allowNull: false },
    cnpj: { type: DataTypes.STRING, unique: true },
    descricao: { type: DataTypes.TEXT },
    cep: { type: DataTypes.STRING },
    rua: { type: DataTypes.STRING },
    numero: { type: DataTypes.STRING },
    bairro: { type: DataTypes.STRING },
    cidade: { type: DataTypes.STRING },
    estado: { type: DataTypes.STRING },
  }, {
    sequelize,
    modelName: 'Lojista',
    tableName: 'lojistas',
    underscored: true,
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: false
  });

  return Lojista;
};