const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const port = 3001;

// Banco de dados simulado (em memória)
const usuarios = [
  { nome: 'João', email: 'joao@email.com', senha: 'abc123', tipo: 'cliente' },
  { nome: 'Admin', email: 'admin@pizzaria.com', senha: 'admin123', tipo: 'admin' }
];

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://localhost:3000',
      undefined // permite abrir com file://
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS não permitido'));
    }
  },
  credentials: true
}));

// Rota de cadastro
app.post('/cadastrar', (req, res) => {
  const { nome, email, senha } = req.body;

  // Verifica se o usuário já existe
  if (usuarios.find(u => u.email === email)) {
    return res.status(400).send({ success: false, message: 'Usuário já existe' });
  }

  // Adiciona usuário como cliente
  usuarios.push({ nome, email, senha, tipo: 'cliente' });
  res.send({ success: true, message: 'Cadastro realizado com sucesso!' });
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    // Cria cookie com tipo de usuário
    res.cookie('logado', usuario.tipo, {
      maxAge: 900000,
      httpOnly: true,
      sameSite: 'Lax',
      secure: false // colocar true se usar HTTPS
    });

    res.send({ success: true, nome: usuario.nome, tipo: usuario.tipo });
  } else {
    res.status(401).send({ success: false, message: 'Credenciais inválidas' });
  }
});

// Rota para verificar se o usuário está logado (opcional)
app.get('/verificar', (req, res) => {
  const tipo = req.cookies.logado;
  if (tipo) {
    res.send({ logado: true, tipo });
  } else {
    res.send({ logado: false });
  }
});

// Rota de logout
app.post('/logout', (req, res) => {
  res.clearCookie('logado');
  res.send({ success: true });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🟢 Servidor rodando em http://localhost:${port}`);
});
