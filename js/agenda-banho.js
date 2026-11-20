
const CLIENT_KEY = "hotelPetClientes";
const PET_KEY = "hotelPetAnimais";

const AGENDA_KEY = "petsitterAgendaBanho";
const PRECOS_KEY = "petsitterPrecosBanho";

const agendaForm = document.getElementById("agendaForm");
const agendaCards = document.getElementById("agendaCards");

const tutorSelect = document.getElementById("agendaTutor");
const petSelect = document.getElementById("agendaPet");

const servicoSelect = document.getElementById("agendaServico");
const porteSelect = document.getElementById("agendaPorte");
const valorInput = document.getElementById("agendaValor");

const avisoConfigPrecos = document.getElementById("avisoConfigPrecos");

const filtroData = document.getElementById("filtroData");
const filtroStatus = document.getElementById("filtroStatus");
const filtroBusca = document.getElementById("filtroBusca");

const labelClassificacao = document.getElementById("labelClassificacao");

const formaPagamentoInput = document.getElementById("agendaFormaPagamento");
const grupoParcelas = document.getElementById("grupoParcelas");
const parcelasInput = document.getElementById("agendaParcelas");

const camposPrecos = {
    banho: {
        pequeno: "banhoPequeno",
        medio: "banhoMedio",
        grande: "banhoGrande"
    },
    tosa: {
        pequeno: "tosaPequeno",
        medio: "tosaMedio",
        grande: "tosaGrande"
    },
    pelo: {
        curto: "peloPequeno",
        medio: "peloMedio",
        longo: "peloGrande"
    }
};

const precosPadrao = {
    banho: { pequeno: 0, medio: 0, grande: 0 },
    tosa: { pequeno: 0, medio: 0, grande: 0 },
    pelo: { curto: 0, medio: 0, longo: 0 }
};

// ==============================
// AMPLIAR FOTOS
// ==============================

let modalFotoBanho = null;

function criarModalFotoBanho() {
    if (modalFotoBanho) return;

    modalFotoBanho = document.createElement("div");
    modalFotoBanho.className = "foto-pet-modal";
    modalFotoBanho.setAttribute("aria-hidden", "true");

    const conteudo = document.createElement("div");
    conteudo.className = "foto-pet-modal-conteudo";

    const botaoFechar = document.createElement("button");
    botaoFechar.className = "foto-pet-modal-fechar";
    botaoFechar.type = "button";
    botaoFechar.textContent = "×";
    botaoFechar.setAttribute("aria-label", "Fechar imagem");

    const imagem = document.createElement("img");
    imagem.className = "foto-pet-modal-imagem";
    imagem.alt = "Foto ampliada do pet";

    conteudo.append(botaoFechar, imagem);
    modalFotoBanho.appendChild(conteudo);
    document.body.appendChild(modalFotoBanho);

    botaoFechar.addEventListener("click", fecharFotoBanho);

    modalFotoBanho.addEventListener("click", evento => {
        if (evento.target === modalFotoBanho) {
            fecharFotoBanho();
        }
    });
}

function abrirFotoBanho(src, nome) {
    if (!src || src.includes("logo-petsitter-transparente.png")) return;

    criarModalFotoBanho();

    const imagem = modalFotoBanho.querySelector(
        ".foto-pet-modal-imagem"
    );

    imagem.src = src;
    imagem.alt = `Foto ampliada de ${nome || "pet"}`;

    modalFotoBanho.classList.add("ativo");
    modalFotoBanho.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

function fecharFotoBanho() {
    if (!modalFotoBanho) return;

    modalFotoBanho.classList.remove("ativo");
    modalFotoBanho.setAttribute("aria-hidden", "true");

    modalFotoBanho.querySelector(
        ".foto-pet-modal-imagem"
    ).src = "";

    document.body.style.overflow = "";
}

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        fecharFotoBanho();
    }
});

// ==============================
// ARMAZENAMENTO
// ==============================

function carregarDados(chave, padrao = []) {
    try {
        return JSON.parse(localStorage.getItem(chave)) ?? padrao;
    } catch {
        return padrao;
    }
}

let clientes = carregarDados(CLIENT_KEY);
let pets = carregarDados(PET_KEY);
let agendamentos = carregarDados(AGENDA_KEY);
let precos = carregarDados(PRECOS_KEY, precosPadrao);

