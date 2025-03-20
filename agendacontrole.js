let lista_atvd = [];
let d = '';
let atvd = null;

bloquear(true);
carregarlocalstorage();

function carregarlocalstorage() {
    const salvos = localStorage.getItem("agenda");
    if (salvos) {
        lista_atvd = JSON.parse(salvos);
        listar();
    }
}

function procurar_id(chave) {
    for (let i = 0; i < lista_atvd.length; i++) {
        const atvd = lista_atvd[i];
        if (atvd.id == chave) {
            atvd.posicaolista = i;
            return atvd;
        }
    }
    return null;
}

function procurar() {
    const id = document.getElementById("inputID").value;

    if (isNaN(id) || !Number.isInteger(Number(id))) {
        mostrar_aviso("Digite um número válido.");
        document.getElementById("inputID").focus();
        return;
    }

    if (id) {
        atvd = procurar_id(id);
        if (atvd) {
            dados(atvd);
            botoes('none', 'none', 'inline', 'inline', 'inline', 'inline');
            mostrar_aviso("Encontrado, altere ou exclua.");
        } else {
            limpar();
            botoes('inline', 'inline', 'none', 'none', 'none', 'none');
            mostrar_aviso("Não encontrado, insira.");
        }
    } else {
        document.getElementById("inputID").focus();
    }
}

function inserir() {
    bloquear(false);
    botoes('none', 'none', 'none', 'none', 'none', 'inline');
    d = 'inserindo';
    mostrar_aviso("Digite os atributos e salve.");
    document.getElementById("inputID").focus();
}

function alterar() {
    bloquear(false);
    botoes('none', 'none', 'none', 'none', 'none', 'inline');
    d = 'alterando';
    mostrar_aviso("Altere e salve.");
}

function excluir() {
    bloquear(false);
    botoes('none', 'none', 'none', 'none', 'none', 'inline');
    d = 'excluindo';
    mostrar_aviso("Salve para confirmar a exclusão.");
}

function excluirtudo() {
    bloquear(false);
    botoes('inline', 'none', 'none', 'none', 'none', 'none');
    const confirmacao = confirm("Tem certeza de que deseja excluir todas as atividades?");
    if (confirmacao) {
        lista_atvd = [];
        localStorage.removeItem("agenda");
        listar();
        limpar();
        mostrar_aviso("Todas as atividades foram excluídas.");
    }
}

function datas() {
    for (let i = 0; i < lista_atvd.length - 1; i++) {
        for (let j = 0; j < lista_atvd.length - 1 - i; j++) {
            const dataAtual = new Date(lista_atvd[j].entrega);
            const dataProxima = new Date(lista_atvd[j + 1].entrega);

            if (dataAtual > dataProxima) {
                const substituir = lista_atvd[j];
                lista_atvd[j] = lista_atvd[j + 1];
                lista_atvd[j + 1] = substituir;
            }
        }
    }
}

function verificarletras(materia, professor, atividade) {
    for (let i = 0; i < materia.length; i++) {
        if (!isNaN(materia[i]) && materia[i] !== ' ') {
            alert("O campo 'Matéria' deve conter apenas letras.");
            return false;
        }
    }

    for (let i = 0; i < professor.length; i++) {
        if (!isNaN(professor[i]) && professor[i] !== ' ') {
            alert("O campo 'Professor' deve conter apenas letras.");
            return false;
        }
    }

    for (let i = 0; i < atividade.length; i++) {
        if (!isNaN(atividade[i]) && atividade[i] !== ' ') {
            alert("O campo 'Atividade' deve conter apenas letras.");
            return false;
        }
    }

    return true;
}

function salvar() {
    let id = atvd ? atvd.id : parseInt(document.getElementById("inputID").value);
    const idExistente = lista_atvd.find(atvd => atvd.id === id);
    if (idExistente) {
        alert("Este ID já foi inserido. Por favor, insira um ID único.");
        return;
    }

    const materia = document.getElementById("inputmateria").value;
    const professor = document.getElementById("inputprofessor").value;
    const atividade = document.getElementById("inputatividade").value;
    const entrega = document.getElementById("inputentrega").value;

    if (!verificarletras(materia, professor, atividade)) {
        return;
    }

    if (id && materia && professor && atividade && entrega) {
        if (d === 'inserindo') {
            atvd = new Agenda(id, materia, professor, atividade, entrega);
            lista_atvd.push(atvd);
            mostrar_aviso("Inserido.");
        } else if (d === 'alterando') {
            const atvd_alterada = new Agenda(id, materia, professor, atividade, entrega);
            if (JSON.stringify(atvd_alterada) === JSON.stringify(atvd)) {
                alert("Altere os dados para salvar.");
            } else {
                lista_atvd[atvd.posicaolista] = atvd_alterada;
                mostrar_aviso("Alterado.");
            }
        } else if (d === 'excluindo') {
            lista_atvd = lista_atvd.filter((_, index) => index !== atvd.posicaolista);
            mostrar_aviso("Excluído");
        } else {
            mostrar_aviso("Erro.");
        }
        datas();
        salvarLocalStorage();
        botoes('inline', 'none', 'none', 'none', 'none', 'none');
        listar();
        limpar();
        document.getElementById("inputID").focus();
    } else {
        alert("Preencha todas as informações.");
    }
}

function salvarLocalStorage() {
    localStorage.setItem("agenda", JSON.stringify(lista_atvd));
}

function preparaListagem(vetor) {
    let texto = "";
    for (let i = 0; i < vetor.length; i++) {
        const linha = vetor[i];
        texto +=
            linha.id + " - " +
            linha.materia + " - " +
            linha.professor + " - " +
            linha.atividade + " - " +
            linha.entrega + "<br>";
    }
    return texto;
}

function listar() {
    document.getElementById("output").innerHTML = preparaListagem(lista_atvd);
}

function cancelar() {
    limpar();
    bloquear(true);
    botoes('inline', 'none', 'none', 'none', 'none', 'none');
    mostrar_aviso("Cancelou a operação de edição");
}

function mostrar_aviso(mensagem) {
    document.getElementById("aviso").innerHTML = mensagem;
}

function dados(atvd) {
    document.getElementById("inputID").value = atvd.id;
    document.getElementById("inputmateria").value = atvd.materia;
    document.getElementById("inputprofessor").value = atvd.professor;
    document.getElementById("inputatividade").value = atvd.atividade;
    document.getElementById("inputentrega").value = atvd.entrega;
    bloquear(true);
}

function limpar() {
    document.getElementById("inputmateria").value = "";
    document.getElementById("inputprofessor").value = "";
    document.getElementById("inputatividade").value = "";
    document.getElementById("inputentrega").value = "";
    bloquear(true);
}

function bloquear(leitura) {
    document.getElementById("inputID").readOnly = !leitura;
    document.getElementById("inputmateria").readOnly = leitura;
    document.getElementById("inputprofessor").readOnly = leitura;
    document.getElementById("inputatividade").readOnly = leitura;
    document.getElementById("inputentrega").readOnly = leitura;
}

function botoes(procurar, inserir, alterar, excluir, excluirtudo, salvar) {
    document.getElementById("procurar").style.display = procurar;
    document.getElementById("inserir").style.display = inserir;
    document.getElementById("alterar").style.display = alterar;
    document.getElementById("excluir").style.display = excluir;
    document.getElementById("excluirtudo").style.display = excluirtudo;
    document.getElementById("salvar").style.display = salvar;
    document.getElementById("cancelar").style.display = salvar;
    document.getElementById("inputID").focus();
}
