
const petForm = document.getElementById("petForm");
const petTable = document.getElementById("petTable");
const petCount = document.getElementById("petCount");
const tutorSelect = document.getElementById("petTutor");

const CLIENT_KEY = "hotelPetClientes";
const PET_KEY = "hotelPetAnimais";

function carregarClientes() {
    try {
        return JSON.parse(localStorage.getItem(CLIENT_KEY)) || [];
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

let clientes = carregarClientes();
let pets = carregarPets();

function atualizarTutores() {
    tutorSelect.innerHTML = "";

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione um tutor";
    tutorSelect.appendChild(opcaoInicial);

    clientes.forEach(cliente => {
        const opcao = document.createElement("option");
        opcao.value = cliente.id;
        opcao.textContent = cliente.nome;
        tutorSelect.appendChild(opcao);
    });

    tutorSelect.disabled = clientes.length === 0;
}

function atualizarPets() {
    petTable.innerHTML = "";

    petCount.textContent =
        `${pets.length} ${pets.length === 1 ? "pet" : "pets"}`;

    if (pets.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;
        celula.className = "empty-table";
        celula.textContent = "Nenhum pet cadastrado ainda.";

        linha.appendChild(celula);
        petTable.appendChild(linha);
        return;
    }

    pets.forEach(pet => {
        const tutor = clientes.find(
            cliente => cliente.id === pet.tutorId
        );

        const linha = document.createElement("tr");

        const nome = document.createElement("td");
        nome.textContent = pet.nome;

        const especie = document.createElement("td");
        especie.textContent = pet.especie;

        const raca = document.createElement("td");
        raca.textContent = pet.raca || "Não informada";

        const nomeTutor = document.createElement("td");
        nomeTutor.textContent = tutor
            ? tutor.nome
            : "Tutor não encontrado";

        const acoes = document.createElement("td");

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.textContent = "Excluir";
        excluir.className = "btn-delete";
        excluir.dataset.id = pet.id;

        acoes.appendChild(excluir);

        linha.append(nome, especie, raca, nomeTutor, acoes);

        petTable.appendChild(linha);
    });
}

petForm.addEventListener("submit", function(event) {
    event.preventDefault();

    clientes = carregarClientes();

    const tutorId = tutorSelect.value;

    const tutorExiste = clientes.some(
        cliente => cliente.id === tutorId
    );

    if (!tutorExiste) {
        alert("Cadastre um cliente antes de cadastrar um pet.");
        atualizarTutores();
        return;
    }

    const novoPet = {
        id: Date.now().toString(),
        nome: document.getElementById("petNome").value.trim(),
        tutorId: tutorId,
        especie: document.getElementById("petEspecie").value,
        raca: document.getElementById("petRaca").value.trim(),
        nascimento: document.getElementById("petNascimento").value,
        sexo: document.getElementById("petSexo").value,
        porte: document.getElementById("petPorte").value,
        alimentacao: document.getElementById("petAlimentacao").value.trim(),
        observacoes: document.getElementById("petObservacoes").value.trim()
    };

    pets.push(novoPet);

    localStorage.setItem(PET_KEY, JSON.stringify(pets));

    atualizarPets();
    petForm.reset();

    alert("Pet cadastrado com sucesso! 🐾");
});

petTable.addEventListener("click", function(event) {
    const botao = event.target.closest(".btn-delete");

    if (!botao) return;

    const confirmar = confirm(
        "Deseja realmente excluir este pet?"
    );

    if (!confirmar) return;

    pets = pets.filter(
        pet => pet.id !== botao.dataset.id
    );

    localStorage.setItem(PET_KEY, JSON.stringify(pets));

    atualizarPets();
});

atualizarTutores();
atualizarPets();

console.log("Módulo de pets iniciado!");
