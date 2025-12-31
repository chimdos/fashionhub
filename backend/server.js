// src/app.js
// configuração do servidor principal

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importa a instância do Sequelize para conexão com o DB
const { sequelize } = require('./models'); // (Você precisará criar este arquivo)

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// --- Middlewares ---
app.use(helmet());

// Sugestão: Configuração de CORS mais segura para produção
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL do seu frontend
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(morgan('dev')); // 'dev' é mais limpo para desenvolvimento
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rotas ---
// (Certifique-se de que os arquivos existem em src/routes/)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/bags', require('./routes/bags'));
app.use('/api/transactions', require('./routes/transactions'));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Marketplace de Roupas está funcionando!' });
});

// --- Middleware de tratamento de erros aprimorado ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Não vaza o stack trace para o cliente em produção
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Ocorreu um erro interno no servidor.' : err.message;
  res.status(statusCode).json({ message });
});

// --- Inicialização do Servidor com Conexão ao DB ---
const startServer = async () => {
  try {
    // Testa a conexão com o banco de dados
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Sincroniza os modelos (opcional, útil em desenvolvimento)
    // await sequelize.sync({ alter: true }); 
    // console.log("Modelos sincronizados com o banco de dados.");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
};

startServer();