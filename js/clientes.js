
import supabase from "./supabase.js";

const form = document.getElementById("clientForm");
const clientCards = document.getElementById("clientCards");
const clientCount = document.getElementById("clientCount");
const campoCPF = document.getElementById("cpf");

let clientes = [];
let pets = [];

let carregando = false;

// ==============================
// BUSCAR DADOS NO SUPABASE
// ==============================

async function carregarClientes() {
    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("id", { ascending: false });

    if (error) throw error;

    return data || [];
}

async function carregarPets() {
    const { data, error } = await supabase
        .from("pets")
        .select("*");

    if (error) throw error;

    return data || [];
}

async function carregarDados() {
    if (carregando) return;

    carregando = true;

    try {
        const [dadosClientes, dadosPets] = await Promise.all([
            carregarClientes(),
            carregarPets()
        ]);

        clientes = dadosClientes;
        pets = dadosPets;

        atualizarListaVisual();

    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        alert("Não foi possível carregar os dados do Supabase.");
    } finally {
        carregando = false;
    }
}

// ==============================
// AMPLIAR FOTOS DOS PETS
// ==============================

function criarModalFotoCliente() {
    let modal = document.getElementById("fotoPetModal");

    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "fotoPetModal";
    modal.className = "foto-pet-modal";
    modal.setAttribute("aria-hidden", "true");

    const conteudo = document.createElement("div");
    conteudo.className = "foto-pet-modal-conteudo";

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "foto-pet-modal-fechar";
    fechar.textContent = "×";
    fechar.setAttribute("aria-label", "Fechar foto");

    const imagem = document.createElement("img");
    imagem.className = "foto-pet-modal-imagem";
    imagem.alt = "Foto ampliada do pet";

    conteudo.append(fechar, imagem);
    modal.appendChild(conteudo);
    document.body.appendChild(modal);

    fechar.addEventListener("click", fecharFotoCliente);

    modal.addEventListener("click", function(event) {
        if (event.target === modal) {
            fecharFotoCliente();
        }
    });

    return modal;
}

function abrirFotoCliente(src, nome) {
    if (!src) return;

    const modal = criarModalFotoCliente();
    const imagem = modal.querySelector(".foto-pet-modal-imagem");

    imagem.src = src;
    imagem.alt = `Foto ampliada de ${nome}`;

    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

function fecharFotoCliente() {
    const modal = document.getElementById("fotoPetModal");

    if (!modal) return;

    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");

    modal.querySelector(".foto-pet-modal-imagem").src = "";

    document.body.style.overflow = "";
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        fecharFotoCliente();
    }
});

// ==============================
// MÁSCARA DO CPF
// ==============================

