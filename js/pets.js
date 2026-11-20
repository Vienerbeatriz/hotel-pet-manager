
const petForm = document.getElementById("petForm");
const petCards = document.getElementById("petCards");
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

// COMPRIMIR FOTO
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

// ATUALIZAR TUTORES
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

// CRIAR ELEMENTO COM TEXTO
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}

// CRIAR BOTÃO
function criarBotao(texto, classe, id) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;
    botao.className = classe;
    botao.dataset.id = id;

    return botao;
}

// ADICIONAR INFORMAÇÃO AO CARTÃO
function adicionarInformacao(container, titulo, valor) {
    const item = criarElemento("div", "pet-info-item");

    const label = criarElemento("small", "", titulo);
    const texto = criarElemento(
        "strong",
        "",
        valor || "Não informado"
    );

    item.append(label, texto);
    container.appendChild(item);
}

// CRIAR CARTÃO DO PET
function criarCartaoPet(pet) {

    const tutor = clientes.find(
        cliente => cliente.id === pet.tutorId
    );

    const cartao = criarElemento("article", "pet-card");
    cartao.dataset.id = pet.id;

    // CABEÇALHO
    const cabecalho = criarElemento(
        "div",
        "pet-card-cabecalho"
    );

    const principal = criarElemento(
        "div",
        "pet-card-principal"
    );

    // FOTO
    const areaFoto = criarElemento(
        "div",
        "pet-card-foto"
    );

    if (pet.foto) {
        const imagem = document.createElement("img");

        imagem.src = pet.foto;
        imagem.alt = `Foto de ${pet.nome}`;

        areaFoto.appendChild(imagem);
    } else {
        areaFoto.textContent =
            pet.especie === "Gato" ? "🐱" : "🐶";
    }

    // INFORMAÇÕES PRINCIPAIS
    const informacoes = criarElemento(
        "div",
        "pet-card-resumo"
    );

    const nome = criarElemento(
        "h3",
        "pet-card-nome",
        pet.nome
    );

    const especie = criarElemento(
        "p",
        "pet-card-especie",
        `${pet.especie || "Espécie não informada"} • ${pet.raca || "Raça não informada"}`
    );

    const tutorNome = criarElemento(
        "p",
        "pet-card-tutor",
        `👤 Tutor: ${tutor ? tutor.nome : "Tutor não encontrado"}`
    );

    informacoes.append(nome, especie, tutorNome);
    principal.append(areaFoto, informacoes);

    cabecalho.appendChild(principal);

    // DETALHES
    const detalhes = criarElemento(
        "div",
        "pet-card-detalhes"
    );

    detalhes.hidden = true;

    const tituloInformacoes = criarElemento(
        "h4",
        "",
        "Informações do pet"
    );

    const grade = criarElemento(
        "div",
        "pet-info-grid"
    );

    adicionarInformacao(grade, "Nome", pet.nome);
    adicionarInformacao(grade, "Espécie", pet.especie);
    adicionarInformacao(grade, "Raça", pet.raca);
    adicionarInformacao(grade, "Nascimento", pet.nascimento);
    adicionarInformacao(grade, "Sexo", pet.sexo);
    adicionarInformacao(grade, "Porte", pet.porte);
    adicionarInformacao(grade, "Castrado", pet.castrado);
    adicionarInformacao(grade, "Tutor", tutor ? tutor.nome : "Tutor não encontrado");

    const tituloSaude = criarElemento(
        "h4",
        "",
        "Saúde e cuidados"
    );

    const gradeSaude = criarElemento(
        "div",
        "pet-info-grid"
    );

    adicionarInformacao(gradeSaude, "Restrições alimentares", pet.alimentacao);
    adicionarInformacao(gradeSaude, "Problemas de saúde", pet.problemasSaude);
    adicionarInformacao(gradeSaude, "Vermífugo", pet.vermifugo);
    adicionarInformacao(gradeSaude, "Data do vermífugo", pet.dataVermifugo);
    adicionarInformacao(gradeSaude, "Antipulgas", pet.antipulgas);
    adicionarInformacao(gradeSaude, "Data do antipulgas", pet.dataAntipulgas);
    adicionarInformacao(gradeSaude, "Veterinário", pet.veterinario);
    adicionarInformacao(gradeSaude, "Telefone do veterinário", pet.telefoneVeterinario);

    const comportamento = criarElemento(
        "div",
        "pet-info-observacao"
    );

    comportamento.appendChild(
        criarElemento("strong", "", "Comportamento")
    );

    comportamento.appendChild(
        criarElemento(
            "p",
            "",
            pet.comportamento || "Não informado"
        )
    );

    const observacoes = criarElemento(
        "div",
        "pet-info-observacao"
    );

    observacoes.appendChild(
        criarElemento("strong", "", "Observações")
    );

    observacoes.appendChild(
        criarElemento(
            "p",
            "",
            pet.observacoes || "Nenhuma observação cadastrada."
        )
    );

    detalhes.append(
        tituloInformacoes,
        grade,
        tituloSaude,
        gradeSaude,
        comportamento,
        observacoes
    );

    // AÇÕES
    const acoes = criarElemento(
        "div",
        "pet-card-acoes"
    );

    const botaoLerMais = criarBotao(
        "Ler mais",
        "btn-ler-mais btn-detalhes-pet",
        pet.id
    );

    const botaoTrocarFoto = criarBotao(
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

    acoes.append(
        botaoLerMais,
        botaoTrocarFoto,
        inputTrocar
    );

    if (pet.foto) {
        const botaoRemoverFoto = criarBotao(
            "Remover foto",
            "btn-secondary btn-remover-foto",
            pet.id
        );

        acoes.appendChild(botaoRemoverFoto);
    }

    const botaoExcluir = criarBotao(
        "Excluir pet",
        "btn-delete",
        pet.id
    );

    acoes.appendChild(botaoExcluir);

    cartao.append(
        cabecalho,
        detalhes,
        acoes
    );

    return cartao;
}

// ATUALIZAR LISTAGEM
function atualizarPets() {

    petCards.innerHTML = "";

    petCount.textContent =
        `${pets.length} ${pets.length === 1 ? "pet" : "pets"}`;

    if (pets.length === 0) {
        const vazio = criarElemento(
            "p",
            "empty-table",
            "Nenhum pet cadastrado ainda."
        );

        petCards.appendChild(vazio);
        return;
    }

    pets.forEach(pet => {
        petCards.appendChild(criarCartaoPet(pet));
    });
}

// LIMPAR PRÉ-VISUALIZAÇÃO
function limparPreviewFoto() {
    campoFoto.value = "";
    previewFoto.src = "";
    previewFoto.style.display = "none";
    removerFotoPreview.style.display = "none";
}

// PRÉ-VISUALIZAÇÃO DA FOTO
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

// REMOVER FOTO ANTES DO CADASTRO
removerFotoPreview.addEventListener("click", function () {
    limparPreviewFoto();
});

// LIMPAR FORMULÁRIO
petForm.addEventListener("reset", function () {
    setTimeout(limparPreviewFoto, 0);
});

// CADASTRAR PET
petForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    clientes = carregarClientes();

    atualizarTutores();

    const tutorId = tutorSelect.value;

    const tutorExiste = clientes.some(
        cliente => cliente.id === tutorId
    );

    if (!tutorExiste) {
        alert("Cadastre um cliente antes de cadastrar um pet.");
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

// AÇÕES DOS CARTÕES
petCards.addEventListener("click", function(event) {

    const botaoLerMais = event.target.closest(".btn-detalhes-pet");
    const botaoTrocar = event.target.closest(".btn-trocar-foto");
    const botaoRemover = event.target.closest(".btn-remover-foto");
    const botaoExcluir = event.target.closest(".btn-delete");

    // LER MAIS
    if (botaoLerMais) {

        const cartao = botaoLerMais.closest(".pet-card");
        const detalhes = cartao.querySelector(".pet-card-detalhes");

        detalhes.hidden = !detalhes.hidden;

        botaoLerMais.textContent = detalhes.hidden
            ? "Ler mais"
            : "Mostrar menos";

        return;
    }

    // TROCAR FOTO
    if (botaoTrocar) {

        const cartao = botaoTrocar.closest(".pet-card");
        const input = cartao.querySelector(".input-trocar-foto");

        if (input) {
            input.click();
        }

        return;
    }

    // REMOVER FOTO
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

    // EXCLUIR PET
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

// TROCAR FOTO DE PET CADASTRADO
petCards.addEventListener("change", async function(event) {

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

// INICIALIZAÇÃO
atualizarTutores();
atualizarPets();

console.log("Módulo de pets iniciado com cartões!");
