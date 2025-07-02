const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session'); // Nova importação
const cookieParser = require('cookie-parser'); // Nova importação

const app = express();
const PORT = 3001;

// --- CONFIGURAÇÃO DOS MIDDLEWARES ---
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true // Essencial para cookies de sessão
}));
app.use(bodyParser.json());
app.use(cookieParser()); // Usar o cookie parser
app.use(express.static(path.join(__dirname, '..')));

// Configuração da Sessão
app.use(session({
    secret: 'seu-segredo-super-secreto-aqui', // Troque por uma chave aleatória e segura
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Em produção, use true com HTTPS
        httpOnly: true, // Impede acesso ao cookie via JS no frontend
        maxAge: 1000 * 60 * 60 * 24 // Duração de 1 dia
    }
}));


const USERS_CSV_PATH = path.join(__dirname, 'users.csv');
const PRODUCTS_CSV_PATH = path.join(__dirname, 'products.csv');

// Funções readCsv e writeCsv (sem alterações)
const readCsv = (filePath) => { /* ...código da resposta anterior... */ };
const writeCsv = (filePath, data) => { /* ...código da resposta anterior... */ };

// --- MIDDLEWARE DE AUTORIZAÇÃO ---
// Este middleware irá proteger nossas rotas de administrador
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next(); // Se o usuário na sessão for admin, continue
    }
    return res.status(403).json({ message: 'Acesso negado. Requer permissão de administrador.' });
};


// --- ROTAS DE AUTENTICAÇÃO E SESSÃO ---

// Login: agora cria uma sessão
app.post('/login', async (req, res) => {
    const { email: username, senha: password } = req.body;
    const users = readCsv(USERS_CSV_PATH);
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ success: false, message: 'Credenciais inválidas' });

    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
        // Cria a sessão para o usuário
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        res.json({ success: true, user: req.session.user });
    } else {
        res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
});

// Logout: destrói a sessão
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Não foi possível fazer logout.' });
        }
        res.clearCookie('connect.sid'); // Limpa o cookie do navegador
        res.json({ success: true, message: 'Logout bem-sucedido.' });
    });
});

// Verificar Sessão: o frontend usará esta rota para saber quem está logado
app.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Rota de Cadastro (sem alterações na lógica)
app.post('/cadastrar', async (req, res) => { /* ...código da resposta anterior... */ });

// --- CRUD DE PRODUTOS (ROTAS PROTEGIDAS) ---

// READ (Público)
app.get('/products', (req, res) => {
    res.json(readCsv(PRODUCTS_CSV_PATH));
});

// CREATE (Protegido)
app.post('/products', isAdmin, (req, res) => {
    const products = readCsv(PRODUCTS_CSV_PATH);
    const newProduct = { id: Date.now().toString(), ...req.body };
    products.push(newProduct);
    writeCsv(PRODUCTS_CSV_PATH, products);
    res.status(201).json(newProduct);
});

// UPDATE (Protegido)
app.put('/products/:id', isAdmin, (req, res) => {
    const products = readCsv(PRODUCTS_CSV_PATH);
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Produto não encontrado' });
    products[index] = { ...products[index], ...req.body };
    writeCsv(PRODUCTS_CSV_PATH, products);
    res.json(products[index]);
});

// DELETE (Protegido)
app.delete('/products/:id', isAdmin, (req, res) => {
    let products = readCsv(PRODUCTS_CSV_PATH);
    const updatedProducts = products.filter(p => p.id !== req.params.id);
    if (products.length === updatedProducts.length) {
        return res.status(404).json({ message: 'Produto não encontrado' });
    }
    writeCsv(PRODUCTS_CSV_PATH, updatedProducts);
    res.status(204).send();
});


// --- CRUD DE USUÁRIOS/ROLES (ROTAS PROTEGIDAS) ---

// READ (Protegido) - Listar todos os usuários
app.get('/users', isAdmin, (req, res) => {
    const users = readCsv(USERS_CSV_PATH);
    // Nunca envie a senha para o frontend, mesmo que hasheada
    const safeUsers = users.map(({ password, ...safeData }) => safeData);
    res.json(safeUsers);
});

// UPDATE (Protegido) - Alterar o papel de um usuário
app.put('/users/:id/role', isAdmin, (req, res) => {
    const { role } = req.body;
    if (role !== 'cliente' && role !== 'admin') {
        return res.status(400).json({ message: 'Papel inválido.' });
    }

    const users = readCsv(USERS_CSV_PATH);
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Usuário não encontrado' });

    users[index].role = role;
    writeCsv(USERS_CSV_PATH, users);
    res.json({ message: `Papel do usuário ${users[index].username} atualizado para ${role}.` });
});

// DELETE (Protegido) - Excluir um usuário
app.delete('/users/:id', isAdmin, (req, res) => {
    let users = readCsv(USERS_CSV_PATH);
    // Proteção para não deixar o admin se auto-excluir
    if(req.session.user.id === req.params.id) {
        return res.status(400).json({ message: 'Você não pode excluir a si mesmo.' });
    }
    const updatedUsers = users.filter(u => u.id !== req.params.id);
     if (users.length === updatedUsers.length) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    writeCsv(USERS_CSV_PATH, updatedUsers);
    res.status(204).send();
});


app.listen(PORT, () => {
    console.log(`🟢 Servidor rodando em http://localhost:${PORT}`);
});