if (!Array.isArray(clientes)) clientes = [];
if (!Array.isArray(pets)) pets = [];
if (!Array.isArray(agendamentos)) agendamentos = [];

function salvarAgendamentos() {
    try {
        localStorage.setItem(AGENDA_KEY, JSON.stringify(agendamentos));
        return true;
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível salvar os agendamentos.");
        return false;
    }
}

function salvarPrecosStorage() {
    try {
        localStorage.setItem(PRECOS_KEY, JSON.stringify(precos));
        return true;
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível salvar a tabela de preços.");
        return false;
    }
}

// ==============================
// FORMATAÇÃO
// ==============================

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "-";

    const partes = data.split("-");
    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterNomeServico(servico) {
    const nomes = {
        banho: "Banho",
        tosa: "Tosa higiênica",
        pelo: "Tipo de pelo"
    };

    return nomes[servico] || servico || "-";
}

function obterNomePorte(classificacao) {
    const nomes = {
        pequeno: "Pequeno",
        medio: "Médio",
        grande: "Grande",
        curto: "Pelo curto",
        longo: "Pelo longo"
    };

    return nomes[classificacao] || classificacao || "-";
}

function normalizarPorte(porte) {
    if (!porte) return "";

    return String(porte)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// ==============================
// CLIENTES E PETS
// ==============================

function atualizarClientes() {
    clientes = carregarDados(CLIENT_KEY);

    if (!Array.isArray(clientes)) clientes = [];

    tutorSelect.innerHTML = "";

    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = "Selecione um tutor";

    tutorSelect.appendChild(inicial);

    clientes.forEach(cliente => {
        const opcao = document.createElement("option");
        opcao.value = cliente.id;
        opcao.textContent = cliente.nome;
        tutorSelect.appendChild(opcao);
    });
}

function atualizarPetsDoTutor() {
    pets = carregarDados(PET_KEY);

    if (!Array.isArray(pets)) pets = [];

    const tutorId = tutorSelect.value;

    petSelect.innerHTML = "";

    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = "Selecione um pet";

    petSelect.appendChild(inicial);

    const petsDoTutor = pets.filter(
        pet => String(pet.tutorId) === String(tutorId)
    );

    petsDoTutor.forEach(pet => {
        const opcao = document.createElement("option");
        opcao.value = pet.id;
        opcao.textContent = pet.nome;
        petSelect.appendChild(opcao);
    });

    petSelect.disabled = petsDoTutor.length === 0;

    if (petsDoTutor.length === 0 && tutorId) {
        inicial.textContent = "Este tutor não possui pets cadastrados";
    }

    porteSelect.value = "";
    atualizarValorAutomatico();
}

tutorSelect.addEventListener("change", atualizarPetsDoTutor);

// ==============================
// PREÇOS
// ==============================

function carregarPrecos() {
    const salvos = carregarDados(PRECOS_KEY, precosPadrao);
    const peloSalvo = salvos.pelo || {};

    precos = {
        banho: {
            ...precosPadrao.banho,
            ...(salvos.banho || {})
        },
        tosa: {
            ...precosPadrao.tosa,
            ...(salvos.tosa || {})
        },
        pelo: {
            curto: Number(peloSalvo.curto ?? peloSalvo.pequeno ?? 0),
            medio: Number(peloSalvo.medio ?? 0),
            longo: Number(peloSalvo.longo ?? peloSalvo.grande ?? 0)
        }
    };

    for (const servico in camposPrecos) {
        for (const classificacao in camposPrecos[servico]) {
            const id = camposPrecos[servico][classificacao];
            const campo = document.getElementById(id);

            if (campo) {
                campo.value = Number(precos[servico][classificacao] || 0);
            }
        }
    }

    atualizarAvisoPrecos();
}

function todosPrecosConfigurados() {
    for (const servico in camposPrecos) {
        for (const classificacao in camposPrecos[servico]) {
            const valor = Number(precos[servico][classificacao]);

            if (!Number.isFinite(valor) || valor <= 0) {
                return false;
            }
        }
    }

    return true;
}

function atualizarAvisoPrecos() {
    if (!avisoConfigPrecos) return;

    avisoConfigPrecos.style.display =
        todosPrecosConfigurados() ? "none" : "block";
}

function verificarCamposPrecos() {
    let existeValorZerado = false;

    for (const servico in camposPrecos) {
        for (const classificacao in camposPrecos[servico]) {
            const id = camposPrecos[servico][classificacao];
            const campo = document.getElementById(id);

            if (
                !campo ||
                campo.value.trim() === "" ||
                Number(campo.value) <= 0
            ) {
                existeValorZerado = true;
            }
        }
    }

    if (existeValorZerado) {
        avisoConfigPrecos.style.display = "block";
    } else {
        atualizarAvisoPrecos();
    }
}

for (const servico in camposPrecos) {
    for (const classificacao in camposPrecos[servico]) {
        const id = camposPrecos[servico][classificacao];
        const campo = document.getElementById(id);

        campo.addEventListener("input", verificarCamposPrecos);
    }
}

document.getElementById("salvarPrecos").addEventListener("click", function() {
    const novosPrecos = {
        banho: {},
        tosa: {},
        pelo: {}
    };

    for (const servico in camposPrecos) {
        for (const classificacao in camposPrecos[servico]) {
            const id = camposPrecos[servico][classificacao];
            const campo = document.getElementById(id);
            const valor = Number(campo.value);

            if (
                campo.value.trim() === "" ||
                !Number.isFinite(valor) ||
                valor <= 0
            ) {
                alert("Preencha os nove valores com preços maiores que zero.");
                campo.focus();
                return;
            }

            novosPrecos[servico][classificacao] = valor;
        }
    }

    const precosAnteriores = precos;
    precos = novosPrecos;

    if (!salvarPrecosStorage()) {
        precos = precosAnteriores;
        return;
    }

    atualizarAvisoPrecos();
    atualizarValorAutomatico();

    alert("Tabela de preços atualizada com sucesso! 🧡");
});

// ==============================
// CLASSIFICAÇÃO DO PET
// ==============================

function atualizarOpcoesClassificacao() {
    const tipoPelo = servicoSelect.value === "pelo";

    labelClassificacao.textContent = tipoPelo
        ? "Tipo de pelo *"
        : "Porte do pet *";

    if (tipoPelo) {
        porteSelect.innerHTML = `
            <option value="">Selecione o tipo de pelo</option>
            <option value="curto">Pelo curto</option>
            <option value="medio">Pelo médio</option>
            <option value="longo">Pelo longo</option>
        `;
    } else {
        porteSelect.innerHTML = `
            <option value="">Selecione o porte</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
        `;
    }

    atualizarValorAutomatico();
}

function obterPrecoAtual() {
    const servico = servicoSelect.value;
    const classificacao = porteSelect.value;

    if (!servico || !classificacao) return null;

    return Number(precos?.[servico]?.[classificacao] ?? 0);
}

function atualizarValorAutomatico() {
    const valor = obterPrecoAtual();

    valorInput.value = valor === null ? "" : valor.toFixed(2);
}

servicoSelect.addEventListener("change", atualizarOpcoesClassificacao);
porteSelect.addEventListener("change", atualizarValorAutomatico);

petSelect.addEventListener("change", function() {
    const pet = pets.find(
        item => String(item.id) === String(petSelect.value)
    );

    if (!pet || !pet.porte) return;
    if (servicoSelect.value === "pelo") return;

    const porte = normalizarPorte(pet.porte);

    if (["pequeno", "medio", "grande"].includes(porte)) {
        porteSelect.value = porte;
        atualizarValorAutomatico();
    }
});

// ==============================
// FORMA DE PAGAMENTO
// ==============================

function atualizarFormaPagamento() {
    const credito =
        formaPagamentoInput.value === "Cartão de crédito";

    grupoParcelas.classList.toggle("visivel", credito);
    parcelasInput.disabled = !credito;

    if (!credito) {
        parcelasInput.value = "1";
    }
}

formaPagamentoInput.addEventListener("change", atualizarFormaPagamento);

// ==============================
// CADASTRAR AGENDAMENTO
// ==============================

agendaForm.addEventListener("submit", function(event) {
    event.preventDefault();

    clientes = carregarDados(CLIENT_KEY);
    pets = carregarDados(PET_KEY);

    if (!Array.isArray(clientes)) clientes = [];
    if (!Array.isArray(pets)) pets = [];

    const tutorId = tutorSelect.value;
    const petId = petSelect.value;

    const tutor = clientes.find(
        item => String(item.id) === String(tutorId)
    );

    const pet = pets.find(
        item => String(item.id) === String(petId)
    );

    if (!tutor || !pet) {
        alert("Selecione um tutor e um pet válidos.");
        return;
    }

    if (String(pet.tutorId) !== String(tutor.id)) {
        alert("O pet selecionado não pertence a este tutor.");
        return;
    }

    if (!servicoSelect.value || !porteSelect.value) {
        alert("Selecione o serviço e sua classificação.");
        return;
    }

    const valor = Number(valorInput.value);

    if (
        !Number.isFinite(valor) ||
        valor < 0 ||
        valorInput.value.trim() === ""
    ) {
        alert("Informe um valor válido para o serviço.");
        return;
    }

    const data = document.getElementById("agendaData").value;
    const horario = document.getElementById("agendaHorario").value;

    if (!data || !horario) {
        alert("Informe a data e o horário do atendimento.");
        return;
    }

    const formaPagamento = formaPagamentoInput.value;
    const parcelas = Number(parcelasInput.value) || 1;

    if (
        formaPagamento === "Cartão de crédito" &&
        (parcelas < 1 || parcelas > 12)
    ) {
        alert("Selecione uma quantidade válida de parcelas.");
        parcelasInput.focus();
        return;
    }

    const novoAgendamento = {
        id: Date.now().toString(),

        tutorId: tutor.id,
        tutorNome: tutor.nome,

        petId: pet.id,
        petNome: pet.nome,

        servico: servicoSelect.value,
        porte: porteSelect.value,

        data,
        horario,
        valor,

        formaPagamento: formaPagamento || "",

        parcelasPagamento:
            formaPagamento === "Cartão de crédito" ? parcelas : 1,

        status: document.getElementById("agendaStatus").value,

        observacoes: document
            .getElementById("agendaObservacoes")
            .value.trim(),

        criadoEm: new Date().toISOString()
    };

    agendamentos.push(novoAgendamento);

    if (!salvarAgendamentos()) {
        agendamentos.pop();
        return;
    }

    atualizarAgenda();
    agendaForm.reset();

    atualizarOpcoesClassificacao();

    petSelect.innerHTML =
        '<option value="">Selecione um pet</option>';

    petSelect.disabled = true;

    atualizarFormaPagamento();

    alert("Agendamento cadastrado com sucesso! 🛁");
});

agendaForm.addEventListener("reset", function() {
    setTimeout(() => {
        atualizarOpcoesClassificacao();
        atualizarFormaPagamento();

        petSelect.innerHTML =
            '<option value="">Selecione um pet</option>';

        petSelect.disabled = true;
    }, 0);
});

// ==============================
// ELEMENTOS DOS CARTÕES
// ==============================

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
}

