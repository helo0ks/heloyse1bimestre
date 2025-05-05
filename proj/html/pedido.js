document.addEventListener("DOMContentLoaded", () => {
    const listaSabores = document.getElementById("lista-sabores");
    const btnFinalizar = document.getElementById("finalizar-pedido");
  
    let saboresSelecionados = JSON.parse(localStorage.getItem("sabores")) || [];
    const tamanhoSelecionado = localStorage.getItem("tamanhoPizza");
    let maxSabores = 2;
  
    if (tamanhoSelecionado === "broto") {
      maxSabores = 1;
    }
  
    function atualizarLista() {
      listaSabores.innerHTML = "";
      saboresSelecionados.forEach((sabor, index) => {
        const li = document.createElement("li");
        li.textContent = sabor;
        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.onclick = () => {
          saboresSelecionados.splice(index, 1);
          localStorage.setItem("sabores", JSON.stringify(saboresSelecionados));
          atualizarLista();
          btnFinalizar.disabled = saboresSelecionados.length === 0;
        };
        li.appendChild(btnRemover);
        listaSabores.appendChild(li);
      });
    }
  
    atualizarLista();
  
    window.adicionarSabor = function(sabor) {
      if (saboresSelecionados.length >= maxSabores) {
        alert(`Você só pode selecionar até ${maxSabores} sabor(es) para este tamanho de pizza.`);
        return;
      }
      saboresSelecionados.push(sabor);
      localStorage.setItem("sabores", JSON.stringify(saboresSelecionados));
      atualizarLista();
      btnFinalizar.disabled = false;
    };
  
    window.voltar = function() {
      window.location.href = "menu.html";
    };
  
    window.finalizarPedido = function() {
      window.location.href = "confirmacao.html";
    };
  });
  