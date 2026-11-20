
const petForm = document.getElementById("petForm");
const petTable = document.getElementById("petTable");
const petCount = document.getElementById("petCount");
const tutorSelect = document.getElementById("petTutor");

const campoFoto = document.getElementById("petFoto");
const previewFoto = document.getElementById("petFotoPreview");
const removerFotoPreview = document.getElementById("removerPetFoto");

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

function salvarPets() {
    try {
        localStorage.setItem(PET_KEY, JSON.stringify(pets));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar pets:", erro);

        alert(
            "Não foi possível salvar as informações. " +
            "O armazenamento pode estar cheio. Tente usar uma foto menor."
        );

        return false;
    }
}

// Reduz a imagem antes de armazená-la
function comprimirFoto(arquivo) {
    return new Promise((resolve, reject) => {

        if (!arquivo.type.startsWith("image/")) {
            reject(new Error("Selecione um arquivo de imagem válido."));
            return;
        }

        if (arquivo.size > 8 * 1024 * 1024) {
            reject(new Error("A imagem deve ter no máximo 8 MB."));
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function () {

            const imagem = new Image();

            imagem.onload = function () {

                const limite = 700;

                let largura = imagem.width;
                let altura = imagem.height;

                if (largura > limite || altura > limite) {
                    const proporcao = Math.min(
                        limite / largura,
                        limite / altura
                    );

                    largura = Math.round(largura * proporcao);
                    altura = Math.round(altura * proporcao);
                }

                const canvas = document.createElement("canvas");

                canvas.width = largura;
                canvas.height = altura;

                const contexto = canvas.getContext("2d");

                contexto.fillStyle = "#FFFFFF";
                contexto.fillRect(0, 0, largura, altura);

                contexto.drawImage(
                    imagem,
                    0,
                    0,
                    largura,
                    altura
                );

                resolve(canvas.toDataURL("image/jpeg", 0.78));
            };

            imagem.onerror = function () {
                reject(new Error("Não foi possível carregar a imagem."));
            };

            imagem.src = leitor.result;
        };

        leitor.onerror = function () {
            reject(new Error("Erro ao ler a imagem."));
        };

        leitor.readAsDataURL(arquivo);
    });
}

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

function criarBotao(texto, classe, id) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;
    botao.className = classe;
    botao.dataset.id = id;

    return botao;
}

function atualizarPets() {
    petTable.innerHTML = "";

    petCount.textContent =
        `${pets.length} ${pets.length === 1 ? "pet" : "pets"}`;

    if (pets.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 6;
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

        // Nome
        const nome = document.createElement("td");
        nome.textContent = pet.nome;

        // Foto
        const foto = document.createElement("td");

        if (pet.foto) {
            const imagem = document.createElement("img");

            imagem.src = pet.foto;
            imagem.alt = `Foto de ${pet.nome}`;
            imagem.className = "foto-pet-tabela";

            foto.appendChild(imagem);
        } else {
            foto.textContent = "Sem foto";
        }

        // Espécie
        const especie = document.createElement("td");
        especie.textContent = pet.especie;

        // Raça
        const raca = document.createElement("td");
        raca.textContent = pet.raca || "Não informada";

        // Tutor
        const nomeTutor = document.createElement("td");

        nomeTutor.textContent = tutor
            ? tutor.nome
            : "Tutor não encontrado";

        // Ações
        const acoes = document.createElement("td");
        acoes.className = "acoes-pet";

        const botaoTrocar = criarBotao(
            "Trocar foto",
            "btn-secondary btn-trocar-foto",
            pet.id
        );

        const inputTrocar = document.createElement("input");

        inputTrocar.type = "file";
        inputTrocar.accept = "image/*";
        inputTrocar.className = "input-trocar-foto";
        inputTrocar.dataset.id = pet.id;
        inputTrocar.hidden = true;

        const botaoRemoverFoto = criarBotao(
            "Remover foto",
            "btn-secondary btn-remover-foto",
            pet.id
        );

        const botaoExcluir = criarBotao(
            "Excluir pet",
            "btn-delete",
            pet.id
        );

        acoes.append(
            botaoTrocar,
            inputTrocar
        );

        if (pet.foto) {
            acoes.appendChild(botaoRemoverFoto);
        }

        acoes.appendChild(botaoExcluir);

        linha.append(
            nome,
            foto,
            especie,
            raca,
            nomeTutor,
            acoes
        );

        petTable.appendChild(linha);
    });
}

// Limpar pré-visualização
function limparPreviewFoto() {
    campoFoto.value = "";
    previewFoto.src = "";
    previewFoto.style.display = "none";
    removerFotoPreview.style.display = "none";
}