function adicionarInformacao(container, titulo, valor) {
    const item = criarElemento("div", "banho-info-item");

    item.append(
        criarElemento("span", "banho-info-label", titulo),
        criarElemento("strong", "banho-info-value", valor || "-")
    );

    container.appendChild(item);
}

function obterClassificacao(item) {
    let classificacao = item.porte;

    if (item.servico === "pelo") {
        const antigas = {
            pequeno: "curto",
            medio: "medio",
            grande: "longo"
        };

        classificacao = antigas[item.porte] || item.porte;
    }

    return obterNomePorte(classificacao);
}

function criarCartao(item) {
    const card = criarElemento("article", "banho-card");

    const pet = pets.find(
        registro => String(registro.id) === String(item.petId)
    );

    const cabecalho = criarElemento("div", "banho-card-header");
    const principal = criarElemento("div", "banho-card-principal");

    const foto = criarElemento("img", "banho-card-foto");
    foto.alt = item.petNome || "Pet";

    if (pet && pet.foto) {
        foto.src = pet.foto;

        foto.classList.add("pet-foto-ampliavel");
        foto.tabIndex = 0;
        foto.setAttribute("role", "button");
        foto.setAttribute(
            "aria-label",
            `Ampliar foto de ${item.petNome || "pet"}`
        );
        foto.title = "Clique para ampliar a foto";
    } else {
        foto.src = "img/logo-petsitter-transparente.png";
    }

    foto.onerror = () => {
        foto.onerror = null;
        foto.src = "img/logo-petsitter-transparente.png";
        foto.classList.remove("pet-foto-ampliavel");
        foto.removeAttribute("role");
        foto.removeAttribute("tabindex");
    };

    const identificacao = criarElemento("div", "banho-card-identificacao");

    identificacao.append(
        criarElemento("h3", "banho-card-nome", item.petNome || "Pet sem nome"),
        criarElemento("p", "banho-card-tutor", `Tutor: ${item.tutorNome || "-"}`)
    );

    principal.append(foto, identificacao);

    const statusClasse = {
        "Agendado": "banho-status-agendado",
        "Concluído": "banho-status-concluido",
        "Cancelado": "banho-status-cancelado"
    };

    const status = criarElemento(
        "span",
        `banho-status ${statusClasse[item.status] || "banho-status-agendado"}`,
        item.status || "Agendado"
    );

    cabecalho.append(principal, status);

    const resumo = criarElemento("div", "banho-card-resumo");

    adicionarInformacao(resumo, "Data", formatarData(item.data));
    adicionarInformacao(resumo, "Horário", item.horario);
    adicionarInformacao(resumo, "Serviço", obterNomeServico(item.servico));
    adicionarInformacao(resumo, "Valor", formatarMoeda(item.valor));

    const detalhes = criarElemento("div", "banho-card-detalhes");
    detalhes.hidden = true;

    const grade = criarElemento("div", "banho-info-grid");

    adicionarInformacao(grade, "Classificação", obterClassificacao(item));
    adicionarInformacao(
        grade,
        "Forma de pagamento",
        item.formaPagamento || "Ainda não foi pago"
    );
    adicionarInformacao(
        grade,
        "Parcelas",
        item.formaPagamento === "Cartão de crédito"
            ? `${Number(item.parcelasPagamento) || 1}x`
            : "-"
    );
    adicionarInformacao(grade, "Status", item.status || "Agendado");

    detalhes.appendChild(grade);

    const observacoes = criarElemento("div", "banho-observacoes");

    observacoes.append(
        criarElemento("strong", "", "Observações"),
        criarElemento(
            "p",
            "",
            item.observacoes || "Nenhuma observação registrada."
        )
    );

    detalhes.appendChild(observacoes);

    const acoes = criarElemento("div", "banho-card-acoes");

    const botaoDetalhes = criarElemento(
        "button",
        "btn-detalhes-banho",
        "Ler mais"
    );

    botaoDetalhes.type = "button";

    botaoDetalhes.addEventListener("click", () => {
        detalhes.hidden = !detalhes.hidden;
        botaoDetalhes.textContent = detalhes.hidden
            ? "Ler mais"
            : "Mostrar menos";
    });

    const botaoStatus = criarElemento(
        "button",
        "btn-status",
        "Alterar status"
    );

    botaoStatus.type = "button";
    botaoStatus.dataset.id = item.id;

    const botaoExcluir = criarElemento(
        "button",
        "btn-excluir-agenda",
        "Excluir"
    );

    botaoExcluir.type = "button";
    botaoExcluir.dataset.id = item.id;

    acoes.append(botaoDetalhes, botaoStatus, botaoExcluir);

    card.append(cabecalho, resumo, detalhes, acoes);

    return card;
}

