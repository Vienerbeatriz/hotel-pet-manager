
const CHAVE_RESERVAS = "hotelPetReservas";
const CHAVE_DESPESAS = "hotelPetDespesas";

const despesaForm = document.getElementById("despesaForm");

const pagamentosCards = document.getElementById("pagamentosCards");
const despesasCards = document.getElementById("despesasCards");

function carregarLista(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

let reservas = carregarLista(CHAVE_RESERVAS);
let despesas = carregarLista(CHAVE_DESPESAS);

function salvarDespesas() {
    localStorage.setItem(CHAVE_DESPESAS, JSON.stringify(despesas));
}

function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function dataFormatada(data) {
    if (!data) return "-";

    const partes = data.split("-");

    if (partes.length !== 3) return "-";

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

function obterValoresPagamento(reserva) {
    const total = Math.max(0, Number(reserva.valorTotal) || 0);

    const pago = Math.min(
        total,
        Math.max(0, Number(reserva.valorPago) || 0)
    );

    const restante = Math.max(0, total - pago);

    let status;

    if (restante === 0) {
        status = "Pago";
    } else if (pago > 0) {
        status = "Parcial";
    } else {
        status = "Pendente";
    }

    return { total, pago, restante, status };
}

function atualizarFinanceiro() {
    reservas = carregarLista(CHAVE_RESERVAS);
    despesas = carregarLista(CHAVE_DESPESAS);

    let recebido = 0;
    let aReceber = 0;
    let totalDespesas = 0;

    reservas.forEach(reserva => {
        const pagamento = obterValoresPagamento(reserva);

        recebido += pagamento.pago;
        aReceber += pagamento.restante;
    });

    despesas.forEach(despesa => {
        totalDespesas += Number(despesa.valor) || 0;
    });

    const saldo = recebido - totalDespesas;

    document.getElementById("totalRecebido").textContent = moeda(recebido);
    document.getElementById("totalPendente").textContent = moeda(aReceber);
    document.getElementById("totalDespesas").textContent = moeda(totalDespesas);
    document.getElementById("saldoAtual").textContent = moeda(saldo);

    atualizarCartoesPagamentos();
    atualizarCartoesDespesas();
}

function atualizarCartoesPagamentos() {
    pagamentosCards.innerHTML = "";

    document.getElementById("pagamentosCount").textContent =
        `${reservas.length} ${reservas.length === 1 ? "reserva" : "reservas"}`;

    if (reservas.length === 0) {
        pagamentosCards.innerHTML = `
            <p class="empty-table">
                Nenhuma reserva cadastrada.
            </p>
        `;
        return;
    }

    reservas.forEach(reserva => {
        const pagamento = obterValoresPagamento(reserva);

        const statusClasse = pagamento.status.toLowerCase();

        const card = document.createElement("article");
        card.className = "financeiro-card";

        card.innerHTML = `
            <div class="financeiro-card-header">
                <div class="financeiro-card-identificacao">
                    <div class="financeiro-card-icone">🐶</div>

                    <div>
                        <h3>${escaparHTML(reserva.petNome || "Pet não identificado")}</h3>
                        <p>Tutor: ${escaparHTML(reserva.tutorNome || "-")}</p>
                    </div>
                </div>

                <span class="financeiro-status status-${statusClasse}">
                    ${pagamento.status}
                </span>
            </div>

            <div class="financeiro-valores">
                <div class="financeiro-valor-item">
                    <span>Valor total</span>
                    <strong>${moeda(pagamento.total)}</strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Valor recebido</span>
                    <strong class="valor-recebido">${moeda(pagamento.pago)}</strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Falta receber</span>
                    <strong class="valor-pendente">${moeda(pagamento.restante)}</strong>
                </div>
            </div>

            <div class="financeiro-card-progresso">
                <div class="financeiro-progresso-fundo">
                    <div
                        class="financeiro-progresso-preenchido"
                        style="width: ${pagamento.total > 0
                            ? Math.min(100, pagamento.pago / pagamento.total * 100)
                            : 0}%"
                    ></div>
                </div>

                <small>
                    ${pagamento.total > 0
                        ? Math.round(pagamento.pago / pagamento.total * 100)
                        : 0}% recebido
                </small>
            </div>
        `;

        pagamentosCards.appendChild(card);
    });
}

function atualizarCartoesDespesas() {
    despesasCards.innerHTML = "";

    document.getElementById("despesasCount").textContent =
        `${despesas.length} ${despesas.length === 1 ? "despesa" : "despesas"}`;

    if (despesas.length === 0) {
        despesasCards.innerHTML = `
            <p class="empty-table">
                Nenhuma despesa cadastrada.
            </p>
        `;
        return;
    }

    despesas.forEach(despesa => {
        const card = document.createElement("article");
        card.className = "despesa-card";

        card.innerHTML = `
            <div class="despesa-card-header">
                <div class="despesa-card-icone">🧾</div>

                <div class="despesa-card-identificacao">
                    <h3>${escaparHTML(despesa.descricao)}</h3>
                    <span>${escaparHTML(despesa.categoria)}</span>
                </div>
            </div>

            <div class="despesa-card-informacoes">
                <div>
                    <span>Data</span>
                    <strong>${dataFormatada(despesa.data)}</strong>
                </div>

                <div>
                    <span>Valor</span>
                    <strong class="despesa-valor">${moeda(despesa.valor)}</strong>
                </div>
            </div>

            <div class="despesa-card-acoes">
                <button
                    type="button"
                    class="btn-delete"
                    data-excluir-despesa="${escaparHTML(despesa.id)}"
                >
                    Excluir despesa
                </button>
            </div>
        `;

        despesasCards.appendChild(card);
    });
}

function cadastrarDespesa(evento) {
    evento.preventDefault();

    const descricao = document.getElementById("despesaDescricao").value.trim();
    const categoria = document.getElementById("despesaCategoria").value;
    const data = document.getElementById("despesaData").value;
    const valor = Number(document.getElementById("despesaValor").value);

    if (
        !descricao ||
        !categoria ||
        !data ||
        !Number.isFinite(valor) ||
        valor <= 0
    ) {
        alert("Preencha todos os campos com informações válidas.");
        return;
    }

    const novaDespesa = {
        id: Date.now(),
        descricao,
        categoria,
        data,
        valor
    };

    despesas.push(novaDespesa);

    salvarDespesas();
    despesaForm.reset();
    atualizarFinanceiro();

    alert("Despesa cadastrada com sucesso!");
}

function excluirDespesa(id) {
    const confirmar = confirm(
        "Deseja realmente excluir esta despesa?"
    );

    if (!confirmar) return;

    despesas = despesas.filter(despesa =>
        String(despesa.id) !== String(id)
    );

    salvarDespesas();
    atualizarFinanceiro();
}

despesasCards.addEventListener("click", evento => {
    const botao = evento.target.closest("[data-excluir-despesa]");

    if (!botao) return;

    excluirDespesa(botao.dataset.excluirDespesa);
});

despesaForm.addEventListener("submit", cadastrarDespesa);

atualizarFinanceiro();

window.addEventListener("storage", atualizarFinanceiro);
window.addEventListener("pageshow", atualizarFinanceiro);

setInterval(atualizarFinanceiro, 5000);
