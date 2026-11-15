
const PET_KEY = "hotelPetAnimais";
const CLIENT_KEY = "hotelPetClientes";
const RESERVATION_KEY = "hotelPetReservas";

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
const tabela = document.getElementById("reservationTable");
const contador = document.getElementById("reservationCount");
const filtro = document.getElementById("filtroReservas");

let pets = [];
let clientes = [];
let reservas = [];

function lerDados(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarReservas() {
    localStorage.setItem(RESERVATION_KEY, JSON.stringify(reservas));
}

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

    const diaria = Number(reserva.diaria ?? reserva.valorInformado) || 0;

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

function carregarDados() {
    pets = lerDados(PET_KEY);
    clientes = lerDados(CLIENT_KEY);

    // Reservas antigas continuam preservadas.
    // Caso ainda não tenham valorPago, consideramos R$ 0,00.
    reservas = lerDados(RESERVATION_KEY).map(reserva => ({
        ...reserva,
        valorPago: Math.max(0, Number(reserva.valorPago) || 0)
    }));

    carregarPets();
    atualizarTabela();
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

function atualizarTotal() {
    const dias = calcularDias(
        entradaInput.value,
        saidaInput.value
    );

    const valor = Number(valorInput.value) || 0;

    let total = 0;

    if (dias > 0) {
        total = tipoCobranca.value === "diaria"
            ? valor * dias
            : valor;
    }

    totalInput.value = formatarMoeda(total);
    valorPagoInput.max = total.toFixed(2);
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

    if (!Number.isFinite(valor) || valor < 0) {
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

    const novaReserva = {
        id: Date.now(),
        petId: pet.id,
        petNome: pet.nome,
        tutorNome: tutor.nome,
        entrada: entrada,
        saida: saida,
        dias: dias,
        tipoCobranca: tipoCobranca.value,
        valorInformado: valor,
        diaria: tipoCobranca.value === "diaria" ? valor : 0,
        valorTotal: valorTotal,
        valorPago: valorPago,
        status: statusInput.value,
        observacoes: observacoesInput.value
    };

    reservas.push(novaReserva);

    salvarReservas();

    form.reset();

    tutorInput.value = "";
    duracaoInput.value = "0 dias";
    totalInput.value = "R$ 0,00";
    valorPagoInput.value = "0";
    valorPagoInput.max = "";
    labelValor.textContent = "Valor por diária (R$)";

    atualizarTabela();

    alert("Reserva cadastrada com sucesso!");
}

function criarCelula(linha, texto) {
    const celula = document.createElement("td");
    celula.textContent = texto;
    linha.appendChild(celula);

    return celula;
}

function excluirReserva(id) {
    const confirmar = confirm(
        "Tem certeza que deseja excluir esta reserva?"
    );

    if (!confirmar) return;

    reservas = reservas.filter(reserva =>
        String(reserva.id) !== String(id)
    );

    salvarReservas();
    atualizarTabela();
}

function atualizarTabela() {
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

    tabela.innerHTML = "";

    if (reservasFiltradas.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="11" class="empty-table">
                    Nenhuma reserva encontrada neste filtro.
                </td>
            </tr>
        `;

        return;
    }

    reservasFiltradas.forEach(reserva => {
        const linha = document.createElement("tr");

        const dias = calcularDias(reserva.entrada, reserva.saida);
        const valorTotal = obterValorTotal(reserva);
        const valorPago = obterValorPago(reserva);
        const statusPagamento = obterStatusPagamento(reserva);

        const tipoValor = reserva.tipoCobranca === "total"
            ? "Valor total"
            : "Por diária";

        criarCelula(linha, reserva.petNome || "-");
        criarCelula(linha, reserva.tutorNome || "-");
        criarCelula(linha, formatarData(reserva.entrada));
        criarCelula(linha, formatarData(reserva.saida));
        criarCelula(linha, `${dias} ${dias === 1 ? "dia" : "dias"}`);
        criarCelula(linha, tipoValor);
        criarCelula(linha, formatarMoeda(valorTotal));
        criarCelula(linha, formatarMoeda(valorPago));

        const celulaPagamento = criarCelula(linha, statusPagamento);
        celulaPagamento.style.fontWeight = "bold";

        if (statusPagamento === "Pago") {
            celulaPagamento.style.color = "#52765C";
        } else if (statusPagamento === "Parcial") {
            celulaPagamento.style.color = "#4976A5";
        } else {
            celulaPagamento.style.color = "#B47B2C";
        }

        const situacao = identificarSituacao(reserva, hoje);

        const celulaStatus = criarCelula(linha, situacao);
        celulaStatus.style.fontWeight = "bold";

        if (situacao === "Pendente") {
            celulaStatus.style.color = "#B47B2C";
        } else if (situacao === "Futura") {
            celulaStatus.style.color = "#4976A5";
        } else if (situacao === "Em andamento") {
            celulaStatus.style.color = "#52765C";
        } else {
            celulaStatus.style.color = "#777777";
        }

        const celulaAcao = document.createElement("td");
        const botaoExcluir = document.createElement("button");

        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.className = "btn-delete";

        botaoExcluir.addEventListener("click", () => {
            excluirReserva(reserva.id);
        });

        celulaAcao.appendChild(botaoExcluir);
        linha.appendChild(celulaAcao);

        tabela.appendChild(linha);
    });
}

form.addEventListener("submit", salvarNovaReserva);
filtro.addEventListener("change", atualizarTabela);

carregarDados();
