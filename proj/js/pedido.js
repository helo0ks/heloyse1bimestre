const precosPizza = {
  "Atum": { broto: 30, media: 35, grande: 40 },
  "Frango com Cheddar": { broto: 32, media: 37, grande: 42 },
  "Portuguesa": { broto: 34, media: 39, grande: 44 },
  "Calabresa": { broto: 30, media: 35, grande: 40 },
  "Calabresa Especial": { broto: 35, media: 40, grande: 45 },
  "Margueritta": { broto: 33, media: 38, grande: 43 },
  "Estrogonoff de Carne": { broto: 37, media: 42, grande: 47 },
  "Frango com Catupiry": { broto: 37, media: 42, grande: 47 }
};

let tamanhoSelecionado = null;
let saboresSelecionados = [];

function atualizarPrecoTotal() {
  let total = 0;
  saboresSelecionados.forEach(sabor => {
    if (precosPizza[sabor] && tamanhoSelecionado) {
      total += precosPizza[sabor][tamanhoSelecionado];
    }
  });
  document.querySelector("#preco-total").textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function exibirSabores() {
  const lista = document.getElementById('lista-sabores');
  lista.innerHTML = "";
  saboresSelecionados.forEach(sabor => {
    const li = document.createElement('li');
    li.textContent = sabor;
    const btn = document.createElement('button');
    btn.textContent = "Remover";
    btn.onclick = () => removerSabor(sabor);
    li.appendChild(btn);
    lista.appendChild(li);
  });
}

function addToOrder(sabor) {
  if (!tamanhoSelecionado) {
    alert("Selecione o tamanho da pizza antes de adicionar sabores.");
    return;
  }
  const maxSabores = tamanhoSelecionado === "broto" ? 1 : 2;
  if (saboresSelecionados.length >= maxSabores) {
    alert(`Você só pode escolher até ${maxSabores} sabor(es) para uma pizza ${tamanhoSelecionado}.`);
    return;
  }
  if (!saboresSelecionados.includes(sabor)) {
    saboresSelecionados.push(sabor);
    exibirSabores();
    atualizarPrecoTotal();
    verificarFinalizar();
  }
}

function removerSabor(sabor) {
  saboresSelecionados = saboresSelecionados.filter(s => s !== sabor);
  exibirSabores();
  atualizarPrecoTotal();
  verificarFinalizar();
}

function verificarFinalizar() {
  const btnAdicionar = document.getElementById("adicionar-pizza");
  btnAdicionar.disabled = !(tamanhoSelecionado && saboresSelecionados.length > 0);

  // Também desabilita o botão finalizar pedido se a comanda estiver vazia
  const comanda = JSON.parse(localStorage.getItem("comandaFinal")) || [];
  const btnFinalizar = document.getElementById("finalizar-pedido");
  btnFinalizar.disabled = comanda.length === 0;
}

document.querySelectorAll('#tamanhos-pizza button').forEach(botao => {
  botao.addEventListener('click', () => {
    tamanhoSelecionado = botao.dataset.tamanho;
    document.getElementById('tamanho-pizza').textContent = tamanhoSelecionado.charAt(0).toUpperCase() + tamanhoSelecionado.slice(1);
    atualizarPrecoTotal();
    verificarFinalizar();
  });
});

function calcularPrecoTotal() {
  let total = 0;
  saboresSelecionados.forEach(sabor => {
    total += precosPizza[sabor][tamanhoSelecionado];
  });
  return total;
}

function finalizePizza() {
  if (!tamanhoSelecionado || saboresSelecionados.length === 0) {
    alert("Selecione o tamanho e ao menos um sabor.");
    return;
  }

  const pizza = {
    tamanho: tamanhoSelecionado,
    sabores: saboresSelecionados.map(sabor => ({
      sabor: sabor,
      preco: precosPizza[sabor][tamanhoSelecionado]
    })),
    preco: calcularPrecoTotal()
  };

  let comanda = JSON.parse(localStorage.getItem("comandaFinal")) || [];
  comanda.push(pizza);
  localStorage.setItem("comandaFinal", JSON.stringify(comanda));

  tamanhoSelecionado = null;
  saboresSelecionados = [];
  document.getElementById('tamanho-pizza').textContent = "Não definido";
  document.getElementById('preco-total').textContent = "0,00";
  document.getElementById('lista-sabores').innerHTML = "";
  document.getElementById("adicionar-pizza").disabled = true;
  verificarFinalizar();
}

function mostrarPagamento() {
  const comanda = JSON.parse(localStorage.getItem('comandaFinal')) || [];
  if (comanda.length === 0) return;

  const totalGeral = comanda.reduce((acc, pizza) => acc + pizza.preco, 0);
  const resumoSabores = comanda.map((pizza, index) => `Pizza ${index + 1} (${pizza.tamanho}): ${pizza.sabores.map(s => s.sabor).join(", ")}`).join(" | ");

  document.getElementById('resumo-tamanho').textContent = `${comanda.length} pizza(s)`;
  document.getElementById('resumo-sabores').textContent = resumoSabores;
  document.getElementById('resumo-total').textContent = totalGeral.toFixed(2);
  document.getElementById('pagamento').style.display = "block";
  window.scrollTo(0, document.body.scrollHeight);
}

function gerarPix() {
  const chave = "pix_" + Math.random().toString(36).substring(2, 10);
  const area = document.getElementById('pix-area');
  area.innerHTML = ""; // Limpa o conteúdo anterior

  // Esconde a mensagem do cartão
  const msgCartao = document.getElementById("mensagem-cartao");
  msgCartao.style.display = "none";
  msgCartao.textContent = "";

  // Gera o QR Code do PIX
  const canvas = document.createElement("canvas");
  QRCode.toCanvas(canvas, chave, (err) => {
    if (err) return console.error(err);
    canvas.style.width = "220px";
    canvas.style.height = "220px";
    area.appendChild(canvas);
  });

  const msgPix = document.createElement("p");
  msgPix.textContent = "Aguarde... Carregando seu PIX...";
  area.appendChild(msgPix);

  setTimeout(() => {
    msgPix.textContent = "Pagamento aprovado!";
    exibirConfirmacao();
  }, 3000);
}

function pagarCartao() {
  // Esconde o conteúdo do PIX, caso esteja visível
  const areaPix = document.getElementById("pix-area");
  areaPix.innerHTML = "";

  // Exibe a mensagem do cartão
  const msg = document.getElementById("mensagem-cartao");
  msg.textContent = "Aproxime ou insira seu cartão...";
  msg.style.display = "block";

  // Simula aprovação após 3 segundos
  setTimeout(() => {
    msg.textContent = "Pagamento aprovado!";
    exibirConfirmacao();
  }, 3000);
}

function exibirConfirmacao() {
  const codigo = "PED" + Math.floor(1000 + Math.random() * 9000);
  const comanda = JSON.parse(localStorage.getItem("comandaFinal")) || [];
  const total = comanda.reduce((acc, item) => acc + item.preco, 0);

  document.getElementById("codigo-pedido").textContent = `Código do pedido: ${codigo}`;
  document.getElementById("mensagem-confirmacao").textContent = `Seu pedido com ${comanda.length} pizza(s) foi confirmado!`;
  document.getElementById("agradecimento").textContent = `Total pago: R$ ${total.toFixed(2)}. Obrigado por comprar conosco!`;

  document.getElementById("pagamento").style.display = "none";
  document.getElementById("confirmacao").style.display = "block";
}

function cancelarPedido() {
  // Limpar dados do localStorage (toda a comanda)
  localStorage.removeItem("comandaFinal");

  // Resetar seleção atual
  tamanhoSelecionado = null;
  saboresSelecionados = [];

  document.getElementById('tamanho-pizza').textContent = "Não definido";
  document.getElementById('preco-total').textContent = "R$ 0,00";
  document.getElementById('lista-sabores').innerHTML = "";
  document.getElementById("adicionar-pizza").disabled = true;
  document.getElementById("finalizar-pedido").disabled = true;

  // Esconder e limpar a seção de pagamento
  const pagamento = document.getElementById('pagamento');
  if (pagamento) {
    pagamento.style.display = "none";
  }

  document.getElementById('resumo-tamanho').textContent = "";
  document.getElementById('resumo-sabores').textContent = "";
  document.getElementById('resumo-total').textContent = "";
  document.getElementById("mensagem-cartao").textContent = "Aproxime ou insira seu cartão...";
  document.getElementById("mensagem-cartao").style.display = "none";
  document.getElementById("pix-area").innerHTML = "";

  // Redirecionar para index.html
  window.location.href = "index.html";
}

document.getElementById("voltar-inicio").addEventListener("click", () => {
  localStorage.removeItem("comandaFinal");
  window.location.href = "index.html";
});

// --- Código para o modal do carrinho e botões fixos ---

function atualizarResumoCarrinho() {
  const comanda = JSON.parse(localStorage.getItem("comandaFinal")) || [];
  if (comanda.length === 0) {
    document.getElementById("resumo-carrinho").innerHTML = "<p>Seu carrinho está vazio.</p>";
    return;
  }

  let html = "<ul>";
  comanda.forEach((pizza, i) => {
    const sabores = pizza.sabores.map(s => s.sabor).join(", ");
    html += `<li><strong>Pizza ${i + 1} (${pizza.tamanho}):</strong> ${sabores} - R$ ${pizza.preco.toFixed(2)}</li>`;
  });
  html += `</ul><p><strong>Total: R$ ${comanda.reduce((acc, p) => acc + p.preco, 0).toFixed(2)}</strong></p>`;

  // Adiciona os botões Finalizar Pedido e Cancelar Pedido dentro do resumo do carrinho
  html += `
    <div style="margin-top: 15px; display: flex; justify-content: space-around;">
      <button id="finalizar-pedido" ${comanda.length === 0 ? "disabled" : ""}>Finalizar Pedido</button>
      <button id="cancelar-pedido">Cancelar Pedido</button>
    </div>
  `;

  document.getElementById("resumo-carrinho").innerHTML = html;

  // Adiciona os event listeners aos novos botões inseridos dinamicamente
  document.getElementById("finalizar-pedido").addEventListener("click", mostrarPagamento);
  document.getElementById("cancelar-pedido").addEventListener("click", cancelarPedido);
}

document.body.addEventListener("click", (e) => {
  if (e.target.id === "botao-carrinho") {
    atualizarResumoCarrinho();
    document.getElementById("carrinho-modal").style.display = "flex";
  }
  if (e.target.id === "botao-logout") {
    fetch("http://localhost:3001/logout", { method: "POST", credentials: "include" })
      .then(() => window.location.href = "index.html")
      .catch(() => window.location.href = "index.html");
  }
  if (e.target.id === "fechar-carrinho") {
    document.getElementById("carrinho-modal").style.display = "none";
  }
});


// --- seu código existente permanece igual acima ---

// Função para mostrar a tela de pagamento dentro do modal
function mostrarPagamentoNoModal() {
  const comanda = JSON.parse(localStorage.getItem("comandaFinal")) || [];
  if (comanda.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  // Atualiza resumo pagamento
  const totalGeral = comanda.reduce((acc, pizza) => acc + pizza.preco, 0);
  const resumoSabores = comanda.map((pizza, index) =>
    `Pizza ${index + 1} (${pizza.tamanho}): ${pizza.sabores.map(s => s.sabor).join(", ")}`
  ).join(" | ");

  document.getElementById('resumo-tamanho').textContent = `${comanda.length} pizza(s)`;
  document.getElementById('resumo-sabores').textContent = resumoSabores;
  document.getElementById('resumo-total').textContent = totalGeral.toFixed(2);

  // Esconder resumo do carrinho, mostrar pagamento e esconder botões do carrinho
  document.getElementById("resumo-carrinho").style.display = "none";
  document.getElementById("modal-pagamento").style.display = "block";
  document.getElementById("botoes-carrinho").style.display = "none";
}

// Atualiza o resumo do carrinho com os botões dentro do modal
function atualizarResumoCarrinho() {
  const comanda = JSON.parse(localStorage.getItem("comandaFinal")) || [];
  const resumo = document.getElementById("resumo-carrinho");

  if (comanda.length === 0) {
    resumo.innerHTML = "<p>Seu carrinho está vazio.</p>";
    document.getElementById("finalizar-pedido-modal").disabled = true;
  } else {
    let html = "<ul style='text-align:left; padding-left: 15px;'>";
    comanda.forEach((pizza, i) => {
      const sabores = pizza.sabores.map(s => s.sabor).join(", ");
      html += `<li><strong>Pizza ${i + 1} (${pizza.tamanho}):</strong> ${sabores} - R$ ${pizza.preco.toFixed(2)}</li>`;
    });
    html += `</ul><p><strong>Total: R$ ${comanda.reduce((acc, p) => acc + p.preco, 0).toFixed(2)}</strong></p>`;

    resumo.innerHTML = html;
    document.getElementById("finalizar-pedido-modal").disabled = false;
  }

  // Mostrar o resumo, esconder a área de pagamento e mostrar os botões
  resumo.style.display = "block";
  document.getElementById("modal-pagamento").style.display = "none";
  document.getElementById("botoes-carrinho").style.display = "block";
}

// Evento para abrir o modal do carrinho e atualizar resumo
document.getElementById("botao-carrinho").addEventListener("click", () => {
  document.getElementById("carrinho-modal").style.display = "flex";
  atualizarResumoCarrinho();
});

// Evento para fechar o modal
document.getElementById("fechar-carrinho").addEventListener("click", () => {
  document.getElementById("carrinho-modal").style.display = "none";
});

// Botão finalizar pedido dentro do modal: troca para tela de pagamento
document.getElementById("finalizar-pedido-modal").addEventListener("click", mostrarPagamentoNoModal);

// Botão cancelar pedido dentro do modal
document.getElementById("cancelar-pedido-modal").addEventListener("click", () => {
  cancelarPedido();
  document.getElementById("carrinho-modal").style.display = "none";
});

// Botão voltar para o resumo do carrinho na tela de pagamento
document.getElementById("voltar-para-carrinho").addEventListener("click", () => {
  atualizarResumoCarrinho();
});

// Seu restante do código (funções pagarCartao, gerarPix, exibirConfirmacao, cancelarPedido etc) permanece intacto.
// Mostrar ou esconder os botões "Login" e "Sair" conforme status de login
window.addEventListener('DOMContentLoaded', () => {
  const botaoLogin = document.getElementById("botao-login");
  const botaoLogout = document.getElementById("botao-logout");

  const usuarioLogado = localStorage.getItem("usuarioLogado");

  if (usuarioLogado) {
    // Usuário está logado: mostrar "Sair", esconder "Login"
    if (botaoLogout) botaoLogout.style.display = "inline-block";
    if (botaoLogin) botaoLogin.style.display = "none";
  } else {
    // Usuário não está logado: mostrar "Login", esconder "Sair"
    if (botaoLogin) botaoLogin.style.display = "inline-block";
    if (botaoLogout) botaoLogout.style.display = "none";
  }

  // Quando clicar em "Sair"
  if (botaoLogout) {
    botaoLogout.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      location.reload(); // Atualiza a página para refletir o novo estado
    });
  }
});
