const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Novo cliente conectado: ${socket.id}`);

  socket.on('join_entregadores', () => {
    socket.join('entregadores');
    console.log(`Socket ${socket.id} entrou na sala de entregadores.`);
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = {};
  return next();
});

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/products', require('./routes/products.js'));
app.use('/api/bags', require('./routes/bags.js'));
app.use('/api/users', require('./routes/users.js'));
app.use('/api/transactions', require('./routes/transactions.js'));

app.get('/api', (req, res) => {
  res.json({ message: 'API do FashionHub está funcionando! 🚀' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado no servidor!' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');

    await sequelize.sync({ alter: true });
    console.log('Banco de dados sincronizado (Estrutura atualizada).');

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