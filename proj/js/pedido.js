document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
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

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    // --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
    function initializeApp() {
        setupUI();
        fetchProducts();
        setupEventListeners();
    }

    // --- 1. CONFIGURAÇÃO DA INTERFACE (UI) ---
    function setupUI() {
        if (usuarioLogado) {
            botaoLogin.style.display = 'none';
            botaoLogout.style.display = 'inline-block';
            if (usuarioLogado.tipo === 'admin') {
                botaoAdmin.style.display = 'inline-block';
                managerPanel.style.display = 'block';
            }
        } else {
            botaoLogin.style.display = 'inline-block';
            botaoLogout.style.display = 'none';
            botaoAdmin.style.display = 'none';
            managerPanel.style.display = 'none';
        }
    }

    // --- 2. CARREGAR E EXIBIR PRODUTOS ---
    function fetchProducts() {
        fetch('http://localhost:3001/products')
            .then(res => res.json())
            .then(products => {
                cardsContainer.innerHTML = ''; // Limpa a área
                products.forEach(p => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.dataset.productId = p.id;

                    card.innerHTML = `
                        <img src="../${p.imageUrl}" alt="${p.name}" />
                        <div class="card-info">
                            <h3>${p.name}</h3>
                            <p class="price">R$ ${parseFloat(p.price).toFixed(2)}</p>
                            <button class="add-to-cart-btn" data-product-name="${p.name}">Adicionar</button>
                        </div>
                    `;

                    // Adiciona botões de CRUD se for gerente
                    if (usuarioLogado && usuarioLogado.tipo === 'admin') {
                        const adminActions = document.createElement('div');
                        adminActions.className = 'admin-actions';
                        adminActions.innerHTML = `
                            <button class="edit-btn">Editar</button>
                            <button class="delete-btn">Excluir</button>
                        `;
                        card.querySelector('.card-info').appendChild(adminActions);
                    }
                    cardsContainer.appendChild(card);
                });
            });
    }

    // --- 3. LÓGICA DE EVENTOS (EVENT LISTENERS) ---
    function setupEventListeners() {
        botaoLogout.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogado');
            location.reload();
        });

        // Event listener para o formulário do gerente (Adicionar/Editar)
        productForm.addEventListener('submit', handleFormSubmit);
        cancelEditBtn.addEventListener('click', resetForm);

        // Delegação de eventos para os botões nos cards
        cardsContainer.addEventListener('click', handleCardClick);
    }
    
    // --- 4. FUNÇÕES DO CRUD DO GERENTE ---
    function handleFormSubmit(e) {
        e.preventDefault();
        const productData = {
            name: productNameInput.value,
            price: productPriceInput.value,
            imageUrl: productImageInput.value
        };
        const id = productIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://localhost:3001/products/${id}` : 'http://localhost:3001/products';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        }).then(() => {
            resetForm();
            fetchProducts(); // Recarrega a lista de produtos
        });
    }

    function handleCardClick(e) {
        const target = e.target;
        const card = target.closest('.card');
        const id = card.dataset.productId;

        if (target.classList.contains('edit-btn')) {
            // Preenche o formulário para edição
            fetch(`http://localhost:3001/products`)
                .then(res => res.json())
                .then(products => {
                    const productToEdit = products.find(p => p.id === id);
                    if (productToEdit) {
                        productIdInput.value = productToEdit.id;
                        productNameInput.value = productToEdit.name;
                        productPriceInput.value = parseFloat(productToEdit.price).toFixed(2);
                        productImageInput.value = productToEdit.imageUrl;
                        cancelEditBtn.style.display = 'inline-block';
                        window.scrollTo(0, 0); // Rola para o topo onde está o formulário
                    }
                });
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                fetch(`http://localhost:3001/products/${id}`, { method: 'DELETE' })
                    .then(() => fetchProducts()); // Recarrega a lista
            }
        }
        
        if (target.classList.contains('add-to-cart-btn')) {
            // Lógica para adicionar ao carrinho (pode ser a sua função `addToOrder`)
            alert(`Produto "${target.dataset.productName}" adicionado ao carrinho!`);
            // Aqui você chamaria a lógica do seu carrinho que usa localStorage
        }
    }

    function resetForm() {
        productForm.reset();
        productIdInput.value = '';
        cancelEditBtn.style.display = 'none';
    }

    // --- 5. LÓGICA DO CLIENTE E CARRINHO ---
    // Cole aqui suas funções originais: addToOrder, removerSabor, finalizePizza,
    // mostrarPagamento, o event listener do botão de finalizar pedido com a verificação de login, etc.


    // --- INICIA A APLICAÇÃO ---
    initializeApp();
});