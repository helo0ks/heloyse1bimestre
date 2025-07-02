document.getElementById("login-form").addEventListener("submit", async function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem-erro");
  mensagem.style.display = "none";

  try {
    const resposta = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok && dados.success) {
      // Salva os dados do usuário no localStorage
      localStorage.setItem("usuarioLogado", JSON.stringify({ nome: dados.nome, tipo: dados.tipo }));
      
      // **LÓGICA DE REDIRECIONAMENTO**
      const redirectTo = localStorage.getItem('redirectTo');
      if (redirectTo) {
        localStorage.removeItem('redirectTo'); // Limpa a flag
        window.location.href = redirectTo; // Volta para a página de pedido
      } else {
        window.location.href = "../proj/pedido.html"; // Caminho padrão
      }
    } else {
      mensagem.textContent = dados.message || "Erro ao fazer login.";
      mensagem.style.display = "block";
    }
  } catch (erro) {
    console.error("Erro ao conectar:", erro);
    mensagem.textContent = "Erro na conexão com o servidor.";
    mensagem.style.display = "block";
  }
});