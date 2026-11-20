const form = document.getElementById("clientForm");
const clientCards = document.getElementById("clientCards");
const clientCount = document.getElementById("clientCount");

const STORAGE_KEY = "hotelPetClientes";
const PET_KEY = "hotelPetAnimais";

const campoCPF = document.getElementById("cpf");

let clientes = [];
let pets = [];

function carregarClientes() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function carregarPets() {
    try {
        return JSON.parse(localStorage.getItem(PET_KEY)) || [];
    } catch {
        return [];
    }
}

clientes = carregarClientes();
pets = carregarPets();

// ==============================
// ARMAZENAMENTO
// ==============================

function salvarDados() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(clientes)
        );

        return true;
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível salvar os dados dos clientes.");
        return false;
    }
}

// ==============================
// MÁSCARA DO CPF
// ==============================

campoCPF.addEventListener("input", function() {

    let cpf = this.value.replace(/\D/g, "");

    cpf = cpf.substring(0, 11);

    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    this.value = cpf;
});

// ==============================
// VALIDAÇÃO DO CPF
// ==============================

function validarCPF(cpf) {

    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let primeiroDigito = (soma * 10) % 11;

    if (primeiroDigito === 10) {
        primeiroDigito = 0;
    }

    if (primeiroDigito !== Number(cpf[9])) {
        return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    let segundoDigito = (soma * 10) % 11;

    if (segundoDigito === 10) {
        segundoDigito = 0;
    }

    return segundoDigito === Number(cpf[10]);
}

// ==============================
// FORMATAÇÃO
// ==============================

function formatarCPF(cpf) {

    if (!cpf) return "Não informado";

    const numeros = String(cpf).replace(/\D/g, "");

    if (numeros.length !== 11) return cpf;

    return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
    );
}

// ==============================
// ELEMENTOS DOS CARTÕES
// ==============================

function criarElemento(tag, classe, texto) {

    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto || "Não informado";
    }

    return elemento;
}

function adicionarInformacao(container, titulo, valor) {

    const item = criarElemento("div", "cliente-info-item");

    const nomeCampo = criarElemento(
        "strong",
        "cliente-info-label",
        titulo
    );

    const conteudo = criarElemento(
        "span",
        "cliente-info-value",
        valor || "Não informado"
    );

    item.append(nomeCampo, conteudo);
    container.appendChild(item);
}

// ==============================
// INFORMAÇÕES DOS PETS
// ==============================

function criarCartaoPet(pet) {

    const cartao = criarElemento("div", "cliente-pet-card");

    const cabecalho = criarElemento("div", "cliente-pet-header");

    const fotoArea = criarElemento("div", "cliente-pet-foto");

    if (pet.foto) {

        const imagem = document.createElement("img");

        imagem.src = pet.foto;
        imagem.alt = `Foto de ${pet.nome || "pet"}`;

        fotoArea.appendChild(imagem);

    } else {

        fotoArea.textContent = "🐶";

    }

    const identificacao = criarElemento(
        "div",
        "cliente-pet-identificacao"
    );

    identificacao.appendChild(
        criarElemento("h4", "", pet.nome || "Pet sem nome")
    );

    identificacao.appendChild(
        criarElemento(
            "span",
            "",
            `${pet.especie || "Espécie não informada"}${pet.raca ? " • " + pet.raca : ""}`
        )
    );

    cabecalho.append(fotoArea, identificacao);

    const informacoes = criarElemento(
        "div",
        "cliente-pet-informacoes"
    );

    adicionarInformacao(informacoes, "Espécie", pet.especie);
    adicionarInformacao(informacoes, "Raça", pet.raca);
    adicionarInformacao(informacoes, "Nascimento", pet.nascimento);
    adicionarInformacao(informacoes, "Sexo", pet.sexo);
    adicionarInformacao(informacoes, "Porte", pet.porte);
    adicionarInformacao(informacoes, "Castrado", pet.castrado);

    adicionarInformacao(
        informacoes,
        "Alimentação",
        pet.alimentacao
    );

    adicionarInformacao(
        informacoes,
        "Problemas de saúde",
        pet.problemasSaude
    );

    adicionarInformacao(
        informacoes,
        "Comportamento",
        pet.comportamento
    );

    adicionarInformacao(
        informacoes,
        "Vermífugo",
        pet.vermifugo
    );

    adicionarInformacao(
        informacoes,
        "Data do vermífugo",
        pet.dataVermifugo
    );

    adicionarInformacao(
        informacoes,
        "Antipulgas",
        pet.antipulgas
    );

    adicionarInformacao(
        informacoes,
        "Data do antipulgas",
        pet.dataAntipulgas
    );

    adicionarInformacao(
        informacoes,
        "Veterinário",
        pet.veterinario
    );

    adicionarInformacao(
        informacoes,
        "Telefone do veterinário",
        pet.telefoneVeterinario
    );

    adicionarInformacao(
        informacoes,
        "Observações do pet",
        pet.observacoes
    );

    cartao.append(cabecalho, informacoes);

    return cartao;
}

