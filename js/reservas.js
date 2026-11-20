
const PET_KEY = "hotelPetAnimais";
const CLIENT_KEY = "hotelPetClientes";
const RESERVATION_KEY = "hotelPetReservas";
const HISTORICO_RESERVAS_KEY = "hotelPetHistoricoFinanceiroReservas";

const form = document.getElementById("reservationForm");
const petSelect = document.getElementById("reservaPet");
const tutorInput = document.getElementById("reservaTutor");
const entradaInput = document.getElementById("dataEntrada");
const saidaInput = document.getElementById("dataSaida");
const duracaoInput = document.getElementById("duracaoReserva");
const tipoCobranca = document.getElementById("tipoCobranca");
const valorInput = document.getElementById("valorReserva");
const labelValor = document.getElementById("labelValor");
const totalInput = document.getElementById("totalReserva");
const valorPagoInput = document.getElementById("valorPago");
const statusInput = document.getElementById("statusReserva");
const observacoesInput = document.getElementById("observacoesReserva");
const cards = document.getElementById("reservationCards");
const contador = document.getElementById("reservationCount");
const filtro = document.getElementById("filtroReservas");

const formaPagamentoInput = document.getElementById("formaPagamento");
const grupoParcelas = document.getElementById("grupoParcelas");
const parcelasInput = document.getElementById("parcelasPagamento");
const valorParcelaPreview = document.getElementById("valorParcelaPreview");

let pets = [];
let clientes = [];
let reservas = [];

// ==============================
// AMPLIAR FOTOS
// ==============================

let modalFotoReserva = null;

function criarModalFotoReserva() {
    if (modalFotoReserva) return;

    modalFotoReserva = document.createElement("div");
    modalFotoReserva.className = "foto-pet-modal";
    modalFotoReserva.setAttribute("aria-hidden", "true");

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
    modalFotoReserva.appendChild(conteudo);
    document.body.appendChild(modalFotoReserva);

    botaoFechar.addEventListener("click", fecharFotoReserva);

    modalFotoReserva.addEventListener("click", evento => {
        if (evento.target === modalFotoReserva) {
            fecharFotoReserva();
        }
    });
}

function abrirFotoReserva(src, nome) {
    if (!src || src.includes("logo-petsitter-transparente.png")) return;

    criarModalFotoReserva();

    const imagem = modalFotoReserva.querySelector(
        ".foto-pet-modal-imagem"
    );

    imagem.src = src;
    imagem.alt = `Foto ampliada de ${nome || "pet"}`;

    modalFotoReserva.classList.add("ativo");
    modalFotoReserva.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

function fecharFotoReserva() {
    if (!modalFotoReserva) return;

    modalFotoReserva.classList.remove("ativo");
    modalFotoReserva.setAttribute("aria-hidden", "true");

    const imagem = modalFotoReserva.querySelector(
        ".foto-pet-modal-imagem"
    );

    imagem.src = "";

    document.body.style.overflow = "";
}

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        fecharFotoReserva();
    }
});

// ==============================
// ARMAZENAMENTO
// ==============================

function lerDados(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarReservas() {
    try {
        localStorage.setItem(
            RESERVATION_KEY,
            JSON.stringify(reservas)
        );

        return true;
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível salvar as reservas.");
        return false;
    }
}

// ==============================
// DATAS E FORMATAÇÃO
// ==============================

function obterHoje() {
    const hoje = new Date();

    return [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, "0"),
        String(hoje.getDate()).padStart(2, "0")
    ].join("-");
}

function formatarData(data) {
    if (!data) return "-";

    return new Date(data + "T12:00:00")
        .toLocaleDateString("pt-BR");
}

function calcularDias(entrada, saida) {
    if (!entrada || !saida) return 0;

    const inicio = new Date(entrada + "T12:00:00");
    const fim = new Date(saida + "T12:00:00");

    return Math.round(
        (fim - inicio) / (1000 * 60 * 60 * 24)
    );
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
}

// ==============================
// VALORES DA RESERVA
// ==============================

function obterValorTotal(reserva) {
    if (
        reserva.valorTotal !== undefined &&
        reserva.valorTotal !== null &&
        reserva.valorTotal !== ""
    ) {
        return Math.max(0, Number(reserva.valorTotal) || 0);
    }

    const dias = calcularDias(reserva.entrada, reserva.saida);

    if (reserva.tipoCobranca === "total") {
        return Math.max(0, Number(reserva.valorInformado) || 0);
    }

    const diaria = Number(
        reserva.diaria ?? reserva.valorInformado
    ) || 0;

    return Math.max(0, diaria * dias);
}

