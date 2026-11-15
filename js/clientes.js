
const form = document.getElementById("clientForm");
const clientTable = document.getElementById("clientTable");
const clientCount = document.getElementById("clientCount");

const STORAGE_KEY = "hotelPetClientes";

let clientes = [];

try {
    clientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch {
    clientes = [];
}

function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

function atualizarLista() {
    clientTable.innerHTML = "";

    clientCount.textContent =
        `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`;

    if (clientes.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 4;
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

        const telefone = document.createElement("td");
        telefone.textContent = cliente.telefone;

        const email = document.createElement("td");
        email.textContent = cliente.email || "Não informado";

        const acoes = document.createElement("td");

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.textContent = "Excluir";
        excluir.className = "btn-delete";
        excluir.dataset.id = cliente.id;

        acoes.appendChild(excluir);

        linha.append(nome, telefone, email, acoes);
        clientTable.appendChild(linha);
    });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const novoCliente = {
        id: Date.now().toString(),
        nome: document.getElementById("nome").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        email: document.getElementById("email").value.trim(),
        endereco: document.getElementById("endereco").value.trim(),
        observacoes: document.getElementById("observacoes").value.trim()
    };

    if (!novoCliente.nome || !novoCliente.telefone) {
        alert("Preencha o nome e o telefone do tutor.");
        return;
    }

    clientes.push(novoCliente);

    salvarDados();
    atualizarLista();

    form.reset();

    alert("Cliente cadastrado com sucesso!");
});

clientTable.addEventListener("click", function(event) {
    const botao = event.target.closest(".btn-delete");

    if (!botao) return;

    const id = botao.dataset.id;

    const confirmar = confirm("Deseja realmente excluir este cliente?");

    if (!confirmar) return;

    clientes = clientes.filter(cliente => cliente.id !== id);

    salvarDados();
    atualizarLista();
});

atualizarLista();

console.log("Módulo de clientes iniciado!");
