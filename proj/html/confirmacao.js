document.addEventListener("DOMContentLoaded", () => {
    const detalhes = document.getElementById("pedido-detalhes");
    const sabores = JSON.parse(localStorage.getItem("sabores")) || [];
    const tamanho = localStorage.getItem("tamanhoPizza") || "Não definido";
  
    detalhes.innerHTML = `
      <p><strong>Tamanho:</strong> ${tamanho}</p>
      <p><strong>Sabores:</strong> ${sabores.join(", ")}</p>
    `;
  });
  
  function mostrarPagamento(tipo) {
    const area = document.getElementById("area-pagamento");
    const confirmacao = document.getElementById("confirmacao-final");
    confirmacao.style.display = "none";
    area.innerHTML = "";
  
    if (tipo === "pix") {
      area.innerHTML = '<p>Escaneie o QR Code abaixo para pagar:</p><canvas id="qrcode"></canvas>';
      QRCode.toCanvas(document.getElementById("qrcode"), "PIX CHAVE: 00000000000", error => {
        if (error) console.error(error);
      });
      setTimeout(confirmarPedido, 3000);
    } else if (tipo === "credito" || tipo === "debito") {
      area.innerHTML = `
        <p>Insira os dados do cartão:</p>
        <input type="text" placeholder="Número do cartão" /><br>
        <input type="text" placeholder="Validade (MM/AA)" /><br>
        <input type="text" placeholder="CVV" /><br>
        <button onclick="confirmarPedido()">Confirmar Pagamento</button>
      `;
    }
  }
  
  function confirmarPedido() {
    const confirmacao = document.getElementById("confirmacao-final");
    const codigo = "754" + Math.floor(Math.random() * 100000);
    document.getElementById("codigo-pedido").textContent = `Código do pedido: ${codigo}`;
    confirmacao.style.display = "block";
    document.getElementById("area-pagamento").style.display = "none";
  }
  