function obterValorPago(reserva) {
    const total = obterValorTotal(reserva);
    const pago = Math.max(0, Number(reserva.valorPago) || 0);

    return Math.min(pago, total);
}

function obterStatusPagamento(reserva) {
    const total = obterValorTotal(reserva);
    const pago = obterValorPago(reserva);

    if (total <= 0) return "Não definido";
    if (pago >= total) return "Pago";
    if (pago > 0) return "Parcial";

    return "Pendente";
}

// ==============================
// CARREGAMENTO DOS DADOS
// ==============================

function carregarDados() {
    pets = lerDados(PET_KEY);
    clientes = lerDados(CLIENT_KEY);

    reservas = lerDados(RESERVATION_KEY).map(reserva => ({
        ...reserva,
        valorPago: Math.max(0, Number(reserva.valorPago) || 0),
        formaPagamento: reserva.formaPagamento || "",
        parcelasPagamento: Math.max(
            1,
            Number(reserva.parcelasPagamento) || 1
        )
    }));

    carregarPets();
    atualizarCards();
}

function carregarPets() {
    petSelect.innerHTML = `
        <option value="">Selecione o animal</option>
    `;

    pets.forEach(pet => {
        const option = document.createElement("option");

        option.value = pet.id;
        option.textContent = pet.nome;

        petSelect.appendChild(option);
    });
}

function buscarTutor(pet) {
    if (!pet) return null;

    return clientes.find(cliente =>
        String(cliente.id) === String(pet.tutorId)
    );
}

petSelect.addEventListener("change", () => {
    const pet = pets.find(p =>
        String(p.id) === String(petSelect.value)
    );

    const tutor = buscarTutor(pet);

    tutorInput.value = tutor ? tutor.nome : "";
});

// ==============================
// CÁLCULO DE DIAS E TOTAL
// ==============================

function atualizarDuracao() {
    const entrada = entradaInput.value;
    const saida = saidaInput.value;

    if (!entrada || !saida) {
        duracaoInput.value = "0 dias";
        atualizarTotal();
        return;
    }

    const dias = calcularDias(entrada, saida);

    duracaoInput.value = dias > 0
        ? `${dias} ${dias === 1 ? "dia" : "dias"}`
        : "Data inválida";

    atualizarTotal();
}

function obterTotalDoFormulario() {
    const dias = calcularDias(
        entradaInput.value,
        saidaInput.value
    );

    const valor = Number(valorInput.value) || 0;

    if (dias <= 0) return 0;

    return tipoCobranca.value === "diaria"
        ? valor * dias
        : valor;
}

function atualizarTotal() {
    const total = obterTotalDoFormulario();

    totalInput.value = formatarMoeda(total);
    valorPagoInput.max = total.toFixed(2);

    atualizarPreviewParcelas();
}

entradaInput.addEventListener("change", atualizarDuracao);
saidaInput.addEventListener("change", atualizarDuracao);
valorInput.addEventListener("input", atualizarTotal);

tipoCobranca.addEventListener("change", () => {
    labelValor.textContent =
        tipoCobranca.value === "diaria"
            ? "Valor por diária (R$)"
            : "Valor total da hospedagem (R$)";

    atualizarTotal();
});

// ==============================
// FORMA DE PAGAMENTO
// ==============================

function atualizarFormaPagamento() {
    const credito = formaPagamentoInput.value === "Cartão de crédito";

    grupoParcelas.classList.toggle("visivel", credito);

    parcelasInput.required = credito;

    atualizarPreviewParcelas();
}

function atualizarPreviewParcelas() {
    const valorPago = Number(valorPagoInput.value) || 0;
    const valorTotal = obterTotalDoFormulario();
    const parcelas = Number(parcelasInput.value) || 1;

    if (formaPagamentoInput.value !== "Cartão de crédito") {
        valorParcelaPreview.textContent = "Valor por parcela: R$ 0,00";
        return;
    }

    const valorBase = valorPago > 0 ? valorPago : valorTotal;
    const valorParcela = valorBase / parcelas;

    valorParcelaPreview.textContent =
        `Valor por parcela: ${formatarMoeda(valorParcela)}`;
}

formaPagamentoInput.addEventListener(
    "change",
    atualizarFormaPagamento
);

