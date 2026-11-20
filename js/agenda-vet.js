
const CLIENT_KEY = "hotelPetClientes";
const PET_KEY = "hotelPetAnimais";
const VET_KEY = "petsitterAgendaVet";

const vetForm = document.getElementById("vetForm");
const vetTable = document.getElementById("vetTable");

const tutorSelect = document.getElementById("vetTutor");
const petSelect = document.getElementById("vetPet");

const categoriaSelect = document.getElementById("vetCategoria");
const procedimentoSelect = document.getElementById("vetProcedimento");
const outroInput = document.getElementById("vetOutro");
const grupoOutro = document.getElementById("grupoOutro");

const formaPagamentoInput = document.getElementById("vetFormaPagamento");
const grupoParcelas = document.getElementById("grupoParcelas");
const parcelasInput = document.getElementById("vetParcelas");

const filtroData = document.getElementById("filtroData");
const filtroBusca = document.getElementById("filtroBusca");
const filtroStatus = document.getElementById("filtroStatus");

// ==============================
// TIPOS DE EXAMES E PROCEDIMENTOS
// ==============================

const procedimentos = {
    Consulta: [
        "Consulta veterinária",
        "Consulta de rotina",
        "Consulta preventiva",
        "Consulta especializada",
        "Consulta dermatológica",
        "Consulta cardiológica",
        "Consulta oftalmológica",
        "Consulta odontológica",
        "Consulta ortopédica",
        "Consulta neurológica",
        "Consulta nutricional",
        "Consulta comportamental",
        "Retorno veterinário",
        "Avaliação clínica",
        "Avaliação pré-operatória",
        "Avaliação pós-operatória",
        "Atendimento de emergência",
        "Segunda opinião"
    ],

    Laboratorial: [
        "Hemograma completo",
        "Hemograma com pesquisa de hemoparasitas",
        "Hemoglobina",
        "Hematócrito",
        "Contagem de plaquetas",
        "Leucograma",
        "Glicemia",
        "Frutosamina",
        "Ureia",
        "Creatinina",
        "ALT / TGP",
        "AST / TGO",
        "Fosfatase alcalina",
        "GGT",
        "Bilirrubinas",
        "Albumina",
        "Proteínas totais e frações",
        "Colesterol",
        "Triglicerídeos",
        "Cálcio",
        "Fósforo",
        "Sódio",
        "Potássio",
        "Eletrólitos",
        "Dosagem hormonal",
        "T4 total",
        "T4 livre",
        "TSH",
        "Coagulograma",
        "Tempo de protrombina",
        "Tempo de tromboplastina",
        "Sorologia",
        "Cultura bacteriana",
        "Antibiograma",
        "Citologia",
        "Histopatológico",
        "Biópsia"
    ],

    Fezes: [
        "Exame parasitológico de fezes",
        "Coproparasitológico",
        "Pesquisa de giárdia",
        "Teste de antígeno para giárdia",
        "Pesquisa de sangue oculto nas fezes",
        "Coprocultura",
        "Pesquisa de protozoários",
        "Pesquisa de ovos e parasitas",
        "Exame de fezes seriado"
    ],

    Urina: [
        "Urinálise",
        "Exame de urina tipo 1",
        "EAS",
        "Urocultura",
        "Antibiograma de urina",
        "Relação proteína/creatinina urinária",
        "Sedimentoscopia urinária",
        "Densidade urinária",
        "Dosagem de proteína urinária"
    ],

    Pele: [
        "Raspado de pele",
        "Raspado cutâneo profundo",
        "Raspado cutâneo superficial",
        "Citologia dermatológica",
        "Pesquisa de fungos",
        "Cultura fúngica",
        "Pesquisa de ácaros",
        "Tricograma",
        "Biópsia de pele",
        "Histopatológico de pele",
        "Teste alérgico",
        "Cultura bacteriana de pele"
    ],

    Imagem: [
        "Ultrassonografia abdominal",
        "Ultrassonografia gestacional",
        "Ultrassonografia de órgãos",
        "Raio-X",
        "Raio-X de tórax",
        "Raio-X abdominal",
        "Raio-X ortopédico",
        "Tomografia computadorizada",
        "Ressonância magnética",
        "Endoscopia",
        "Colonoscopia"
    ],

    Cardiológico: [
        "Eletrocardiograma",
        "Ecocardiograma",
        "Holter",
        "Aferição de pressão arterial",
        "Avaliação cardiológica"
    ],

    Infeccioso: [
        "Teste de FIV",
        "Teste de FeLV",
        "Teste FIV/FeLV",
        "Teste para cinomose",
        "Teste para parvovirose",
        "Teste para leishmaniose",
        "Teste para erliquiose",
        "Teste para babesiose",
        "Teste para dirofilariose",
        "Teste rápido para doenças infecciosas",
        "Sorologia para doenças infecciosas",
        "PCR para agentes infecciosos"
    ],

    Procedimento: [
        "Coleta de sangue",
        "Coleta de urina",
        "Coleta de fezes",
        "Coleta de material para biópsia",
        "Curativo",
        "Limpeza de feridas",
        "Retirada de pontos",
        "Aplicação de medicamento",
        "Fluidoterapia",
        "Nebulização",
        "Limpeza dentária",
        "Extração dentária",
        "Procedimento odontológico",
        "Pequeno procedimento cirúrgico",
        "Cirurgia",
        "Internação",
        "Observação clínica",
        "Microchipagem"
    ],

    Vacina: [
        "Vacina antirrábica",
        "Vacina V8",
        "Vacina V10",
        "Vacina V4",
        "Vacina V5",
        "Vacina contra gripe canina",
        "Vacina contra giárdia",
        "Vacina contra leishmaniose",
        "Reforço vacinal",
        "Vermifugação",
        "Controle de ectoparasitas",
        "Aplicação de antipulgas",
        "Aplicação de carrapaticida"
    ],

    Outro: [
        "Outro exame ou procedimento"
    ]
};

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
let atendimentos = carregarDados(VET_KEY);

