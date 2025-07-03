document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELETORES DE ELEMENTOS E VARIÁVEIS GLOBAIS ---
    const cardsContainer = document.getElementById('cards-container');
    const managerPanel = document.getElementById('manager-panel');
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const botaoLogin = document.getElementById("botao-login");
    const botaoLogout = document.getElementById("botao-logout");
    const botaoAdmin = document.getElementById("botao-admin");
    const botaoCarrinho = document.getElementById('botao-carrinho');
    const tamanhoPizzaSpan = document.getElementById('tamanho-pizza');
    const precoTotalSpan = document.getElementById('preco-total');
    const listaSaboresUl = document.getElementById('lista-sabores');
    const btnAdicionarPizza = document.getElementById('adicionar-pizza');
    const carrinhoModal = document.getElementById('carrinho-modal');
    const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');
    const resumoCarrinhoDiv = document.getElementById('resumo-carrinho');
    const btnFinalizarPedidoModal = document.getElementById('finalizar-pedido-modal');
    const btnCancelarPedidoModal = document.getElementById('cancelar-pedido-modal');
    


    let currentUser = null;
    let precosPizza = {};
    let tamanhoSelecionado = null;
    let saboresSelecionados = [];

    // --- 2. FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
    async function initializeApp() {
        await checkUserSession();
        setupUI();
        await fetchProducts();
        setupEventListeners();
    }

    // --- 3. LÓGICA DE AUTENTICAÇÃO E SESSÃO ---
    async function checkUserSession() {
        try {
            const response = await fetch('/check-auth', { credentials: 'include' });
            const data = await response.json();
            if (data.loggedIn) currentUser = data.user;
        } catch (error) {
            console.error('Servidor de autenticação offline:', error);
        }
    }

    // --- 4. CONFIGURAÇÃO DA INTERFACE (UI) ---
    function setupUI() {
        if (currentUser) {
            botaoLogin.style.display = 'none';
            botaoLogout.style.display = 'block';
            if (currentUser.role === 'admin') {
                botaoAdmin.style.display = 'block';
                managerPanel.style.display = 'block';
            }
        } else {
            botaoLogin.style.display = 'block';
            botaoLogout.style.display = 'none';
            botaoAdmin.style.display = 'none';
            managerPanel.style.display = 'none';
        }
    }

    // --- 5. LÓGICA DE PRODUTOS E CRUD ---
    async function fetchProducts() {
        try {
            const response = await fetch('/products');
            if (!response.ok) throw new Error('Falha na resposta do servidor.');
            const products = await response.json();
            cardsContainer.innerHTML = '';
            precosPizza = {p.price};
            products.forEach(p => {
                precosPizza[p.name] = { broto: parseFloat(p.price) - 5, media: parseFloat(p.price) - 2, grande: parseFloat(p.price) };
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.productId = p.id;
                card.innerHTML = `
                    <img src="/${p.imageUrl}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <p>R$ ${parseFloat(p.price).toFixed(2)}</p>
                    <div class="card-actions">
                        <button class="add-to-cart-btn" data-product-name="${p.name}">Adicionar</button>
                    </div>`;
                if (currentUser && currentUser.role === 'admin') {
                    card.querySelector('.card-actions').innerHTML += `
                        <button class="edit-btn">Editar</button>
                        <button class="delete-btn">Excluir</button>`;
                }
                cardsContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            cardsContainer.innerHTML = `<p>ERRO: Não foi possível carregar os produtos.</p>`;
        }
    }

    // --- 6. EVENT LISTENERS GERAIS ---
    function setupEventListeners() {
        botaoLogout.addEventListener('click', async () => {
            await fetch('/logout', { method: 'POST', credentials: 'include' });
            currentUser = null;
            window.location.reload();
        });
        cardsContainer.addEventListener('click', handleCardClick);
        productForm.addEventListener('submit', handleFormSubmit);
        cancelEditBtn.addEventListener('click', resetForm);
        document.querySelectorAll('#tamanhos-pizza button').forEach(b => b.addEventListener('click', () => handleSizeSelection(b.dataset.tamanho)));
        btnAdicionarPizza.addEventListener('click', finalizePizza);
        botaoCarrinho.addEventListener('click', openCartModal);
        fecharCarrinhoBtn.addEventListener('click', () => carrinhoModal.style.display = 'none');
        btnCancelarPedidoModal.addEventListener('click', cancelarPedido);
        btnFinalizarPedidoModal.addEventListener('click', handleCheckout);
    }
    
    // --- 7. FUNÇÕES DO CRUD (GERENTE) ---
    async function handleFormSubmit(e) { /* ...código da resposta anterior... */ }
    function handleCardClick(e) { /* ...código da resposta anterior... */ }
    function resetForm() { /* ...código da resposta anterior... */ }

    // --- 8. FUNÇÕES DO CARRINHO E PEDIDO (LÓGICA DO CLIENTE) ---
    function handleSizeSelection(tamanho) { /* ...código da resposta anterior... */ }
    function addToOrder(sabor) { /* ...código da resposta anterior... */ }
    function removerSabor(sabor) { /* ...código da resposta anterior... */ }
    function finalizePizza() { /* ...código da resposta anterior... */ }
    function openCartModal() { /* ...código da resposta anterior... */ }
    function cancelarPedido() { /* ...código da resposta anterior... */ }
    function handleCheckout() { /* ...código da resposta anterior... */ }


    initializeApp();

});