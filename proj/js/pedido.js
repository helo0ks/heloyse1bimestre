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
  const carrinho = [];
  let formaPagamento = null;

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
      const response = await fetch('http://localhost:3001/check-auth', { credentials: 'include' });
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
      const response = await fetch('http://localhost:3001/produtos');
      if (!response.ok) throw new Error('Falha na resposta do servidor.');
      const products = await response.json();
      cardsContainer.innerHTML = '';
      precosPizza = {};
      products.forEach(p => {
        precosPizza[p.name] = {
          broto: parseFloat(p.price) - 5,
          media: parseFloat(p.price) - 2,
          grande: parseFloat(p.price)
        };
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
      await fetch('http://localhost:3001/logout', { method: 'POST', credentials: 'include' });
      currentUser = null;
      window.location.reload();
    });

    cardsContainer.addEventListener('click', handleCardClick);
    productForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetForm);
    document.querySelectorAll('#tamanhos-pizza button').forEach(b =>
      b.addEventListener('click', () => handleSizeSelection(b.dataset.tamanho))
    );
    btnAdicionarPizza.addEventListener('click', finalizePizza);
    botaoCarrinho.addEventListener('click', openCartModal);
    fecharCarrinhoBtn.addEventListener('click', () => carrinhoModal.style.display = 'none');
    btnCancelarPedidoModal.addEventListener('click', cancelarPedido);
    btnFinalizarPedidoModal.addEventListener('click', handleCheckout);
  }

  // --- 7. LÓGICA DE PEDIDO E CARRINHO ---
  function handleFormSubmit(e) {
    e.preventDefault();
    // CRUD do admin, não implementado aqui
  }

  function handleCardClick(e) {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;

    if (!tamanhoSelecionado) {
      alert('Escolha o tamanho da pizza antes de selecionar os sabores.');
      return;
    }

    const sabor = btn.dataset.productName;
    const limite = tamanhoSelecionado === 'broto' ? 1 : 2;

    if (saboresSelecionados.includes(sabor)) {
      saboresSelecionados = saboresSelecionados.filter(s => s !== sabor);
    } else {
      if (saboresSelecionados.length >= limite) {
        alert(`Você só pode escolher até ${limite} sabores.`);
        return;
      }
      saboresSelecionados.push(sabor);
    }

    atualizarSabores();
  }

  function handleSizeSelection(tamanho) {
    tamanhoSelecionado = tamanho;
    saboresSelecionados = [];
    tamanhoPizzaSpan.textContent = tamanho.charAt(0).toUpperCase() + tamanho.slice(1);
    precoTotalSpan.textContent = '0,00';
    listaSaboresUl.innerHTML = '';
    btnAdicionarPizza.disabled = true;
  }

  function atualizarSabores() {
    listaSaboresUl.innerHTML = saboresSelecionados.map(s => `<li>${s}</li>`).join('');

    if (saboresSelecionados.length === 0) {
      precoTotalSpan.textContent = '0,00';
      btnAdicionarPizza.disabled = true;
      return;
    }

    let soma = saboresSelecionados.reduce((acc, sabor) => acc + (precosPizza[sabor]?.[tamanhoSelecionado] || 0), 0);
    let precoFinal = soma;

    precoTotalSpan.textContent = precoFinal.toFixed(2).replace('.', ',');
    const limite = tamanhoSelecionado === 'broto' ? 1 : 2;
    btnAdicionarPizza.disabled = saboresSelecionados.length !== limite;
  }

  function finalizePizza() {
    let preco = precoTotalSpan.textContent.replace(',', '.');
    carrinho.push({
      tamanho: tamanhoSelecionado,
      sabores: [...saboresSelecionados],
      preco: parseFloat(preco)
    });

    alert('Pizza adicionada ao carrinho!');
    saboresSelecionados = [];
    tamanhoSelecionado = null;
    tamanhoPizzaSpan.textContent = 'Não definido';
    precoTotalSpan.textContent = '0,00';
    listaSaboresUl.innerHTML = '';
    btnAdicionarPizza.disabled = true;
  }

  function openCartModal() {
    if (carrinho.length === 0) {
      resumoCarrinhoDiv.innerHTML = '<p>Seu carrinho está vazio.</p>';
    } else {
      resumoCarrinhoDiv.innerHTML = carrinho.map((item, idx) => `
        <div>
          <h3>Pizza ${idx + 1} - ${item.tamanho}</h3>
          <p>Sabores: ${item.sabores.join(', ')}</p>
          <p>Preço: R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
        </div>
      `).join('');
    }

    carrinhoModal.style.display = 'block';
  }

  function cancelarPedido() {
    if (confirm("Tem certeza que deseja cancelar o pedido?")) {
      carrinho.length = 0;
      carrinhoModal.style.display = 'none';
      alert("Pedido cancelado.");
    }
  }

  function handleCheckout() {
    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    const pagamentoSelecionado = document.querySelector('input[name="pagamento"]:checked');
    if (!pagamentoSelecionado) {
      alert("Selecione uma forma de pagamento para finalizar o pedido.");
      return;
    }

    formaPagamento = pagamentoSelecionado.value;

    let total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    alert(`Pedido finalizado!\nTotal: R$ ${total.toFixed(2).replace('.', ',')}\nPagamento: ${formaPagamento}`);

    carrinho.length = 0;
    carrinhoModal.style.display = 'none';

    document.querySelectorAll('input[name="pagamento"]').forEach(r => r.checked = false);
  }

  function resetForm() {
    productIdInput.value = '';
    productNameInput.value = '';
    productPriceInput.value = '';
    productImageInput.value = '';
    cancelEditBtn.style.display = 'none';
  }

  // --- 8. INICIAR APP ---
  initializeApp();
});