// ==============================
// CARTÃO DO CLIENTE
// ==============================

function criarCartaoCliente(cliente) {

    const petsDoCliente = pets.filter(
        pet => String(pet.tutorId) === String(cliente.id)
    );

    const cartao = criarElemento("article", "cliente-card");

    const cabecalho = criarElemento(
        "div",
        "cliente-card-cabecalho"
    );

    const informacoesPrincipais = criarElemento(
        "div",
        "cliente-card-principal"
    );

    const nome = criarElemento(
        "h3",
        "cliente-card-nome",
        cliente.nome
    );

    const telefone = criarElemento(
        "p",
        "cliente-card-telefone",
        `📞 ${cliente.telefone || "Telefone não informado"}`
    );

    const resumoPets = criarElemento(
        "p",
        "cliente-card-pets-resumo",
        petsDoCliente.length === 0
            ? "🐾 Nenhum pet cadastrado"
            : `🐾 ${petsDoCliente.length} ${petsDoCliente.length === 1 ? "pet cadastrado" : "pets cadastrados"}`
    );

    informacoesPrincipais.append(
        nome,
        telefone,
        resumoPets
    );

    const areaFoto = criarElemento(
        "div",
        "cliente-card-foto"
    );

    const petComFoto = petsDoCliente.find(pet => pet.foto);

    if (petComFoto) {

        const imagem = document.createElement("img");

        imagem.src = petComFoto.foto;
        imagem.alt = `Foto de ${petComFoto.nome}`;

        areaFoto.appendChild(imagem);

    } else {

        areaFoto.textContent = "🐶";

    }

    cabecalho.append(
        informacoesPrincipais,
        areaFoto
    );

    // Detalhes do cliente

    const detalhes = criarElemento(
        "div",
        "cliente-card-detalhes"
    );

    const tituloDados = criarElemento(
        "h4",
        "cliente-detalhes-titulo",
        "Informações do tutor"
    );

    const gradeInformacoes = criarElemento(
        "div",
        "cliente-info-grid"
    );

    adicionarInformacao(
        gradeInformacoes,
        "Nome completo",
        cliente.nome
    );

    adicionarInformacao(
        gradeInformacoes,
        "CPF",
        formatarCPF(cliente.cpf)
    );

    adicionarInformacao(
        gradeInformacoes,
        "Telefone",
        cliente.telefone
    );

    adicionarInformacao(
        gradeInformacoes,
        "E-mail",
        cliente.email
    );

    adicionarInformacao(
        gradeInformacoes,
        "Endereço",
        cliente.endereco
    );

    adicionarInformacao(
        gradeInformacoes,
        "Observações",
        cliente.observacoes
    );

    detalhes.append(tituloDados, gradeInformacoes);

    // Pets vinculados

    const tituloPets = criarElemento(
        "h4",
        "cliente-detalhes-titulo cliente-titulo-pets",
        "🐾 Animais deste tutor"
    );

    detalhes.appendChild(tituloPets);

    if (petsDoCliente.length === 0) {

        detalhes.appendChild(
            criarElemento(
                "p",
                "cliente-sem-pets",
                "Este tutor ainda não possui animais cadastrados."
            )
        );

    } else {

        const listaPets = criarElemento(
            "div",
            "cliente-pets-lista"
        );

        petsDoCliente.forEach(pet => {
            listaPets.appendChild(criarCartaoPet(pet));
        });

        detalhes.appendChild(listaPets);
    }

    detalhes.hidden = true;

    // Ações

    const rodape = criarElemento(
        "div",
        "cliente-card-acoes"
    );

    const botaoLerMais = criarElemento(
        "button",
        "btn-primary btn-ler-mais",
        "Ler mais"
    );

    botaoLerMais.type = "button";
    botaoLerMais.setAttribute("aria-expanded", "false");

    const botaoExcluir = criarElemento(
        "button",
        "btn-delete btn-excluir-cliente",
        "Excluir cliente"
    );

    botaoExcluir.type = "button";
    botaoExcluir.dataset.id = cliente.id;

    rodape.append(botaoLerMais, botaoExcluir);

    cartao.append(cabecalho, detalhes, rodape);

    return cartao;
}