campoCPF.addEventListener("input", function() {
    let cpf = this.value.replace(/\D/g, "").substring(0, 11);

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

    if (primeiroDigito === 10) primeiroDigito = 0;

    if (primeiroDigito !== Number(cpf[9])) return false;

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    let segundoDigito = (soma * 10) % 11;

    if (segundoDigito === 10) segundoDigito = 0;

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

    if (classe) elemento.className = classe;

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

    // FOTO DO SUPABASE

    if (pet.foto_url) {
        const imagem = document.createElement("img");

        imagem.src = pet.foto_url;
        imagem.alt = `Foto de ${pet.nome || "pet"}`;
        imagem.classList.add("pet-foto-ampliavel");
        imagem.tabIndex = 0;
        imagem.setAttribute("role", "button");
        imagem.setAttribute("aria-label", `Ampliar foto de ${pet.nome || "pet"}`);
        imagem.title = "Clique para ampliar a foto";

        imagem.onerror = function() {
            this.onerror = null;
            this.style.display = "none";
            fotoArea.textContent = pet.especie === "Gato" ? "🐱" : "🐶";
        };

        fotoArea.appendChild(imagem);

    } else {
        fotoArea.textContent = pet.especie === "Gato" ? "🐱" : "🐶";
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

    // INFORMAÇÕES

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
    adicionarInformacao(informacoes, "Peso", pet.peso);
    adicionarInformacao(informacoes, "Alimentação", pet.alimentacao);
    adicionarInformacao(informacoes, "Problemas de saúde", pet.problemas_saude);
    adicionarInformacao(informacoes, "Comportamento", pet.comportamento);
    adicionarInformacao(informacoes, "Vermífugo", pet.vermifugo);
    adicionarInformacao(informacoes, "Data do vermífugo", pet.data_vermifugo);
    adicionarInformacao(informacoes, "Antipulgas", pet.antipulgas);
    adicionarInformacao(informacoes, "Data do antipulgas", pet.data_antipulgas);
    adicionarInformacao(informacoes, "Veterinário", pet.veterinario);
    adicionarInformacao(informacoes, "Telefone do veterinário", pet.telefone_veterinario);
    adicionarInformacao(informacoes, "Observações do pet", pet.observacoes);

    cartao.append(cabecalho, informacoes);

    return cartao;
}

// ==============================
// CARTÃO DO CLIENTE
// ==============================

function criarCartaoCliente(cliente) {

    // A tabela pets utiliza cliente_id

    const petsDoCliente = pets.filter(
        pet => String(pet.cliente_id) === String(cliente.id)
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

    informacoesPrincipais.append(nome, telefone, resumoPets);

    // FOTO DO PET NO CARTÃO DO CLIENTE

    const areaFoto = criarElemento(
        "div",
        "cliente-card-foto"
    );

    const petComFoto = petsDoCliente.find(
        pet => pet.foto_url
    );

    if (petComFoto) {
        const imagem = document.createElement("img");

        imagem.src = petComFoto.foto_url;
        imagem.alt = `Foto de ${petComFoto.nome}`;
        imagem.classList.add("pet-foto-ampliavel");
        imagem.tabIndex = 0;
        imagem.setAttribute("role", "button");
        imagem.setAttribute("aria-label", `Ampliar foto de ${petComFoto.nome}`);
        imagem.title = "Clique para ampliar a foto";

        imagem.onerror = function() {
            this.onerror = null;
            this.style.display = "none";
            areaFoto.textContent = "🐶";
        };

        areaFoto.appendChild(imagem);

    } else {
        areaFoto.textContent = "🐶";
    }

    cabecalho.append(informacoesPrincipais, areaFoto);

    // DETALHES DO CLIENTE

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

    adicionarInformacao(gradeInformacoes, "Nome completo", cliente.nome);
    adicionarInformacao(gradeInformacoes, "CPF", formatarCPF(cliente.cpf));
    adicionarInformacao(gradeInformacoes, "Telefone", cliente.telefone);
    adicionarInformacao(gradeInformacoes, "E-mail", cliente.email);
    adicionarInformacao(gradeInformacoes, "Endereço", cliente.endereco);
    adicionarInformacao(gradeInformacoes, "Observações", cliente.observacoes);

    detalhes.append(tituloDados, gradeInformacoes);

    // PETS DO TUTOR

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

    // BOTÕES

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
// LISTAGEM VISUAL
// ==============================

function atualizarListaVisual() {
    clientCards.innerHTML = "";

    clientCount.textContent =
        `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`;

    if (clientes.length === 0) {
        clientCards.appendChild(
            criarElemento(
                "div",
                "cliente-lista-vazia",
                "Nenhum cliente cadastrado ainda."
            )
        );

        return;
    }

    clientes.forEach(cliente => {
        clientCards.appendChild(
            criarCartaoCliente(cliente)
        );
    });
}

// ==============================
// EVENTOS DOS CARTÕES
// ==============================

clientCards.addEventListener("click", async function(event) {

    const imagem = event.target.closest(".pet-foto-ampliavel");

    if (imagem) {
        abrirFotoCliente(
            imagem.src,
            imagem.alt.replace("Foto de ", "")
        );

        return;
    }

    const botaoLerMais = event.target.closest(".btn-ler-mais");

    if (botaoLerMais) {
        const cartao = botaoLerMais.closest(".cliente-card");

        const detalhes = cartao.querySelector(
            ".cliente-card-detalhes"
        );

        const aberto = !detalhes.hidden;

        detalhes.hidden = aberto;

        botaoLerMais.textContent = aberto
            ? "Ler mais"
            : "Mostrar menos";

        botaoLerMais.setAttribute(
            "aria-expanded",
            String(!aberto)
        );

        return;
    }

    const botaoExcluir = event.target.closest(
        ".btn-excluir-cliente"
    );

    if (!botaoExcluir) return;

    const id = botaoExcluir.dataset.id;

    const confirmar = confirm(
        "Deseja realmente excluir este cliente?"
    );

    if (!confirmar) return;

    try {
        const { error } = await supabase
            .from("clientes")
            .delete()
            .eq("id", id);

        if (error) throw error;

        await carregarDados();

        alert("Cliente excluído com sucesso!");

    } catch (erro) {
        console.error("Erro ao excluir cliente:", erro);

        alert(
            "Não foi possível excluir o cliente. " +
            "Verifique se existem vínculos no banco de dados."
        );
    }
});

// ==============================
// ACESSIBILIDADE DAS FOTOS
// ==============================

clientCards.addEventListener("keydown", function(event) {

    const imagem = event.target.closest(
        ".pet-foto-ampliavel"
    );

    if (!imagem) return;

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        abrirFotoCliente(
            imagem.src,
            imagem.alt.replace("Foto de ", "")
        );
    }
});

// ==============================
// CADASTRAR CLIENTE
// ==============================

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const novoCliente = {
        nome: document.getElementById("nome").value.trim(),
        cpf: campoCPF.value.replace(/\D/g, ""),
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

    try {
        const { error } = await supabase
            .from("clientes")
            .insert([novoCliente]);

        if (error) throw error;

        await carregarDados();

        form.reset();

        alert("Cliente cadastrado com sucesso! 🧡");

    } catch (erro) {
        console.error("Erro ao cadastrar cliente:", erro);

        if (erro.code === "23505") {
            alert("Este CPF já está cadastrado no sistema.");
        } else {
            alert(
                "Não foi possível cadastrar o cliente. " +
                "Verifique a conexão e as permissões do banco."
            );
        }
    }
});

// ==============================
// INICIALIZAÇÃO
// ==============================

carregarDados();

console.log("Módulo de clientes conectado ao Supabase!");
