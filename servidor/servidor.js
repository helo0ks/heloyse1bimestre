const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3001; // porta ajustável via ambiente

// --- MIDDLEWARES ---
app.use(cors({
    origin: 'http://localhost:3001', // deixe apontado para onde seu front estiver
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// --- SERVINDO ARQUIVOS ESTÁTICOS ---
app.use('/proj', express.static(path.join(__dirname, '..', 'proj')));
// Comentado pois não existem as pastas:
app.use('/login', express.static(path.join(__dirname, '..', 'login')));
app.use('/adm',   express.static(path.join(__dirname, '..', 'adm')));

// --- SESSÕES ---
app.use(session({
    secret: 'sua-chave-secreta-para-proteger-a-sessao',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

// --- Caminhos dos CSVs ---
const USERS_CSV_PATH = path.join(__dirname, 'users.csv');
const PRODUCTS_CSV_PATH = path.join(__dirname, 'products.csv');

// --- Funções auxiliares ---
const readCsv = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(l => l.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split(',');
        let obj = {};
        headers.forEach((header, idx) => {
            obj[header] = values[idx]?.trim() || '';
        });
        return obj;
    });
};

const writeCsv = (filePath, data) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]).join(','));
    fs.writeFileSync(filePath, `${headers.join(',')}\n${rows.join('\n')}`);
};

// --- Middleware: admin ---
const isAdmin = (req, res, next) => {
    if (req.session.user?.role === 'admin') return next();
    res.status(403).json({ message: 'Acesso negado' });
};

// --- Cadastro ---
app.post('/cadastrar', async (req, res) => {
    const { email: username, senha: password } = req.body;
    const users = readCsv(USERS_CSV_PATH);

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'Usuário já existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Date.now().toString(),
        username,
        password: hashedPassword,
        role: 'cliente'
    };
    users.push(newUser);
    writeCsv(USERS_CSV_PATH, users);

    res.status(201).json({ success: true, message: 'Cadastro realizado com sucesso!' });
});

// --- Login ---
app.post('/login', async (req, res) => {
    const { email: username, senha: password } = req.body;
    const users = readCsv(USERS_CSV_PATH);

    const user = users.find(u => u.username === username);
    if (!user) return res.status(400).json({ success: false, message: 'Usuário não encontrado.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Senha incorreta.' });

    req.session.user = user;
    res.status(200).json({ success: true, message: 'Login realizado com sucesso!' });
});

// --- Produtos (listar) ---
app.get('/produtos', (req, res) => {
    const produtos = readCsv(PRODUCTS_CSV_PATH);
    res.json(produtos);
});

// --- Logout ---
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout feito com sucesso.' });
    });
});

// --- Início ---
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