valorPagoInput.addEventListener("input", () => {
    atualizarFormaPagamento();
});

parcelasInput.addEventListener(
    "change",
    atualizarPreviewParcelas
);

// ==============================
// SITUAÇÃO DA RESERVA
// ==============================

function identificarSituacao(reserva, hoje) {
    if (reserva.status === "Pendente") {
        return "Pendente";
    }

    if (reserva.entrada > hoje) {
        return "Futura";
    }

    if (reserva.entrada <= hoje && reserva.saida > hoje) {
        return "Em andamento";
    }

    return "Finalizada";
}

// ==============================
// CRIAR RESERVA
// ==============================

function salvarNovaReserva(evento) {
    evento.preventDefault();

    const pet = pets.find(p =>
        String(p.id) === String(petSelect.value)
    );

    const tutor = buscarTutor(pet);

    if (!pet || !tutor) {
        alert("Selecione um animal com tutor cadastrado.");
        return;
    }

    const entrada = entradaInput.value;
    const saida = saidaInput.value;
    const dias = calcularDias(entrada, saida);

    const valor = Number(valorInput.value);
    const valorPago = Number(valorPagoInput.value) || 0;

    if (!entrada || !saida || dias <= 0) {
        alert("A data de saída precisa ser posterior à data de entrada.");
        return;
    }

    if (
        !Number.isFinite(valor) ||
        valor < 0 ||
        valorInput.value.trim() === ""
    ) {
        alert("Informe um valor válido para a hospedagem.");
        return;
    }

    const valorTotal = tipoCobranca.value === "diaria"
        ? valor * dias
        : valor;

    if (!Number.isFinite(valorPago) || valorPago < 0) {
        alert("Informe um valor pago válido.");
        return;
    }

    if (valorPago > valorTotal) {
        alert("O valor pago não pode ser maior que o valor total da reserva.");
        return;
    }

    const formaPagamento = formaPagamentoInput.value;

    if (valorPago > 0 && !formaPagamento) {
        alert("Selecione a forma de pagamento do valor recebido.");
        formaPagamentoInput.focus();
        return;
    }

    const parcelas = Number(parcelasInput.value) || 1;

    if (
        formaPagamento === "Cartão de crédito" &&
        (parcelas < 1 || parcelas > 12)
    ) {
        alert("Selecione uma quantidade válida de parcelas.");
        parcelasInput.focus();
        return;
    }

    const novaReserva = {
        id: Date.now(),
        dataReserva: obterHoje(),

        petId: pet.id,
        petNome: pet.nome,
        tutorNome: tutor.nome,

        entrada,
        saida,
        dias,

        tipoCobranca: tipoCobranca.value,
        valorInformado: valor,
        diaria: tipoCobranca.value === "diaria" ? valor : 0,
        valorTotal,

        valorPago,

        dataPagamento: valorPago > 0 && formaPagamento
            ? obterHoje()
            : "",

        formaPagamento: formaPagamento,

        parcelasPagamento:
            formaPagamento === "Cartão de crédito"
                ? parcelas
                : 1,

        status: statusInput.value,
        observacoes: observacoesInput.value
    };

    reservas.push(novaReserva);

    if (!salvarReservas()) {
        reservas.pop();
        return;
    }

    form.reset();

    tutorInput.value = "";
    duracaoInput.value = "0 dias";
    totalInput.value = "R$ 0,00";

    valorPagoInput.value = "0";
    valorPagoInput.max = "";

    labelValor.textContent = "Valor por diária (R$)";

    grupoParcelas.classList.remove("visivel");
    parcelasInput.required = false;
    parcelasInput.value = "1";

    valorParcelaPreview.textContent = "Valor por parcela: R$ 0,00";

    atualizarCards();

    alert("Reserva cadastrada com sucesso! 🧡");
}

// ==============================
// EXCLUIR RESERVA
// ==============================

