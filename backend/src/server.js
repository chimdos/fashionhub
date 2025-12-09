// --- Imports Principais ---
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Importa a conexão com o banco de dados
const sequelize = require('./config/database');

// --- Inicialização do App ---
const PORT = process.env.PORT || 3000;
const app = express();

// IMPORTANTE: Criar o servidor HTTP a partir do Express
const server = http.createServer(app);

// Configuração do Socket.io no servidor HTTP
const io = new Server(server, {
  cors: {
    origin: "*", // Em produção, restringir isso para o domínio do app
    methods: ["GET", "POST"]
  }
});

// Eventos do Socket
io.on('connection', (socket) => {
  console.log(`🔌 Novo cliente conectado: ${socket.id}`);

  // Motoboy entra numa sala de entregadores
  socket.on('join_entregadores', () => {
    socket.join('entregadores');
    console.log(`Socket ${socket.id} entrou na sala de entregadores.`);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// --- Middlewares ---
app.use(helmet()); 
app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Middleware para injetar o 'io' em todas as rotas
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = {};
  return next();
});

// --- Rotas ---
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/products', require('./routes/products.js'));
app.use('/api/bags', require('./routes/bags.js'));
app.use('/api/users', require('./routes/users.js'));
app.use('/api/transactions', require('./routes/transactions.js'));

// Rota de teste
app.get('/api', (req, res) => {
  res.json({ message: 'API do FashionHub está funcionando! 🚀' });
});

// --- Middleware de Tratamento de Erros ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado no servidor!' });
});

// --- Inicialização do Servidor ---
const startServer = async () => {
  try {
    // 1. Autentica no Banco
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');

    // 2. O PULO DO GATO: Atualiza a estrutura do banco automaticamente
    // Isso evita que você precise rodar migrations manuais agora em desenvolvimento
    await sequelize.sync({ alter: true }); 
    console.log('Banco de dados sincronizado (Estrutura atualizada).');

    // 3. Inicia o Servidor (Usando server.listen, NÃO app.listen)
    server.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Socket.io pronto para conexões`);
    });
    
  } catch (error) {
    console.error('Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();