// ==============================
// LISTAGEM E FILTROS
// ==============================

function atualizarAgenda() {
    agendaCards.innerHTML = "";

    agendamentos = carregarDados(AGENDA_KEY);

    if (!Array.isArray(agendamentos)) {
        agendamentos = [];
    }

    pets = carregarDados(PET_KEY);

    if (!Array.isArray(pets)) pets = [];

    const dataSelecionada = filtroData.value;
    const statusSelecionado = filtroStatus.value;
    const busca = normalizarTexto(filtroBusca?.value || "");

    const filtrados = agendamentos
        .filter(item => !dataSelecionada || item.data === dataSelecionada)
        .filter(item => !statusSelecionado || item.status === statusSelecionado)
        .filter(item => {
            if (!busca) return true;

            return (
                normalizarTexto(item.petNome).includes(busca) ||
                normalizarTexto(item.tutorNome).includes(busca)
            );
        })
        .sort((a, b) => {
            const dataA = `${a.data} ${a.horario}`;
            const dataB = `${b.data} ${b.horario}`;

            return dataA.localeCompare(dataB);
        });

    if (filtrados.length === 0) {
        const mensagem = busca || dataSelecionada || statusSelecionado
            ? "Nenhum agendamento encontrado para essa pesquisa."
            : "Nenhum agendamento cadastrado.";

        agendaCards.appendChild(
            criarElemento("p", "empty-table", mensagem)
        );
    } else {
        filtrados.forEach(item => {
            agendaCards.appendChild(criarCartao(item));
        });
    }

    atualizarResumo();
}

