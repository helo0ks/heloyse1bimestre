const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3001;

// --- MIDDLEWARES ---
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// --- SERVINDO ARQUIVOS ESTÁTICOS (FORMA CORRETA) ---
app.use('/proj', express.static(path.join(__dirname, '..', 'proj')));
app.use('/login', express.static(path.join(__dirname, '..', 'login')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// --- CONFIGURAÇÃO DA SESSÃO ---
app.use(session({
    secret: 'sua-chave-secreta-para-proteger-a-sessao',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

// --- CAMINHOS PARA OS ARQUIVOS CSV ---
const USERS_CSV_PATH = path.join(__dirname, 'users.csv');
const PRODUCTS_CSV_PATH = path.join(__dirname, 'products.csv');

// --- FUNÇÕES AUXILIARES PARA LER E ESCREVER CSV ---
const readCsv = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length <= 1) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split(',');
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
        });
        return obj;
    });
};
const writeCsv = (filePath, data) => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    fs.writeFileSync(filePath, `${headers}\n${rows.join('\n')}`);
};

// --- MIDDLEWARE DE AUTORIZAÇÃO (VERIFICA SE É ADMIN) ---
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Acesso negado.' });
};

// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/cadastrar', async (req, res) => {
    const { email: username, senha: password } = req.body;
    const users = readCsv(USERS_CSV_PATH);
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'Usuário já existe.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), username, password: hashedPassword, role: 'cliente' };
    users.push(newUser);
    writeCsv(USERS_CSV_PATH, users);
    res.status(201).json({ success: true, message: 'Cadastro realizado com sucesso!' });
});

app.post('/login', async (req, res) => {
    const { email: username, senha: password } = req.body;
    const users = readCsv(USERS_CSV_PATH);
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (passwordIsValid) {
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.status(200).json({ success: true, user: req.session.user });
    } else {
        res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Não foi possível fazer logout.' });
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true, message: 'Logout bem-sucedido.' });
    });
});

app.get('/check-auth', (req, res) => {
    if (req.session.user) res.status(200).json({ loggedIn: true, user: req.session.user });
    else res.status(200).json({ loggedIn: false });
});

// --- CRUD DE PRODUTOS ---
app.get('/products', (req, res) => res.json(readCsv(PRODUCTS_CSV_PATH)));
app.post('/products', isAdmin, (req, res) => {
    const products = readCsv(PRODUCTS_CSV_PATH);
    const newProduct = { id: Date.now().toString(), ...req.body };
    products.push(newProduct);
    writeCsv(PRODUCTS_CSV_PATH, products);
    res.status(201).json(newProduct);
});
app.put('/products/:id', isAdmin, (req, res) => {
    const products = readCsv(PRODUCTS_CSV_PATH);
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Produto não encontrado.' });
    products[index] = { ...products[index], ...req.body, id: req.params.id };
    writeCsv(PRODUCTS_CSV_PATH, products);
    res.json(products[index]);
});
app.delete('/products/:id', isAdmin, (req, res) => {
    let products = readCsv(PRODUCTS_CSV_PATH);
    const updatedProducts = products.filter(p => p.id !== req.params.id);
    if (products.length === updatedProducts.length) return res.status(404).json({ message: 'Produto não encontrado.' });
    writeCsv(PRODUCTS_CSV_PATH, updatedProducts);
    res.status(204).send();
});

// --- CRUD DE USUÁRIOS ---
app.get('/users', isAdmin, (req, res) => {
    const users = readCsv(USERS_CSV_PATH);
    const safeUsers = users.map(({ password, ...safeData }) => safeData);
    res.json(safeUsers);
});
app.put('/users/:id/role', isAdmin, (req, res) => {
    const { role } = req.body;
    if (role !== 'cliente' && role !== 'admin') return res.status(400).json({ message: 'Papel inválido.' });
    const users = readCsv(USERS_CSV_PATH);
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Usuário não encontrado.' });
    users[index].role = role;
    writeCsv(USERS_CSV_PATH, users);
    res.json({ message: `Papel do usuário atualizado.` });
});
app.delete('/users/:id', isAdmin, (req, res) => {
    if (req.session.user.id === req.params.id) return res.status(400).json({ message: 'Você não pode excluir a si mesmo.' });
    let users = readCsv(USERS_CSV_PATH);
    const updatedUsers = users.filter(u => u.id !== req.params.id);
    if (users.length === updatedUsers.length) return res.status(404).json({ message: 'Usuário não encontrado.' });
    writeCsv(USERS_CSV_PATH, updatedUsers);
    res.status(204).send();
});

// --- ROTA RAIZ ---
app.get('/', (req, res) => {
    res.redirect('/proj/pedido.html');
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🟢 Servidor rodando. Acesse em http://localhost:${PORT}`);
});