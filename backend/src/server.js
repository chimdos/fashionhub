// --- Imports Principais ---
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importa a conexão com o banco de dados
const sequelize = require('./config/database');

// --- Inicialização do App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(helmet()); // Ajuda a proteger o app definindo vários cabeçalhos HTTP
app.use(cors()); // Permite que o frontend acesse a API
app.use(morgan('dev')); // Faz o log das requisições no console
app.use(express.json()); // Permite que o app entenda JSON
app.use(express.urlencoded({ extended: true })); // Permite que o app entenda dados de formulário

// --- Rotas ---
// Aqui você "conecta" suas rotas ao servidor.
// Crie um arquivo para cada rota e importe aqui.
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/products', require('./routes/products.js'));
app.use('/api/bags', require('./routes/bags.js'));
app.use('/api/users', require('./routes/users.js'));
app.use('/api/transactions', require('./routes/transactions.js'));
// Adicione outras rotas conforme necessário...

// Rota de teste para verificar se a API está no ar
app.get('/api', (req, res) => {
  res.json({ message: 'API do FashionHubApp está funcionando!' });
});

// --- Middleware de Tratamento de Erros ---
// Este middleware será chamado se ocorrer um erro em alguma rota
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado no servidor!' });
});

// --- Inicialização do Servidor ---
const startServer = async () => {
  try {
    // Testa a conexão com o banco de dados antes de iniciar o servidor
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
};

startServer();