if (!Array.isArray(clientes)) clientes = [];
if (!Array.isArray(pets)) pets = [];
if (!Array.isArray(atendimentos)) atendimentos = [];

function salvarAtendimentos() {
    try {
        localStorage.setItem(VET_KEY, JSON.stringify(atendimentos));
        return true;
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível salvar os atendimentos veterinários.");
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

function criarCelula(texto) {
    const celula = document.createElement("td");
    celula.textContent = texto || "-";
    return celula;
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

    const valorAnterior = tutorSelect.value;

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

    if (clientes.some(c => String(c.id) === String(valorAnterior))) {
        tutorSelect.value = valorAnterior;
    }

    atualizarPetsDoTutor();
}

function atualizarPetsDoTutor() {
    pets = carregarDados(PET_KEY);

    if (!Array.isArray(pets)) pets = [];

    const tutorId = tutorSelect.value;
    const valorAnterior = petSelect.value;

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

    if (petsDoTutor.some(p => String(p.id) === String(valorAnterior))) {
        petSelect.value = valorAnterior;
    }

    if (petsDoTutor.length === 0 && tutorId) {
        inicial.textContent = "Este tutor não possui pets cadastrados";
    }
}

tutorSelect.addEventListener("change", atualizarPetsDoTutor);

// ==============================
// CATEGORIAS E PROCEDIMENTOS
// ==============================

function atualizarProcedimentos() {
    const categoria = categoriaSelect.value;

    procedimentoSelect.innerHTML = "";

    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = "Selecione o exame ou procedimento";

    procedimentoSelect.appendChild(inicial);

    const lista = procedimentos[categoria] || [];

    lista.forEach(nome => {
        const opcao = document.createElement("option");
        opcao.value = nome;
        opcao.textContent = nome;
        procedimentoSelect.appendChild(opcao);
    });

    procedimentoSelect.disabled = lista.length === 0;

    const outroSelecionado = categoria === "Outro";

    grupoOutro.classList.toggle("visivel", outroSelecionado);
    outroInput.required = outroSelecionado;

    if (!outroSelecionado) {
        outroInput.value = "";
    }
}

categoriaSelect.addEventListener("change", atualizarProcedimentos);

// ==============================
// PAGAMENTO
// ==============================

function atualizarFormaPagamento() {
    const credito = formaPagamentoInput.value === "Cartão de crédito";

    grupoParcelas.classList.toggle("visivel", credito);
    parcelasInput.disabled = !credito;

    if (!credito) {
        parcelasInput.value = "1";
    }
}

formaPagamentoInput.addEventListener("change", atualizarFormaPagamento);

// ==============================
// CADASTRAR ATENDIMENTO
// ==============================

vetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    clientes = carregarDados(CLIENT_KEY);
    pets = carregarDados(PET_KEY);

    if (!Array.isArray(clientes)) clientes = [];
    if (!Array.isArray(pets)) pets = [];

    const tutor = clientes.find(
        item => String(item.id) === String(tutorSelect.value)
    );

    const pet = pets.find(
        item => String(item.id) === String(petSelect.value)
    );

    if (!tutor || !pet) {
        alert("Selecione um tutor e um pet válidos.");
        return;
    }

    if (String(pet.tutorId) !== String(tutor.id)) {
        alert("O pet selecionado não pertence a este tutor.");
        return;
    }

    const categoria = categoriaSelect.value;
    const procedimentoSelecionado = procedimentoSelect.value;

    if (!categoria || !procedimentoSelecionado) {
        alert("Selecione a categoria e o exame ou procedimento.");
        return;
    }

    let procedimento = procedimentoSelecionado;

    if (categoria === "Outro") {
        procedimento = outroInput.value.trim();

        if (!procedimento) {
            alert("Descreva o exame ou procedimento.");
            outroInput.focus();
            return;
        }
    }

    const data = document.getElementById("vetData").value;
    const horario = document.getElementById("vetHorario").value;

    if (!data || !horario) {
        alert("Informe a data e o horário do atendimento.");
        return;
    }

    const valorTexto = document.getElementById("vetValor").value;
    const valor = valorTexto.trim() === "" ? 0 : Number(valorTexto);

    if (!Number.isFinite(valor) || valor < 0) {
        alert("Informe um valor válido.");
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

    const novoAtendimento = {
        id: Date.now().toString(),

        tutorId: tutor.id,
        tutorNome: tutor.nome,

        petId: pet.id,
        petNome: pet.nome,

        categoria,
        procedimento,

        veterinario: document.getElementById("vetVeterinario").value.trim(),
        clinica: document.getElementById("vetClinica").value.trim(),

        data,
        horario,
        valor,

        formaPagamento: formaPagamento || "",

        parcelasPagamento:
            formaPagamento === "Cartão de crédito" ? parcelas : 1,

        status: document.getElementById("vetStatus").value,

        resultado: document.getElementById("vetResultado").value.trim(),
        observacoes: document.getElementById("vetObservacoes").value.trim(),

        criadoEm: new Date().toISOString()
    };

    atendimentos.push(novoAtendimento);

    if (!salvarAtendimentos()) {
        atendimentos.pop();
        return;
    }

    atualizarAgenda();

    vetForm.reset();

    petSelect.innerHTML = '<option value="">Selecione um pet</option>';
    petSelect.disabled = true;

    procedimentoSelect.innerHTML =
        '<option value="">Selecione primeiro a categoria</option>';

    procedimentoSelect.disabled = true;

    grupoOutro.classList.remove("visivel");
    outroInput.required = false;

    atualizarFormaPagamento();

    alert("Atendimento veterinário cadastrado com sucesso! 🩺");
});

// ==============================
// LIMPAR FORMULÁRIO
// ==============================

vetForm.addEventListener("reset", function() {
    setTimeout(() => {
        atualizarProcedimentos();
        atualizarFormaPagamento();

        petSelect.innerHTML = '<option value="">Selecione um pet</option>';
        petSelect.disabled = true;
    }, 0);
});

// ==============================
// BOTÕES
// ==============================

function criarBotao(texto, classe, id) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;
    botao.className = classe;
    botao.dataset.id = id;

    return botao;
}