// ==============================
// RESUMO
// ==============================

function atualizarResumo() {
    const pendentes = agendamentos.filter(
        item => item.status === "Agendado"
    );

    const concluidos = agendamentos.filter(
        item => item.status === "Concluído"
    );

    document.getElementById("totalAgendamentos").textContent =
        agendamentos.length;

    document.getElementById("servicosPendentes").textContent =
        pendentes.length;

    document.getElementById("servicosConcluidos").textContent =
        concluidos.length;
}

// ==============================
// AMPLIAÇÃO DAS FOTOS NOS CARTÕES
// ==============================

agendaCards.addEventListener("click", function(event) {
    const foto = event.target.closest(".pet-foto-ampliavel");

    if (!foto) return;

    abrirFotoBanho(foto.src, foto.alt);
});

agendaCards.addEventListener("keydown", function(event) {
    const foto = event.target.closest(".pet-foto-ampliavel");

    if (
        foto &&
        (event.key === "Enter" || event.key === " ")
    ) {
        event.preventDefault();
        abrirFotoBanho(foto.src, foto.alt);
    }
});

// ==============================
// ALTERAR STATUS E EXCLUIR
// ==============================

agendaCards.addEventListener("click", function(event) {
    const botaoStatus = event.target.closest(".btn-status");
    const botaoExcluir = event.target.closest(".btn-excluir-agenda");

    if (botaoStatus) {
        const item = agendamentos.find(
            agendamento =>
                String(agendamento.id) === String(botaoStatus.dataset.id)
        );

        if (!item) return;

        const opcoes = ["Agendado", "Concluído", "Cancelado"];
        const atual = opcoes.indexOf(item.status);
        const proximo = opcoes[(atual + 1) % opcoes.length];

        const confirmar = confirm(
            `Deseja alterar o status de "${item.status}" para "${proximo}"?`
        );

        if (!confirmar) return;

        const anterior = item.status;
        item.status = proximo;

        if (!salvarAgendamentos()) {
            item.status = anterior;
            return;
        }

        atualizarAgenda();
        return;
    }

    if (botaoExcluir) {
        const confirmar = confirm(
            "Deseja realmente excluir este agendamento?"
        );

        if (!confirmar) return;

        const anteriores = agendamentos;

        agendamentos = agendamentos.filter(
            item => String(item.id) !== String(botaoExcluir.dataset.id)
        );

        if (!salvarAgendamentos()) {
            agendamentos = anteriores;
            return;
        }

        atualizarAgenda();
        alert("Agendamento excluído com sucesso.");
    }
});

// ==============================
// FILTROS
// ==============================

filtroData.addEventListener("change", atualizarAgenda);
filtroStatus.addEventListener("change", atualizarAgenda);

if (filtroBusca) {
    filtroBusca.addEventListener("input", atualizarAgenda);
}

// ==============================
// ATUALIZAÇÃO DE DADOS
// ==============================

window.addEventListener("storage", event => {
    if ([CLIENT_KEY, PET_KEY, AGENDA_KEY].includes(event.key)) {
        atualizarClientes();
        atualizarAgenda();
    }
});

// ==============================
// INICIALIZAÇÃO
// ==============================

atualizarClientes();
carregarPrecos();
atualizarOpcoesClassificacao();
atualizarFormaPagamento();
atualizarAgenda();

console.log("Agenda de Banho iniciada com sucesso!");
