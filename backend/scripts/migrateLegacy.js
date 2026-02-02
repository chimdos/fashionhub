const { User, Lojista, Loja, sequelize } = require('../src/models');

async function migrate() {
    const t = await sequelize.transaction();

    try {
        console.log('Iniciando migração de dados');

        const lojistasAntigos = await Lojista.findAll({ transaction: t });

        if (lojistasAntigos.length === 0) {
            console.log('Nenhum dado antigo encontrado para migrar.');
            return;
        }

        for (const lojista of lojistasAntigos) {
            console.log(`Migrando loja: ${lojista.nome_loja}...`);

            const novaLoja = await Loja.create({
                nome_loja: lojista.nome_loja,
                cnpj: lojista.cpnj,
                descricao: lojista.descricao,
                cep: lojista.cep,
                rua: lojista.rua,
                numero: lojista.numero,
                bairro: lojista.bairro,
                cidade: lojista.cidade,
                estado: lojista.estado
            }, { transaction: t });

            await User.update(
                {
                    loja_id: novaLoja.id,
                    role: 'admin'
                },
                {
                    where: { id: lojista.id },
                    transaction: t
                }
            );
        }

        await t.commit();
        console.log('Migração concluída com sucesso.');
    } catch (error) {
        await t.rollback();
        console.error('Erro na migração. O banco foi restaurado:', error);
    } finally {
        process.exit();
    }
}

migrate();