// ==============================
// LISTAGEM E FILTROS
// ==============================

function atualizarAgenda() {
    vetTable.innerHTML = "";

    atendimentos = carregarDados(VET_KEY);

    if (!Array.isArray(atendimentos)) {
        atendimentos = [];
    }

    const dataSelecionada = filtroData.value;
    const statusSelecionado = filtroStatus.value;
    const busca = normalizarTexto(filtroBusca.value);

    const filtrados = atendimentos
        .filter(item => !dataSelecionada || item.data === dataSelecionada)
        .filter(item => !statusSelecionado || item.status === statusSelecionado)
        .filter(item => {
            if (!busca) return true;

            const texto = normalizarTexto([
                item.petNome,
                item.tutorNome,
                item.categoria,
                item.procedimento,
                item.veterinario,
                item.clinica
            ].join(" "));

            return texto.includes(busca);
        })
        .sort((a, b) => {
            const dataA = `${a.data} ${a.horario}`;
            const dataB = `${b.data} ${b.horario}`;

            return dataA.localeCompare(dataB);
        });

    if (filtrados.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 11;
        celula.className = "empty-table";
        celula.textContent = "Nenhum atendimento encontrado.";

        linha.appendChild(celula);
        vetTable.appendChild(linha);
    }

    filtrados.forEach(item => {
        const linha = document.createElement("tr");

        linha.appendChild(criarCelula(formatarData(item.data)));
        linha.appendChild(criarCelula(item.horario));
        linha.appendChild(criarCelula(item.petNome));
        linha.appendChild(criarCelula(item.tutorNome));
        linha.appendChild(criarCelula(item.categoria));
        linha.appendChild(criarCelula(item.procedimento));
        linha.appendChild(criarCelula(item.veterinario));
        linha.appendChild(criarCelula(formatarMoeda(item.valor)));

        const pagamento = item.formaPagamento || "Não informado";

        const parcelas =
            item.formaPagamento === "Cartão de crédito"
                ? ` (${Number(item.parcelasPagamento) || 1}x)`
                : "";

        linha.appendChild(criarCelula(pagamento + parcelas));

        const celulaStatus = document.createElement("td");
        const status = document.createElement("span");

        status.className = "status-agenda";

        if (item.status === "Concluído") {
            status.classList.add("status-concluido");
        } else if (item.status === "Cancelado") {
            status.classList.add("status-cancelado");
        } else {
            status.classList.add("status-agendado");
        }

        status.textContent = item.status || "Agendado";

        celulaStatus.appendChild(status);
        linha.appendChild(celulaStatus);

        const celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes-agenda";

        const botaoStatus = criarBotao(
            "Alterar status",
            "btn-status",
            item.id
        );

        const botaoExcluir = criarBotao(
            "Excluir",
            "btn-excluir-agenda",
            item.id
        );

        celulaAcoes.append(botaoStatus, botaoExcluir);
        linha.appendChild(celulaAcoes);

        vetTable.appendChild(linha);
    });

    atualizarResumo();
}

