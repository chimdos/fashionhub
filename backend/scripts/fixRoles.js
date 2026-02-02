require('dotenv').config();
const { User, Lojista, sequelize } = require('../src/models');

async function fixRoles() {
    const t = await sequelize.transaction();
    try {
        console.log('Buscando usuários que deveriam ser Admins...');

        const lojistas = await Lojista.findAll({ attributes: ['id'] });
        const ids = lojistas.map(l => l.id);

        const [updatedCount] = await User.update(
            { role: 'admin' },
            {
                where: { id: ids },
                transaction: t
            }
        );

        await t.commit();
        console.log(`Sucesso! ${updatedCount} usuários foram promovidos a Admin.`);
    } catch (error) {
        await t.rollback();
        console.error('Erro ao corrigir roles:', error);
    } finally {
        process.exit();
    }
}

fixRoles();