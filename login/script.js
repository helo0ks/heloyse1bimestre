// script.js

// Aguarda o envio do formulário de login
document.getElementById("login-form").addEventListener("submit", async function(event) {
  event.preventDefault(); // Impede o recarregamento da página

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem-erro");

  mensagem.style.display = "none";

  try {
    const resposta = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // necessário para usar cookies
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok && dados.success) {
      // ✅ Login deu certo, redireciona para a tela de pedidos
      window.location.href = "../proj/pedido.html";
    } else {
      // ❌ Login errado: mostra mensagem vinda do servidor
      mensagem.textContent = dados.message || "Erro ao fazer login.";
      mensagem.style.display = "block";
    }

  } catch (erro) {
    // ❌ Erro de rede ou servidor
    console.error("Erro ao conectar:", erro);
    mensagem.textContent = "Erro na conexão com o servidor.";
    mensagem.style.display = "block";
  }
});