// ==============================
// RESUMO
// ==============================

function atualizarResumo() {
    const pendentes = atendimentos.filter(
        item => item.status === "Agendado"
    );

    const concluidos = atendimentos.filter(
        item => item.status === "Concluído"
    );

    document.getElementById("totalAtendimentos").textContent =
        atendimentos.length;

    document.getElementById("atendimentosPendentes").textContent =
        pendentes.length;

    document.getElementById("atendimentosConcluidos").textContent =
        concluidos.length;
}

// ==============================
// ALTERAR STATUS E EXCLUIR
// ==============================

vetTable.addEventListener("click", function(event) {
    const botaoStatus = event.target.closest(".btn-status");
    const botaoExcluir = event.target.closest(".btn-excluir-agenda");

    if (botaoStatus) {
        const item = atendimentos.find(
            atendimento =>
                String(atendimento.id) === String(botaoStatus.dataset.id)
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

        if (!salvarAtendimentos()) {
            item.status = anterior;
            return;
        }

        atualizarAgenda();
        return;
    }

    if (botaoExcluir) {
        const confirmar = confirm(
            "Deseja realmente excluir este atendimento?"
        );

        if (!confirmar) return;

        const anteriores = atendimentos;

        atendimentos = atendimentos.filter(
            item => String(item.id) !== String(botaoExcluir.dataset.id)
        );

        if (!salvarAtendimentos()) {
            atendimentos = anteriores;
            return;
        }

        atualizarAgenda();

        alert("Atendimento excluído com sucesso.");
    }
});

// ==============================
// FILTROS
// ==============================

filtroData.addEventListener("change", atualizarAgenda);
filtroStatus.addEventListener("change", atualizarAgenda);
filtroBusca.addEventListener("input", atualizarAgenda);

// ==============================
// INICIALIZAÇÃO
// ==============================

atualizarClientes();
atualizarProcedimentos();
atualizarFormaPagamento();
atualizarAgenda();