// Pré-visualização da foto
campoFoto.addEventListener("change", function () {

    const arquivo = this.files[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
        alert("Selecione uma imagem válida.");
        limparPreviewFoto();
        return;
    }

    if (arquivo.size > 8 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 8 MB.");
        limparPreviewFoto();
        return;
    }

    const leitor = new FileReader();

    leitor.onload = function (evento) {
        previewFoto.src = evento.target.result;
        previewFoto.style.display = "block";
        removerFotoPreview.style.display = "inline-block";
    };

    leitor.readAsDataURL(arquivo);
});

// Remover foto antes de cadastrar
removerFotoPreview.addEventListener("click", function () {
    limparPreviewFoto();
});

// Limpar formulário e foto
petForm.addEventListener("reset", function () {
    setTimeout(limparPreviewFoto, 0);
});

// Cadastrar pet
petForm.addEventListener("submit", async function(event) {

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

    const botaoSalvar = petForm.querySelector(
        'button[type="submit"]'
    );

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    try {

        let foto = null;

        const arquivo = campoFoto.files[0];

        if (arquivo) {
            foto = await comprimirFoto(arquivo);
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

            castrado: document.getElementById("petCastrado").value,

            alimentacao: document.getElementById("petAlimentacao").value.trim(),

            problemasSaude: document.getElementById("petProblemasSaude").value.trim(),

            comportamento: document.getElementById("petComportamento").value.trim(),

            vermifugo: document.getElementById("petVermifugo").value,
            dataVermifugo: document.getElementById("petDataVermifugo").value,

            antipulgas: document.getElementById("petAntipulgas").value,
            dataAntipulgas: document.getElementById("petDataAntipulgas").value,

            veterinario: document.getElementById("petVeterinario").value.trim(),

            telefoneVeterinario: document.getElementById("petTelefoneVeterinario").value.trim(),

            observacoes: document.getElementById("petObservacoes").value.trim(),

            foto: foto
        };

        pets.push(novoPet);

        if (!salvarPets()) {
            pets.pop();
            return;
        }

        atualizarPets();

        petForm.reset();

        alert("Pet cadastrado com sucesso! 🐾");

    } catch (erro) {

        alert(erro.message || "Erro ao cadastrar o pet.");

    } finally {

        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Salvar pet";

    }
});

// Ações da tabela
petTable.addEventListener("click", function(event) {

    const botaoTrocar = event.target.closest(".btn-trocar-foto");
    const botaoRemover = event.target.closest(".btn-remover-foto");
    const botaoExcluir = event.target.closest(".btn-delete");

    // Abrir seleção de nova foto
    if (botaoTrocar) {
        const celula = botaoTrocar.closest("td");
        const input = celula.querySelector(".input-trocar-foto");

        if (input) {
            input.click();
        }

        return;
    }

    // Remover foto já cadastrada
    if (botaoRemover) {

        const confirmar = confirm(
            "Deseja remover a foto deste pet?"
        );

        if (!confirmar) return;

        const pet = pets.find(
            item => item.id === botaoRemover.dataset.id
        );

        if (!pet) return;

        const fotoAnterior = pet.foto;
        pet.foto = null;

        if (!salvarPets()) {
            pet.foto = fotoAnterior;
            return;
        }

        atualizarPets();

        alert("Foto removida com sucesso!");

        return;
    }

    // Excluir pet
    if (botaoExcluir) {

        const confirmar = confirm(
            "Deseja realmente excluir este pet?"
        );

        if (!confirmar) return;

        const petsAnteriores = pets;

        pets = pets.filter(
            pet => pet.id !== botaoExcluir.dataset.id
        );

        if (!salvarPets()) {
            pets = petsAnteriores;
            return;
        }

        atualizarPets();

        alert("Pet excluído com sucesso!");

    }
});

// Trocar foto de um pet já cadastrado
petTable.addEventListener("change", async function(event) {

    const input = event.target.closest(".input-trocar-foto");

    if (!input || !input.files[0]) return;

    const pet = pets.find(
        item => item.id === input.dataset.id
    );

    if (!pet) return;

    try {

        const novaFoto = await comprimirFoto(input.files[0]);

        const fotoAnterior = pet.foto;

        pet.foto = novaFoto;

        if (!salvarPets()) {
            pet.foto = fotoAnterior;
            return;
        }

        atualizarPets();

        alert("Foto atualizada com sucesso! 🐶");

    } catch (erro) {

        alert(erro.message || "Não foi possível atualizar a foto.");

    }
});

// Inicialização
atualizarTutores();
atualizarPets();

console.log("Módulo de pets iniciado!");