function excluirReserva(id) {
    const confirmar = confirm(
        "Tem certeza que deseja excluir esta reserva?"
    );

    if (!confirmar) return;

    const reserva = reservas.find(item =>
        String(item.id) === String(id)
    );

    if (!reserva) return;

    const reservasAnteriores = [...reservas];
    const historicoAnterior = lerDados(HISTORICO_RESERVAS_KEY);

    const valorPago = obterValorPago(reserva);

    // Preserva os pagamentos recebidos antes da exclusão.
    if (valorPago > 0) {
        const jaArquivada = historicoAnterior.some(item =>
            String(item.id) === String(reserva.id)
        );

        if (!jaArquivada) {
            const registroFinanceiro = {
                id: reserva.id,
                dataReserva: reserva.dataReserva || "",
                petNome: reserva.petNome || "Pet",
                tutorNome: reserva.tutorNome || "Não informado",
                valorTotal: obterValorTotal(reserva),
                valorPago: valorPago,
                dataPagamento: reserva.dataPagamento || "",
                formaPagamento: reserva.formaPagamento || "",
                parcelasPagamento: Math.max(
                    1,
                    Number(reserva.parcelasPagamento) || 1
                ),
                dataArquivamento: obterHoje()
            };

            try {
                localStorage.setItem(
                    HISTORICO_RESERVAS_KEY,
                    JSON.stringify([
                        ...historicoAnterior,
                        registroFinanceiro
                    ])
                );
            } catch (erro) {
                console.error(erro);
                alert(
                    "Não foi possível preservar o histórico financeiro. A reserva não foi excluída."
                );
                return;
            }
        }
    }

    reservas = reservas.filter(item =>
        String(item.id) !== String(id)
    );

    if (!salvarReservas()) {
        reservas = reservasAnteriores;

        try {
            localStorage.setItem(
                HISTORICO_RESERVAS_KEY,
                JSON.stringify(historicoAnterior)
            );
        } catch (erro) {
            console.error(erro);
        }

        return;
    }

    atualizarCards();
}

// ==============================
// CARTÕES DE RESERVAS
// ==============================

function adicionarInformacao(container, titulo, valor) {
    const item = criarElemento("div", "reservation-info-item");

    const label = criarElemento("span", "reservation-info-label", titulo);
    const texto = criarElemento("strong", "reservation-info-value", valor || "-");

    item.append(label, texto);
    container.appendChild(item);

    return item;
}

function criarCartaoReserva(reserva, hoje) {
    const card = criarElemento("article", "reservation-card");

    const cabecalho = criarElemento("div", "reservation-card-header");

    const principal = criarElemento("div", "reservation-card-principal");

    const pet = pets.find(p =>
        String(p.id) === String(reserva.petId)
    );

    const foto = criarElemento("img", "reservation-card-photo");
    foto.alt = reserva.petNome || "Pet";

    if (pet && pet.foto) {
        foto.src = pet.foto;

        foto.classList.add("pet-foto-ampliavel");
        foto.tabIndex = 0;
        foto.setAttribute("role", "button");
        foto.setAttribute("aria-label", `Ampliar foto de ${reserva.petNome || "pet"}`);
        foto.title = "Clique para ampliar a foto";
    } else {
        foto.src = "img/logo-petsitter-transparente.png";
    }

    const identificacao = criarElemento("div", "reservation-card-identification");

    identificacao.append(
        criarElemento("h3", "reservation-card-name", reserva.petNome || "Pet sem nome"),
        criarElemento("p", "reservation-card-tutor", `Tutor: ${reserva.tutorNome || "-"}`)
    );

    principal.append(foto, identificacao);

    const situacao = identificarSituacao(reserva, hoje);
    const pagamento = obterStatusPagamento(reserva);

    const status = criarElemento(
        "span",
        `reservation-status reservation-status-${situacao.toLowerCase().replaceAll(" ", "-")}`,
        situacao
    );

    cabecalho.append(principal, status);

    const resumo = criarElemento("div", "reservation-card-summary");

    adicionarInformacao(resumo, "Entrada", formatarData(reserva.entrada));
    adicionarInformacao(resumo, "Saída", formatarData(reserva.saida));
    adicionarInformacao(resumo, "Valor total", formatarMoeda(obterValorTotal(reserva)));
    adicionarInformacao(resumo, "Pagamento", pagamento);

    const detalhes = criarElemento("div", "reservation-card-details");
    detalhes.hidden = true;

    const grade = criarElemento("div", "reservation-info-grid");

    adicionarInformacao(
        grade,
        "Duração",
        `${calcularDias(reserva.entrada, reserva.saida)} dias`
    );

    adicionarInformacao(
        grade,
        "Cobrança",
        reserva.tipoCobranca === "total" ? "Valor total" : "Por diária"
    );

    adicionarInformacao(
        grade,
        "Valor pago",
        formatarMoeda(obterValorPago(reserva))
    );

    adicionarInformacao(
        grade,
        "Valor restante",
        formatarMoeda(obterValorTotal(reserva) - obterValorPago(reserva))
    );

    adicionarInformacao(
        grade,
        "Forma de pagamento",
        reserva.formaPagamento || "Não informado"
    );

    adicionarInformacao(
        grade,
        "Parcelas",
        reserva.formaPagamento === "Cartão de crédito"
            ? `${Number(reserva.parcelasPagamento) || 1}x`
            : "-"
    );

    adicionarInformacao(grade, "Status da reserva", reserva.status || "-");
    adicionarInformacao(grade, "Status do pagamento", pagamento);

    const observacoes = criarElemento("div", "reservation-observations");

    observacoes.append(
        criarElemento("strong", "", "Observações"),
        criarElemento(
            "p",
            "",
            reserva.observacoes || "Nenhuma observação registrada."
        )
    );

    detalhes.append(grade, observacoes);

    const acoes = criarElemento("div", "reservation-card-actions");

    const botaoDetalhes = criarElemento(
        "button",
        "btn-primary reservation-details-button",
        "Ler mais"
    );

    botaoDetalhes.type = "button";
    botaoDetalhes.dataset.action = "detalhes";

    const botaoExcluir = criarElemento(
        "button",
        "btn-delete",
        "Excluir reserva"
    );

    botaoExcluir.type = "button";
    botaoExcluir.dataset.action = "excluir";

    acoes.append(botaoDetalhes, botaoExcluir);

    card.append(cabecalho, resumo, detalhes, acoes);

    card.dataset.id = reserva.id;

    return card;
}

