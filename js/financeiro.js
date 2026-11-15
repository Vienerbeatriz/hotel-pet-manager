
const CHAVE_RESERVAS = "hotelPetReservas";
const CHAVE_DESPESAS = "hotelPetDespesas";

const despesaForm = document.getElementById("despesaForm");

const pagamentosTable = document.getElementById("pagamentosTable");
const despesasTable = document.getElementById("despesasTable");

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

    return new Date(data + "T12:00:00")
        .toLocaleDateString("pt-BR");
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
    // Atualiza os dados para refletir as reservas mais recentes
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

    document.getElementById("totalRecebido").textContent =
        moeda(recebido);

    document.getElementById("totalPendente").textContent =
        moeda(aReceber);

    document.getElementById("totalDespesas").textContent =
        moeda(totalDespesas);

    document.getElementById("saldoAtual").textContent =
        moeda(saldo);

    atualizarTabelaPagamentos();
    atualizarTabelaDespesas();
}

function atualizarTabelaPagamentos() {
    pagamentosTable.innerHTML = "";

    document.getElementById("pagamentosCount").textContent =
        `${reservas.length} ${
            reservas.length === 1 ? "reserva" : "reservas"
        }`;

    if (reservas.length === 0) {
        pagamentosTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    Nenhuma reserva cadastrada.
                </td>
            </tr>
        `;
        return;
    }

    reservas.forEach(reserva => {
        const pagamento = obterValoresPagamento(reserva);
        const linha = document.createElement("tr");

        const valores = [
            reserva.petNome || "-",
            reserva.tutorNome || "-",
            moeda(pagamento.total),
            moeda(pagamento.pago),
            moeda(pagamento.restante)
        ];

        valores.forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaStatus = document.createElement("td");
        celulaStatus.textContent = pagamento.status;
        celulaStatus.style.fontWeight = "bold";

        if (pagamento.status === "Pago") {
            celulaStatus.style.color = "#52765C";
        } else if (pagamento.status === "Parcial") {
            celulaStatus.style.color = "#4976A5";
        } else {
            celulaStatus.style.color = "#B47B2C";
        }

        linha.appendChild(celulaStatus);
        pagamentosTable.appendChild(linha);
    });
}

function atualizarTabelaDespesas() {
    despesasTable.innerHTML = "";

    document.getElementById("despesasCount").textContent =
        `${despesas.length} ${
            despesas.length === 1 ? "despesa" : "despesas"
        }`;

    if (despesas.length === 0) {
        despesasTable.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    Nenhuma despesa cadastrada.
                </td>
            </tr>
        `;
        return;
    }

    despesas.forEach(despesa => {
        const linha = document.createElement("tr");

        const valores = [
            despesa.descricao,
            despesa.categoria,
            dataFormatada(despesa.data),
            moeda(despesa.valor)
        ];

        valores.forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaAcao = document.createElement("td");
        const botao = document.createElement("button");

        botao.type = "button";
        botao.textContent = "Excluir";
        botao.className = "btn-delete";

        botao.addEventListener("click", () => {
            excluirDespesa(despesa.id);
        });

        celulaAcao.appendChild(botao);
        linha.appendChild(celulaAcao);

        despesasTable.appendChild(linha);
    });
}

function cadastrarDespesa(evento) {
    evento.preventDefault();

    const descricao = document.getElementById("despesaDescricao").value.trim();
    const categoria = document.getElementById("despesaCategoria").value;
    const data = document.getElementById("despesaData").value;
    const valor = Number(document.getElementById("despesaValor").value);

    if (!descricao || !categoria || !data || !Number.isFinite(valor) || valor <= 0) {
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

despesaForm.addEventListener("submit", cadastrarDespesa);

atualizarFinanceiro();

// Atualiza os valores quando houver mudanças nas reservas em outra página.
window.addEventListener("storage", atualizarFinanceiro);

setInterval(atualizarFinanceiro, 5000);
