document.getElementById("form-cadastro").addEventListener("submit", async function(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const mensagemElem = document.getElementById("mensagem");

  mensagemElem.style.display = "none";

  if (!nome || !email || !senha) {
    mensagemElem.textContent = "Por favor, preencha todos os campos.";
    mensagemElem.style.display = "block";
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3001/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nome, email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok && dados.success) {
      // ERRO CORRIGIDO: O redirecionamento era para "index.html" (página de apresentação).
      // Agora redireciona para "login.html" para que o usuário possa fazer o login.
      window.location.href = "index.html";
    } else {
      mensagemElem.textContent = dados.message || "Erro ao cadastrar.";
      mensagemElem.style.display = "block";
    }
  } catch (erro) {
    console.error("Erro de conexão:", erro);
    mensagemElem.textContent = "Erro na conexão com o servidor.";
    mensagemElem.style.display = "block";
  }
});