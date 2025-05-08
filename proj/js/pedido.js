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
    const btn = document.getElementById("adicionar-pizza");
    btn.disabled = !(tamanhoSelecionado && saboresSelecionados.length > 0);
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
    document.getElementById("finalizar-pedido").disabled = false;
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