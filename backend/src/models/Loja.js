const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Loja extends Model {
        static associate(models) {
            this.hasMany(models.User, { foreignKey: 'loja_id', as: 'funcionarios' });
            this.hasMany(models.Product, { foreignKey: 'loja_id', as: 'produtos' });
        }
    }

    Loja.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        nome_loja: { type: DataTypes.STRING, allowNull: false },
        cnpj: { type: DataTypes.STRING, unique: true },
        descricao: DataTypes.TEXT,
        cep: DataTypes.STRING,
        rua: DataTypes.STRING,
        numero: DataTypes.STRING,
        bairro: DataTypes.STRING,
        cidade: DataTypes.STRING,
        estado: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Loja',
        tableName: 'lojas',
        underscored: true,
        timestamps: true,
        createdAt: 'criado_em',
        updatedAt: 'updated_at'
    });

    return Loja;
};