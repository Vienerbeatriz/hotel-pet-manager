const form = document.getElementById("clientForm");
const clientTable = document.getElementById("clientTable");
const clientCount = document.getElementById("clientCount");

const STORAGE_KEY = "hotelPetClientes";

const campoCPF = document.getElementById("cpf");

let clientes = [];

try {
    clientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch {
    clientes = [];
}

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
// LISTAGEM DE CLIENTES
// ==============================

function atualizarLista() {

    clientTable.innerHTML = "";

    clientCount.textContent =
        `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`;

    if (clientes.length === 0) {

        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 6;
        celula.className = "empty-table";
        celula.textContent = "Nenhum cliente cadastrado ainda.";

        linha.appendChild(celula);
        clientTable.appendChild(linha);

        return;
    }

    clientes.forEach(cliente => {

        const linha = document.createElement("tr");

        const nome = document.createElement("td");
        nome.textContent = cliente.nome;

        const cpf = document.createElement("td");
        cpf.textContent = formatarCPF(cliente.cpf);

        const telefone = document.createElement("td");
        telefone.textContent = cliente.telefone;

        const email = document.createElement("td");
        email.textContent = cliente.email || "Não informado";

        const endereco = document.createElement("td");
        endereco.textContent = cliente.endereco || "Não informado";

        const acoes = document.createElement("td");

        const excluir = document.createElement("button");

        excluir.type = "button";
        excluir.textContent = "Excluir";
        excluir.className = "btn-delete";
        excluir.dataset.id = cliente.id;

        acoes.appendChild(excluir);

        linha.append(
            nome,
            cpf,
            telefone,
            email,
            endereco,
            acoes
        );

        clientTable.appendChild(linha);
    });
}

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

clientTable.addEventListener("click", function(event) {

    const botao = event.target.closest(".btn-delete");

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