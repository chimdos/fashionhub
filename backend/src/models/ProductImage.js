const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProductImage extends Model {
    static associate(models) {
      // Uma imagem pertence a um produto
      this.belongsTo(models.Product, { foreignKey: 'produto_id', as: 'produto' });
    }
  }

  ProductImage.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    url_imagem: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ordem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ProductImage',
    tableName: 'imagens_produto',
    timestamps: false
  });

  return ProductImage;
};