// ==============================
// ATUALIZAR CARTÕES E FILTROS
// ==============================

function atualizarCards() {
    const hoje = obterHoje();

    let reservasFiltradas = [...reservas];

    const tipoFiltro = filtro.value;

    if (tipoFiltro === "futuras") {
        reservasFiltradas = reservasFiltradas.filter(reserva =>
            reserva.entrada > hoje
        );
    }

    if (tipoFiltro === "andamento") {
        reservasFiltradas = reservasFiltradas.filter(reserva =>
            reserva.status === "Confirmada" &&
            reserva.entrada <= hoje &&
            reserva.saida > hoje
        );
    }

    if (tipoFiltro === "pendentes") {
        reservasFiltradas = reservasFiltradas.filter(reserva =>
            reserva.status === "Pendente"
        );
    }

    reservasFiltradas.sort((a, b) =>
        a.entrada.localeCompare(b.entrada)
    );

    contador.textContent =
        `${reservasFiltradas.length} ${
            reservasFiltradas.length === 1 ? "reserva" : "reservas"
        }`;

    cards.innerHTML = "";

    if (reservasFiltradas.length === 0) {
        cards.appendChild(
            criarElemento(
                "p",
                "empty-table",
                "Nenhuma reserva encontrada neste filtro."
            )
        );

        return;
    }

    reservasFiltradas.forEach(reserva => {
        cards.appendChild(
            criarCartaoReserva(reserva, hoje)
        );
    });
}

// ==============================
// EVENTOS DOS CARTÕES
// ==============================

cards.addEventListener("click", evento => {
    const foto = evento.target.closest(".pet-foto-ampliavel");

    if (foto) {
        abrirFotoReserva(foto.src, foto.alt);
        return;
    }

    const botao = evento.target.closest("button");

    if (!botao) return;

    const card = botao.closest(".reservation-card");

    if (!card) return;

    const id = card.dataset.id;

    if (botao.dataset.action === "detalhes") {
        const detalhes = card.querySelector(
            ".reservation-card-details"
        );

        detalhes.hidden = !detalhes.hidden;

        botao.textContent = detalhes.hidden
            ? "Ler mais"
            : "Mostrar menos";
    }

    if (botao.dataset.action === "excluir") {
        excluirReserva(id);
    }
});

cards.addEventListener("keydown", evento => {
    const foto = evento.target.closest(".pet-foto-ampliavel");

    if (
        foto &&
        (evento.key === "Enter" || evento.key === " ")
    ) {
        evento.preventDefault();
        abrirFotoReserva(foto.src, foto.alt);
    }
});

// ==============================
// EVENTOS E INICIALIZAÇÃO
// ==============================

form.addEventListener("submit", salvarNovaReserva);
filtro.addEventListener("change", atualizarCards);

atualizarFormaPagamento();
carregarDados();
