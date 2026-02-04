const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('dev'));

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/bags', require('./routes/bags'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/store', require('./routes/store'));

app.get('/', (req, res) => {
  res.json({ message: 'API do FashionHub está funcionando!' });
});

app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    message: err.message || 'Erro interno no servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida.');

    await sequelize.sync({ alter: true });
    console.log('--- Banco de dados sincronizado (alter true) ---');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
};

startServer();