// ==============================
// LISTAGEM DE CLIENTES
// ==============================

function atualizarLista() {

    clientes = carregarClientes();
    pets = carregarPets();

    clientCards.innerHTML = "";

    clientCount.textContent =
        `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`;

    if (clientes.length === 0) {

        const vazio = criarElemento(
            "div",
            "cliente-lista-vazia",
            "Nenhum cliente cadastrado ainda."
        );

        clientCards.appendChild(vazio);

        return;
    }

    clientes.forEach(cliente => {

        const cartao = criarCartaoCliente(cliente);

        clientCards.appendChild(cartao);

    });
}

// ==============================
// ABRIR E FECHAR CARTÕES
// ==============================

clientCards.addEventListener("click", function(event) {

    const botao = event.target.closest(".btn-ler-mais");

    if (!botao) return;

    const cartao = botao.closest(".cliente-card");

    if (!cartao) return;

    const detalhes = cartao.querySelector(
        ".cliente-card-detalhes"
    );

    const aberto = !detalhes.hidden;

    detalhes.hidden = aberto;

    botao.textContent = aberto
        ? "Ler mais"
        : "Mostrar menos";

    botao.setAttribute(
        "aria-expanded",
        String(!aberto)
    );

});

// ==============================
// CADASTRAR CLIENTE
// ==============================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const cpfDigitado = campoCPF.value.replace(/\D/g, "");

    const novoCliente = {

        id: Date.now().toString(),

        nome: document.getElementById("nome").value.trim(),

        cpf: cpfDigitado,

        telefone: document.getElementById("telefone").value.trim(),

        email: document.getElementById("email").value.trim(),

        endereco: document.getElementById("endereco").value.trim(),

        observacoes: document.getElementById("observacoes").value.trim()
    };

    if (!novoCliente.nome || !novoCliente.telefone) {

        alert("Preencha o nome e o telefone do tutor.");

        return;
    }

    if (!validarCPF(novoCliente.cpf)) {

        alert("Informe um CPF válido.");

        campoCPF.focus();

        return;
    }

    const cpfExistente = clientes.some(cliente => {

        const cpfSalvo = String(cliente.cpf || "").replace(/\D/g, "");

        return cpfSalvo === novoCliente.cpf;
    });

    if (cpfExistente) {

        alert("Este CPF já está cadastrado no sistema.");

        campoCPF.focus();

        return;
    }

    clientes.push(novoCliente);

    if (!salvarDados()) {
        clientes.pop();
        return;
    }

    atualizarLista();

    form.reset();

    alert("Cliente cadastrado com sucesso! 🧡");
});

// ==============================
// EXCLUIR CLIENTE
// ==============================

clientCards.addEventListener("click", function(event) {

    const botao = event.target.closest(".btn-excluir-cliente");

    if (!botao) return;

    const id = botao.dataset.id;

    const confirmar = confirm(
        "Deseja realmente excluir este cliente?"
    );

    if (!confirmar) return;

    const clientesAnteriores = clientes;

    clientes = clientes.filter(
        cliente => String(cliente.id) !== String(id)
    );

    if (!salvarDados()) {
        clientes = clientesAnteriores;
        return;
    }

    atualizarLista();
});

// ==============================
// INICIALIZAÇÃO
// ==============================

atualizarLista();

console.log("Módulo de clientes iniciado!");