const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Log para verificar as variáveis
console.log('Configuração do banco:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Conectar ao PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.connect((err) => {
  if (err) console.error('Erro ao conectar ao PostgreSQL:', err);
  else console.log('Conectado ao PostgreSQL');
});

// Rotas (mantidas iguais ao exemplo anterior)
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [email, password]
    );
    res.status(201).json({ message: 'Usuário criado', userId: result.rows[0].id });
  } catch (error) {
    res.status(400).json({ error: 'Email já existe ou erro' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    res.json({ userId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.post('/transactions', async (req, res) => {
  const { userId, amount, category, date, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO transactions (user_id, amount, category, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, amount, category, date, description]
    );
    res.status(201).json({ message: 'Transação adicionada', transactionId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar transação' });
  }
});

app.get('/transactions/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar transações' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});