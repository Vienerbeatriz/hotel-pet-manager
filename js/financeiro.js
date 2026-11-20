const CHAVE_RESERVAS = "hotelPetReservas";
const CHAVE_DESPESAS = "hotelPetDespesas";
const CHAVE_BANHO = "petsitterAgendaBanho";
const CHAVE_VET = "petsitterAgendaVet";
const CHAVE_PETS = "hotelPetAnimais";
const CHAVE_HISTORICO_RESERVAS = "hotelPetHistoricoFinanceiroReservas";
const CHAVE_AJUSTES_FINANCEIROS = "hotelPetAjustesFinanceiros";

const CHAVE_FUNCIONARIOS = "petsitterFuncionarios";
const CHAVE_REGISTROS_FUNCIONARIOS = "petsitterRegistrosFuncionarios";

const despesaForm = document.getElementById("despesaForm");

const pagamentosCards = document.getElementById("pagamentosCards");
const despesasCards = document.getElementById("despesasCards");
const banhoCards = document.getElementById("banhoCards");
const vetCards = document.getElementById("vetCards");

const arquivadosArea = document.getElementById("arquivadosArea");
const arquivadosCards = document.getElementById("arquivadosCards");
const btnVerArquivados = document.getElementById("btnVerArquivados");
const btnExcluirArquivados = document.getElementById("btnExcluirArquivados");

const receitaModo = document.getElementById("receitaModo");
const receitaManualArea = document.getElementById("receitaManualArea");
const receitaValorManual = document.getElementById("receitaValorManual");
const receitaAplicar = document.getElementById("receitaAplicar");

const saldoModo = document.getElementById("saldoModo");
const saldoManualArea = document.getElementById("saldoManualArea");
const saldoValorManual = document.getElementById("saldoValorManual");
const saldoAplicar = document.getElementById("saldoAplicar");

// ==============================
// CARREGAR DADOS
// ==============================

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
let servicosBanho = carregarLista(CHAVE_BANHO);
let atendimentosVet = carregarLista(CHAVE_VET);

let funcionarios = carregarLista(CHAVE_FUNCIONARIOS);
let registrosFuncionarios = carregarLista(CHAVE_REGISTROS_FUNCIONARIOS);

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

    const partes = String(data).split("-");

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

// ==============================
// AJUSTES FINANCEIROS
// ==============================

function carregarAjustesFinanceiros() {
    try {
        return JSON.parse(
            localStorage.getItem(CHAVE_AJUSTES_FINANCEIROS)
        ) || {};
    } catch {
        return {};
    }
}

function salvarAjustesFinanceiros(ajustes) {
    localStorage.setItem(
        CHAVE_AJUSTES_FINANCEIROS,
        JSON.stringify(ajustes)
    );
}

function configurarAjustesFinanceiros() {
    const ajustes = carregarAjustesFinanceiros();

    if (receitaModo) {
        receitaModo.value = ajustes.receitaModo || "automatico";
    }

    if (saldoModo) {
        saldoModo.value = ajustes.saldoModo || "automatico";
    }

    if (receitaValorManual && ajustes.receitaValorManual !== undefined) {
        receitaValorManual.value = ajustes.receitaValorManual;
    }

    if (saldoValorManual && ajustes.saldoValorManual !== undefined) {
        saldoValorManual.value = ajustes.saldoValorManual;
    }

    atualizarVisibilidadeAjustes();
}

function atualizarVisibilidadeAjustes() {
    if (receitaManualArea && receitaModo) {
        receitaManualArea.hidden = receitaModo.value !== "manual";
    }

    if (saldoManualArea && saldoModo) {
        saldoManualArea.hidden = saldoModo.value !== "manual";
    }
}

// ==============================
// EVENTOS DOS AJUSTES
// ==============================

function configurarEventosAjustes() {
    if (receitaModo) {
        receitaModo.addEventListener("change", () => {
            const ajustes = carregarAjustesFinanceiros();

            ajustes.receitaModo = receitaModo.value;

            delete ajustes.receitaZeradaAte;

            salvarAjustesFinanceiros(ajustes);
            atualizarVisibilidadeAjustes();
            atualizarFinanceiro();
        });
    }

    if (saldoModo) {
        saldoModo.addEventListener("change", () => {
            const ajustes = carregarAjustesFinanceiros();

            ajustes.saldoModo = saldoModo.value;

            delete ajustes.saldoZeradoAte;

            salvarAjustesFinanceiros(ajustes);
            atualizarVisibilidadeAjustes();
            atualizarFinanceiro();
        });
    }

    if (receitaAplicar) {
        receitaAplicar.addEventListener("click", () => {
            const valor = Number(receitaValorManual?.value);

            if (
                !receitaValorManual ||
                receitaValorManual.value.trim() === "" ||
                !Number.isFinite(valor) ||
                valor < 0
            ) {
                alert("Informe um valor válido para a receita.");
                return;
            }

            const ajustes = carregarAjustesFinanceiros();

            ajustes.receitaModo = "manual";
            ajustes.receitaValorManual = valor;

            delete ajustes.receitaZeradaAte;

            salvarAjustesFinanceiros(ajustes);

            if (receitaModo) {
                receitaModo.value = "manual";
            }

            atualizarVisibilidadeAjustes();
            atualizarFinanceiro();

            alert("Valor manual da receita aplicado!");
        });
    }

    if (saldoAplicar) {
        saldoAplicar.addEventListener("click", () => {
            const valor = Number(saldoValorManual?.value);

            if (
                !saldoValorManual ||
                saldoValorManual.value.trim() === "" ||
                !Number.isFinite(valor)
            ) {
                alert("Informe um valor válido para o saldo.");
                return;
            }

            const ajustes = carregarAjustesFinanceiros();

            ajustes.saldoModo = "manual";
            ajustes.saldoValorManual = valor;

            delete ajustes.saldoZeradoAte;

            salvarAjustesFinanceiros(ajustes);

            if (saldoModo) {
                saldoModo.value = "manual";
            }

            atualizarVisibilidadeAjustes();
            atualizarFinanceiro();

            alert("Valor manual do saldo aplicado!");
        });
    }
}

// ==============================
// ZERAR INDICADORES INDIVIDUAIS
// ==============================

function zerarIndicador(tipo) {
    const ajustes = carregarAjustesFinanceiros();
    const valoresAtuais = calcularValoresFinanceiros();

    const configuracoes = {
        receita: {
            chave: "receitaZeradaAte",
            valor: valoresAtuais.receita,
            nome: "receita recebida"
        },
        pendente: {
            chave: "pendenteZeradoAte",
            valor: valoresAtuais.pendente,
            nome: "valores a receber"
        },
        despesas: {
            chave: "despesasZeradasAte",
            valor: valoresAtuais.despesas,
            nome: "total de despesas"
        },
        saldo: {
            chave: "saldoZeradoAte",
            valor: valoresAtuais.saldo,
            nome: "saldo atual"
        }
    };

    const configuracao = configuracoes[tipo];

    if (!configuracao) return;

    const confirmar = confirm(
        `Deseja zerar somente o indicador "${configuracao.nome}"?\n\n` +
        "Os cadastros e históricos continuarão salvos.\n" +
        "Os novos lançamentos continuarão sendo contabilizados."
    );

    if (!confirmar) return;

    ajustes[configuracao.chave] = configuracao.valor;

    try {
        salvarAjustesFinanceiros(ajustes);
        atualizarFinanceiro();

        alert(
            `O indicador "${configuracao.nome}" foi zerado com sucesso!`
        );
    } catch (erro) {
        console.error("Erro ao zerar indicador:", erro);
        alert("Não foi possível zerar esse indicador.");
    }
}

function configurarBotoesZerar() {
    document.querySelectorAll("[data-zerar-indicador]").forEach(botao => {
        botao.addEventListener("click", () => {
            zerarIndicador(botao.dataset.zerarIndicador);
        });
    });
}

function aplicarZeramento(valor, valorZerado, permitirNegativo = false) {
    const resultado = Number(valor || 0) - Number(valorZerado || 0);

    return permitirNegativo
        ? resultado
        : Math.max(0, resultado);
}

// ==============================
// IDENTIFICAR NOME DO PET
// ==============================

function obterNomePet(item) {
    const pets = carregarLista(CHAVE_PETS);

    const petEncontrado = pets.find(pet =>
        String(pet.id) === String(item.petId)
    );

    return (
        item.petNome ||
        item.nomePet ||
        petEncontrado?.nome ||
        "Pet não informado"
    );
}

// ==============================
// IDENTIFICAR NOME DO TUTOR
// ==============================

function obterNomeTutor(item) {
    return (
        item.tutorNome ||
        item.nomeTutor ||
        item.tutor ||
        item.clienteNome ||
        "Tutor não informado"
    );
}

// ==============================
// DATAS DO PARCELAMENTO
// ==============================

function obterDataPagamento(data) {
    if (!data) return null;

    const partes = String(data).split("-");

    if (partes.length !== 3) return null;

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (
        !Number.isInteger(ano) ||
        !Number.isInteger(mes) ||
        !Number.isInteger(dia) ||
        mes < 1 || mes > 12 ||
        dia < 1 || dia > 31
    ) {
        return null;
    }

    const dataValida = new Date(ano, mes - 1, dia);

    if (
        dataValida.getFullYear() !== ano ||
        dataValida.getMonth() !== mes - 1 ||
        dataValida.getDate() !== dia
    ) {
        return null;
    }

    return dataValida;
}

function formatarMesAno(data) {
    return data.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });
}

// ==============================
// CONFIRMAR ÚLTIMA PARCELA PAGA
// ==============================

function marcarUltimaParcelaPaga(tipo, indice) {
    let lista;
    let chave;

    if (tipo === "reserva") {
        lista = reservas;
        chave = CHAVE_RESERVAS;
    } else if (tipo === "banho") {
        lista = servicosBanho;
        chave = CHAVE_BANHO;
    } else if (tipo === "vet") {
        lista = atendimentosVet;
        chave = CHAVE_VET;
    } else {
        return;
    }

    const registro = lista[indice];

    if (!registro) return;

    if (registro.ultimaParcelaPaga) {
        alert("A última parcela já está marcada como paga.");
        return;
    }

    const confirmar = confirm(
        "Confirma que o cliente realizou o pagamento da última parcela?"
    );

    if (!confirmar) return;

    registro.ultimaParcelaPaga = true;
    registro.dataUltimaParcelaPaga =
        new Date().toISOString().split("T")[0];

    try {
        localStorage.setItem(chave, JSON.stringify(lista));

        atualizarFinanceiro();

        alert("Última parcela marcada como paga!");
    } catch (erro) {
        console.error(erro);

        registro.ultimaParcelaPaga = false;
        delete registro.dataUltimaParcelaPaga;

        alert("Não foi possível salvar a confirmação.");
    }
}

// ==============================
// EVENTOS DOS BOTÕES DE QUITAÇÃO
// ==============================

function configurarEventosQuitacao(container) {
    if (!container) return;

    container.addEventListener("click", evento => {
        const botao = evento.target.closest(
            ".btn-marcar-parcela-paga"
        );

        if (!botao) return;

        const tipo = botao.dataset.tipo;
        const indice = Number(botao.dataset.indice);

        if (!Number.isInteger(indice) || indice < 0) return;

        marcarUltimaParcelaPaga(tipo, indice);
    });
}

configurarEventosQuitacao(pagamentosCards);
configurarEventosQuitacao(banhoCards);
configurarEventosQuitacao(vetCards);

// ==============================
// DETALHES DO PARCELAMENTO
// ==============================

function obterDetalhesParcelamento(registro, valorBase, tipo, indice) {
    if (registro.formaPagamento !== "Cartão de crédito") {
        return "";
    }

    const parcelas = Math.max(
        1,
        Number(registro.parcelasPagamento) || 1
    );

    if (parcelas <= 1) return "";

    const dataInicial = tipo === "reserva"
        ? registro.dataReserva
        : registro.dataPagamento;

    const dataInicio = obterDataPagamento(dataInicial);

    const campoData = tipo !== "reserva" ? `
        <div class="financeiro-valor-item financeiro-data-parcelamento">
            <label for="dataParcelamento-${tipo}-${indice}">
                Data de início do parcelamento
            </label>

            <input
                type="date"
                id="dataParcelamento-${tipo}-${indice}"
                class="campo-data-parcelamento"
                data-indice="${indice}"
                data-tipo="${tipo}"
                value="${escaparHTML(registro.dataPagamento || "")}"
            >
        </div>
    ` : "";

    if (!dataInicio) {
        if (tipo === "reserva") {
            return `
                <div class="financeiro-parcelamento">
                    <p class="financeiro-aviso-parcelamento">
                        A data de cadastro desta reserva não está disponível.
                        Não foi possível calcular a última parcela.
                    </p>
                </div>
            `;
        }

        return `
            <div class="financeiro-parcelamento">
                ${campoData}

                <p class="financeiro-aviso-parcelamento">
                    Informe a data em que o pagamento no cartão foi realizado
                    para calcular a última parcela.
                </p>
            </div>
        `;
    }

    const valor = Math.max(0, Number(valorBase) || 0);
    const valorParcela = valor / parcelas;

    const dataUltimaParcela = new Date(
        dataInicio.getFullYear(),
        dataInicio.getMonth() + parcelas - 1,
        1
    );

    const hoje = new Date();

    const mesAtual =
        hoje.getFullYear() * 12 + hoje.getMonth();

    const mesUltimaParcela =
        dataUltimaParcela.getFullYear() * 12 +
        dataUltimaParcela.getMonth();

    const diferencaMeses = mesUltimaParcela - mesAtual;

    let aviso = "";

    if (registro.ultimaParcelaPaga) {
        aviso = `
            <p class="financeiro-aviso-parcelamento">
                Última parcela marcada como paga!
            </p>
        `;
    } else if (diferencaMeses === 0) {
        aviso = `
            <p class="financeiro-aviso-parcelamento">
                Atenção: a última parcela está prevista para este mês!
            </p>
        `;
    } else if (diferencaMeses === 1) {
        aviso = `
            <p class="financeiro-aviso-parcelamento">
                Atenção: a última parcela está prevista para o próximo mês!
            </p>
        `;
    } else if (diferencaMeses < 0) {
        aviso = `
            <p class="financeiro-aviso-parcelamento">
                A data prevista da última parcela já passou.
                Confirme se o cliente realizou o pagamento.
            </p>
        `;
    }

    let botaoConfirmacao = "";

    if (!registro.ultimaParcelaPaga && diferencaMeses <= 0) {
        botaoConfirmacao = `
            <button
                type="button"
                class="btn-marcar-parcela-paga"
                data-tipo="${tipo}"
                data-indice="${indice}"
                style="
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    margin-top: 12px;
                    padding: 11px;
                    border: none;
                    border-radius: 8px;
                    background: #EB9933;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                "
            >
                Marcar última parcela como paga
            </button>
        `;
    }

    return `
        <div class="financeiro-parcelamento">
            ${campoData}

            <div class="financeiro-valor-item">
                <span>Início do pagamento</span>
                <strong>${escaparHTML(formatarMesAno(dataInicio))}</strong>
            </div>

            <div class="financeiro-valor-item">
                <span>Valor de cada parcela</span>
                <strong>${moeda(valorParcela)}</strong>
            </div>

            <div class="financeiro-valor-item">
                <span>Última parcela</span>
                <strong>${escaparHTML(formatarMesAno(dataUltimaParcela))}</strong>
            </div>

            ${aviso}
            ${botaoConfirmacao}
        </div>
    `;
}

// ==============================
// SALVAR DATA DO PARCELAMENTO
// ==============================

function salvarDataParcelamento(tipo, indice, novaData) {
    let lista;
    let chave;

    if (tipo === "reserva") return;

    if (tipo === "banho") {
        lista = servicosBanho;
        chave = CHAVE_BANHO;
    } else if (tipo === "vet") {
        lista = atendimentosVet;
        chave = CHAVE_VET;
    } else {
        return;
    }

    const registro = lista[indice];

    if (!registro) return;

    if (novaData && !obterDataPagamento(novaData)) {
        alert("Informe uma data válida.");
        atualizarFinanceiro();
        return;
    }

    registro.dataPagamento = novaData;

    try {
        localStorage.setItem(chave, JSON.stringify(lista));
        atualizarFinanceiro();
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível salvar a data do parcelamento.");
    }
}

function configurarEventosDataParcelamento(container) {
    if (!container) return;

    container.addEventListener("change", evento => {
        const campo = evento.target.closest(
            ".campo-data-parcelamento"
        );

        if (!campo) return;

        const tipo = campo.dataset.tipo;
        const indice = Number(campo.dataset.indice);

        if (!Number.isInteger(indice) || indice < 0) return;

        salvarDataParcelamento(
            tipo,
            indice,
            campo.value
        );
    });
}

configurarEventosDataParcelamento(banhoCards);
configurarEventosDataParcelamento(vetCards);

// ==============================
// PAGAMENTOS DAS HOSPEDAGENS
// ==============================

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

// ==============================
// FORMA DE PAGAMENTO
// ==============================

function obterFormaPagamentoHospedagem(reserva) {
    const forma = reserva.formaPagamento || "Não informado";

    if (forma === "Cartão de crédito") {
        const parcelas = Math.max(
            1,
            Number(reserva.parcelasPagamento) || 1
        );

        return `${forma} — ${parcelas}x`;
    }

    return forma;
}

function obterFormaPagamento(registro, valorBase) {
    const forma = registro.formaPagamento || "Não informado";

    if (forma === "Cartão de crédito") {
        const parcelas = Math.max(
            1,
            Number(registro.parcelasPagamento) || 1
        );

        if (parcelas > 1) {
            const valorParcela = valorBase / parcelas;

            return `${forma} — ${parcelas}x de ${moeda(valorParcela)}`;
        }
    }

    return forma;
}

// ==============================
// RECEITAS DE BANHO E VETERINÁRIO
// ==============================

function servicoFoiRecebido(item) {
    return Boolean(
        item.formaPagamento &&
        item.status !== "Cancelado" &&
        item.status !== "cancelado"
    );
}

function calcularReceitaServicos(lista) {
    return lista.reduce((total, item) => {
        if (!servicoFoiRecebido(item)) return total;

        return total + (Number(item.valor) || 0);
    }, 0);
}

// ==============================
// CALCULAR VALORES FINANCEIROS
// ==============================

function calcularValoresFinanceiros() {
    reservas = carregarLista(CHAVE_RESERVAS);
    despesas = carregarLista(CHAVE_DESPESAS);
    servicosBanho = carregarLista(CHAVE_BANHO);
    atendimentosVet = carregarLista(CHAVE_VET);

    const historicoReservas = carregarLista(
        CHAVE_HISTORICO_RESERVAS
    );

    const idsReservasAtivas = reservas.map(reserva =>
        String(reserva.id)
    );

    const historicoArquivado = historicoReservas.filter(registro =>
        !idsReservasAtivas.includes(String(registro.id))
    );

    const historicoValido = historicoArquivado.filter(registro =>
        Number(registro.valorPago) > 0
    );

    const receitaReservasAtivas = reservas.reduce((total, reserva) => {
        const pagamento = obterValoresPagamento(reserva);
        return total + pagamento.pago;
    }, 0);

    const receitaBanho = calcularReceitaServicos(servicosBanho);
    const receitaVet = calcularReceitaServicos(atendimentosVet);

    const receitaAutomatica =
        receitaReservasAtivas +
        receitaBanho +
        receitaVet;

    const totalPendente = reservas.reduce((total, reserva) => {
        const pagamento = obterValoresPagamento(reserva);
        return total + pagamento.restante;
    }, 0);

    const totalDespesas = despesas.reduce((total, despesa) => {
        return total + (Number(despesa.valor) || 0);
    }, 0);

    const ajustes = carregarAjustesFinanceiros();

    const receitaManual = Number(ajustes.receitaValorManual);

    const receitaBruta =
        ajustes.receitaModo === "manual" &&
        ajustes.receitaValorManual !== undefined &&
        ajustes.receitaValorManual !== "" &&
        Number.isFinite(receitaManual)
            ? receitaManual
            : receitaAutomatica;

    const saldoAutomatico = receitaAutomatica - totalDespesas;

    const saldoManual = Number(ajustes.saldoValorManual);

    const saldoBruto =
        ajustes.saldoModo === "manual" &&
        ajustes.saldoValorManual !== undefined &&
        ajustes.saldoValorManual !== "" &&
        Number.isFinite(saldoManual)
            ? saldoManual
            : saldoAutomatico;

    return {
        receita: receitaBruta,
        pendente: totalPendente,
        despesas: totalDespesas,
        saldo: saldoBruto,
        historicoValido,
        historicoArquivado
    };
}

// ==============================
// ATUALIZAR INDICADORES
// ==============================

function atualizarFinanceiro() {
    const valores = calcularValoresFinanceiros();
    const ajustes = carregarAjustesFinanceiros();

    const receitaExibida = aplicarZeramento(
        valores.receita,
        ajustes.receitaZeradaAte
    );

    const pendenteExibido = aplicarZeramento(
        valores.pendente,
        ajustes.pendenteZeradoAte
    );

    const despesasExibidas = aplicarZeramento(
        valores.despesas,
        ajustes.despesasZeradasAte
    );

    const saldoExibido = aplicarZeramento(
        valores.saldo,
        ajustes.saldoZeradoAte,
        true
    );

    const elementoRecebido = document.getElementById("totalRecebido");
    const elementoPendente = document.getElementById("totalPendente");
    const elementoDespesas = document.getElementById("totalDespesas");
    const elementoSaldo = document.getElementById("saldoAtual");

    if (elementoRecebido) {
        elementoRecebido.textContent = moeda(receitaExibida);
    }

    if (elementoPendente) {
        elementoPendente.textContent = moeda(pendenteExibido);
    }

    if (elementoDespesas) {
        elementoDespesas.textContent = moeda(despesasExibidas);
    }

    if (elementoSaldo) {
        elementoSaldo.textContent = moeda(saldoExibido);
    }

    const pagamentosCount = document.getElementById("pagamentosCount");
    const despesasCount = document.getElementById("despesasCount");
    const banhoCount = document.getElementById("banhoCount");
    const vetCount = document.getElementById("vetCount");

    if (pagamentosCount) {
        pagamentosCount.textContent =
            `${reservas.length} reservas ativas`;
    }

    if (despesasCount) {
        despesasCount.textContent = `${despesas.length} despesas`;
    }

    if (banhoCount) {
        banhoCount.textContent = `${servicosBanho.length} serviços`;
    }

    if (vetCount) {
        vetCount.textContent = `${atendimentosVet.length} atendimentos`;
    }

    atualizarCartoesPagamentos(valores.historicoArquivado);
    atualizarCartoesBanho();
    atualizarCartoesVet();
    atualizarCartoesDespesas();
    atualizarFuncionarios();
}

// ==============================
// CARTÕES DE PAGAMENTOS
// ==============================

function atualizarCartoesPagamentos(historicoArquivado) {
    if (!pagamentosCards) return;

    pagamentosCards.style.display = "flex";
    pagamentosCards.style.flexDirection = "column";
    pagamentosCards.style.width = "100%";
    pagamentosCards.style.gap = "15px";

    if (reservas.length === 0) {
        pagamentosCards.innerHTML = `
            <p class="mensagem-vazia">
                Nenhuma reserva ativa cadastrada.
            </p>
        `;
    } else {
        pagamentosCards.innerHTML = reservas.map((reserva, indice) => {
            const pagamento = obterValoresPagamento(reserva);

            const valorBaseParcelamento = pagamento.pago > 0
                ? pagamento.pago
                : pagamento.total;

            const detalhesParcelamento = obterDetalhesParcelamento(
                reserva,
                valorBaseParcelamento,
                "reserva",
                indice
            );

            const progresso = pagamento.total > 0
                ? (pagamento.pago / pagamento.total) * 100
                : 0;

            const formaPagamento = obterFormaPagamentoHospedagem(reserva);

            return `
                <div
                    class="financeiro-card"
                    style="width:100%; box-sizing:border-box; flex:0 0 auto;"
                >
                    <div class="financeiro-card-topo">
                        <div>
                            <h3>${escaparHTML(obterNomePet(reserva))}</h3>

                            <small style="font-size:13px; color:#777;">
                                Tutor: ${escaparHTML(obterNomeTutor(reserva))}
                            </small>
                        </div>

                        <span class="status-pagamento">
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
                            <strong>${moeda(pagamento.pago)}</strong>
                        </div>

                        <div class="financeiro-valor-item">
                            <span>Valor restante</span>
                            <strong>${moeda(pagamento.restante)}</strong>
                        </div>
                    </div>

                    <div class="financeiro-progresso">
                        <div class="financeiro-progresso-barra">
                            <span style="width:${progresso}%"></span>
                        </div>
                    </div>

                    <p
                        class="financeiro-forma"
                        style="color:#FFFFFF; margin-top:14px; padding-top:8px;"
                    >
                        ${escaparHTML(formaPagamento)}
                    </p>

                    ${detalhesParcelamento}
                </div>
            `;
        }).join("");
    }

    if (
        !btnVerArquivados ||
        !arquivadosArea ||
        !arquivadosCards
    ) {
        return;
    }

    const quantidade = historicoArquivado.length;
    const arquivadosAbertos =
        btnVerArquivados.dataset.aberto === "true";

    if (quantidade === 0) {
        btnVerArquivados.style.display = "none";
        btnVerArquivados.dataset.aberto = "false";

        arquivadosArea.style.display = "none";
        arquivadosCards.innerHTML = "";

        return;
    }

    btnVerArquivados.style.display = "inline-block";

    btnVerArquivados.textContent = arquivadosAbertos
        ? "Ocultar arquivados"
        : `Ver arquivados (${quantidade})`;

    arquivadosArea.style.display =
        arquivadosAbertos ? "block" : "none";

    if (historicoArquivado.length === 0) {
        arquivadosCards.innerHTML = `
            <p class="mensagem-vazia">
                Nenhuma reserva arquivada encontrada.
            </p>
        `;
        return;
    }

    arquivadosCards.innerHTML = historicoArquivado.map(registro => `
        <div
            class="financeiro-card"
            style="width:100%; box-sizing:border-box; flex:0 0 auto;"
        >
            <div class="financeiro-card-topo">
                <h3>
                    ${escaparHTML(registro.petNome || "Pet não informado")}
                </h3>

                <span class="status-pagamento">Arquivada</span>
            </div>

            <div class="financeiro-valores">
                <div class="financeiro-valor-item">
                    <span>Tutor</span>
                    <strong>
                        ${escaparHTML(obterNomeTutor(registro))}
                    </strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Valor recebido</span>
                    <strong>${moeda(registro.valorPago)}</strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Data do pagamento</span>
                    <strong>${dataFormatada(registro.dataPagamento)}</strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Forma de pagamento</span>
                    <strong>
                        ${escaparHTML(registro.formaPagamento || "Não informado")}
                    </strong>
                </div>
            </div>

            <p class="financeiro-forma">
                Pagamento preservado de uma reserva arquivada.
                Não contabilizado novamente na receita automática.
            </p>
        </div>
    `).join("");
}

// ==============================
// ABRIR E FECHAR ARQUIVADOS
// ==============================

if (btnVerArquivados) {
    btnVerArquivados.addEventListener("click", () => {
        if (!arquivadosArea) return;

        const aberto =
            btnVerArquivados.dataset.aberto === "true";

        btnVerArquivados.dataset.aberto =
            aberto ? "false" : "true";

        atualizarFinanceiro();
    });
}

// ==============================
// EXCLUIR RESERVAS ARQUIVADAS
// ==============================

if (btnExcluirArquivados) {
    btnExcluirArquivados.addEventListener("click", () => {
        const historico = carregarLista(CHAVE_HISTORICO_RESERVAS);

        const reservasAtuais = carregarLista(CHAVE_RESERVAS);

        const idsAtivos = reservasAtuais.map(reserva =>
            String(reserva.id)
        );

        const arquivados = historico.filter(registro =>
            !idsAtivos.includes(String(registro.id))
        );

        if (arquivados.length === 0) {
            alert("Não existem reservas arquivadas para excluir.");
            return;
        }

        const confirmar = confirm(
            `Deseja realmente excluir todos os ${arquivados.length} registros arquivados?\n\n` +
            "Essa ação é permanente e não poderá ser desfeita.\n" +
            "As reservas ativas e as despesas serão preservadas."
        );

        if (!confirmar) return;

        try {
            const historicoAtualizado = historico.filter(registro =>
                idsAtivos.includes(String(registro.id))
            );

            localStorage.setItem(
                CHAVE_HISTORICO_RESERVAS,
                JSON.stringify(historicoAtualizado)
            );

            btnVerArquivados.dataset.aberto = "false";

            atualizarFinanceiro();

            alert("Reservas arquivadas excluídas com sucesso!");
        } catch (erro) {
            console.error("Erro ao excluir arquivados:", erro);
            alert("Não foi possível excluir os registros arquivados.");
        }
    });
}

// ==============================
// CARTÕES DE BANHO
// ==============================

function atualizarCartoesBanho() {
    if (!banhoCards) return;

    const recebidos = servicosBanho
        .map((item, indice) => ({ item, indice }))
        .filter(({ item }) => servicoFoiRecebido(item));

    if (recebidos.length === 0) {
        banhoCards.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum pagamento de banho registrado.
            </p>
        `;
        return;
    }

    banhoCards.innerHTML = recebidos.map(({ item, indice }) => {
        const valor = Number(item.valor) || 0;

        const formaPagamento = obterFormaPagamento(item, valor);

        const detalhesParcelamento = obterDetalhesParcelamento(
            item,
            valor,
            "banho",
            indice
        );

        return `
            <div class="financeiro-card">
                <div class="financeiro-card-topo">
                    <div>
                        <small style="font-size:13px; color:#777;">
                            Tutor: ${escaparHTML(obterNomeTutor(item))}
                        </small>

                        <h3 style="font-size:21px; margin-top:4px;">
                            ${escaparHTML(obterNomePet(item))}
                        </h3>
                    </div>
                </div>

                <div class="financeiro-valores">
                    <div class="financeiro-valor-item">
                        <span>Serviço</span>
                        <strong>
                            ${escaparHTML(item.servico || item.tipo || "Banho")}
                        </strong>
                    </div>

                    <div class="financeiro-valor-item">
                        <span>Data</span>
                        <strong>${dataFormatada(item.data)}</strong>
                    </div>

                    <div class="financeiro-valor-item">
                        <span>Horário</span>
                        <strong>${escaparHTML(item.horario || "-")}</strong>
                    </div>

                    <div class="financeiro-valor-item">
                        <span>Valor recebido</span>
                        <strong>${moeda(valor)}</strong>
                    </div>

                    <div class="financeiro-valor-item">
                        <span>Forma de pagamento</span>
                        <strong>${escaparHTML(formaPagamento)}</strong>
                    </div>
                </div>

                ${detalhesParcelamento}
            </div>
        `;
    }).join("");
}

// ==============================
// CARTÕES VETERINÁRIOS
// ==============================

function atualizarCartoesVet() {
    if (!vetCards) return;

    const recebidos = atendimentosVet
        .map((item, indice) => ({ item, indice }))
        .filter(({ item }) => servicoFoiRecebido(item));

    if (recebidos.length === 0) {
        vetCards.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum pagamento veterinário registrado.
            </p>
        `;
        return;
    }

    vetCards.innerHTML = recebidos.map(({ item, indice }) => {
        const valor = Number(item.valor) || 0;

        const formaPagamento = obterFormaPagamento(item, valor);

        const detalhesParcelamento = obterDetalhesParcelamento(
            item,
            valor,
            "vet",
            indice
        );

        return `
            <div class="financeiro-card">
                <div class="financeiro-card-topo">
                    <div>
                        <small style="font-size:13px; color:#777;">
                            Tutor: ${escaparHTML(obterNomeTutor(item))}
                        </small>

                        <h3 style="font-size:21px; margin-top:4px;">
                            ${escaparHTML(obterNomePet(item))}
                        </h3>
                    </div>
                </div>

                <div class="financeiro-valores">
                    <div class="financeiro-valor-item">
                        <span>Procedimento</span>
                        <strong>
                            ${escaparHTML(item.procedimento || item.categoria || "Veterinário")}
                        </strong>
                    </div>

                    <div class="financeiro-valor-item">
                        <span>Data</span>
                        <strong>${dataFormatada(item.data)}</strong>
                    </div>

                    <div class="financeiro-valor-item">
                        <span>Horário</span>
                        <strong>${escaparHTML(item.horario || "-")}</strong>
                    </div>

                    <div class="financeiro-valor-item">
                        <span>Valor recebido</span>
                        <strong>${moeda(valor)}</strong>
                    </div>

                    <div class="financeiro-valor-item">
                        <span>Forma de pagamento</span>
                        <strong>${escaparHTML(formaPagamento)}</strong>
                    </div>
                </div>

                ${detalhesParcelamento}
            </div>
        `;
    }).join("");
}

// ==============================
// CARTÕES DE DESPESAS
// ==============================

function atualizarCartoesDespesas() {
    if (!despesasCards) return;

    if (despesas.length === 0) {
        despesasCards.innerHTML = `
            <p class="mensagem-vazia">
                Nenhuma despesa cadastrada.
            </p>
        `;
        return;
    }

    despesasCards.innerHTML = despesas.map((despesa, indice) => `
        <div class="financeiro-card">
            <div class="financeiro-card-topo">
                <h3>${escaparHTML(despesa.descricao || "Despesa")}</h3>

                <button
                    type="button"
                    class="btn-excluir"
                    onclick="excluirDespesa(${indice})"
                >
                    Excluir
                </button>
            </div>

            <div class="financeiro-valores">
                <div class="financeiro-valor-item">
                    <span>Categoria</span>
                    <strong>${escaparHTML(despesa.categoria || "-")}</strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Data</span>
                    <strong>${dataFormatada(despesa.data)}</strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Valor</span>
                    <strong>${moeda(despesa.valor)}</strong>
                </div>
            </div>
        </div>
    `).join("");
}

// ==============================
// CADASTRAR DESPESA
// ==============================

if (despesaForm) {
    despesaForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const descricao = document.getElementById("despesaDescricao");
        const categoria = document.getElementById("despesaCategoria");
        const valor = document.getElementById("despesaValor");
        const data = document.getElementById("despesaData");

        if (!descricao || !valor || !data) return;

        const novaDespesa = {
            id: Date.now(),
            descricao: descricao.value.trim(),
            categoria: categoria ? categoria.value : "",
            valor: Number(valor.value),
            data: data.value
        };

        if (!novaDespesa.descricao || novaDespesa.valor <= 0) {
            alert("Preencha a descrição e um valor válido.");
            return;
        }

        despesas.push(novaDespesa);

        salvarDespesas();

        despesaForm.reset();

        atualizarFinanceiro();
    });
}

// ==============================
// EXCLUIR DESPESA
// ==============================

function excluirDespesa(indice) {
    if (!confirm("Deseja realmente excluir esta despesa?")) {
        return;
    }

    despesas.splice(indice, 1);

    salvarDespesas();

    atualizarFinanceiro();
}

// ==============================
// FUNCIONÁRIOS E COMISSÕES
// ==============================

const btnFuncionarios = document.getElementById("btnFuncionarios");
const funcionariosArea = document.getElementById("funcionariosArea");

const funcionarioForm = document.getElementById("funcionarioForm");
const funcionarioId = document.getElementById("funcionarioId");
const funcionarioNome = document.getElementById("funcionarioNome");
const funcionarioComissao = document.getElementById("funcionarioComissao");

const funcionariosCards = document.getElementById("funcionariosCards");

const tituloFormFuncionario = document.getElementById("tituloFormFuncionario");
const btnSalvarFuncionario = document.getElementById("btnSalvarFuncionario");
const btnCancelarEdicaoFuncionario = document.getElementById("btnCancelarEdicaoFuncionario");

const registroFuncionarioForm = document.getElementById("registroFuncionarioForm");
const registroFuncionario = document.getElementById("registroFuncionario");
const registroData = document.getElementById("registroData");
const registroSetor = document.getElementById("registroSetor");
const registroValor = document.getElementById("registroValor");

const registrosFuncionariosCards = document.getElementById("registrosFuncionariosCards");
const totalComissoes = document.getElementById("totalComissoes");

// ==============================
// ABRIR E FECHAR FUNCIONÁRIOS
// ==============================

if (btnFuncionarios && funcionariosArea) {
    btnFuncionarios.addEventListener("click", () => {
        funcionariosArea.hidden = !funcionariosArea.hidden;

        btnFuncionarios.textContent = funcionariosArea.hidden
            ? "👥 Funcionários"
            : "✖ Fechar funcionários";

        if (!funcionariosArea.hidden) {
            atualizarFuncionarios();
        }
    });
}

// ==============================
// DATA ATUAL
// ==============================

function obterDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

if (registroData && !registroData.value) {
    registroData.value = obterDataHoje();
}

// ==============================
// SALVAR FUNCIONÁRIO
// ==============================

function salvarFuncionarios() {
    localStorage.setItem(
        CHAVE_FUNCIONARIOS,
        JSON.stringify(funcionarios)
    );
}

function salvarRegistrosFuncionarios() {
    localStorage.setItem(
        CHAVE_REGISTROS_FUNCIONARIOS,
        JSON.stringify(registrosFuncionarios)
    );
}

// ==============================
// CADASTRAR E EDITAR FUNCIONÁRIO
// ==============================

if (funcionarioForm) {
    funcionarioForm.addEventListener("submit", event => {
        event.preventDefault();

        const nome = funcionarioNome.value.trim();
        const comissao = Number(funcionarioComissao.value);
        const idEdicao = funcionarioId.value;

        if (!nome) {
            alert("Informe o nome do funcionário.");
            return;
        }

        if (
            funcionarioComissao.value.trim() === "" ||
            !Number.isFinite(comissao) ||
            comissao < 0 ||
            comissao > 100
        ) {
            alert("Informe uma comissão entre 0% e 100%.");
            return;
        }

        try {
            if (idEdicao) {
                const funcionario = funcionarios.find(item =>
                    String(item.id) === String(idEdicao)
                );

                if (!funcionario) {
                    alert("Funcionário não encontrado.");
                    return;
                }

                funcionario.nome = nome;
                funcionario.comissao = comissao;

                salvarFuncionarios();

                alert("Funcionário atualizado com sucesso!");
            } else {
                funcionarios.push({
                    id: Date.now(),
                    nome,
                    comissao
                });

                salvarFuncionarios();

                alert("Funcionário cadastrado com sucesso!");
            }

            limparFormularioFuncionario();
            atualizarFuncionarios();

        } catch (erro) {
            console.error("Erro ao salvar funcionário:", erro);
            alert("Não foi possível salvar o funcionário.");
        }
    });
}

function limparFormularioFuncionario() {
    if (!funcionarioForm) return;

    funcionarioForm.reset();

    funcionarioId.value = "";

    tituloFormFuncionario.textContent = "Cadastrar funcionário";
    btnSalvarFuncionario.textContent = "Cadastrar funcionário";

    btnCancelarEdicaoFuncionario.hidden = true;
}

if (btnCancelarEdicaoFuncionario) {
    btnCancelarEdicaoFuncionario.addEventListener("click", () => {
        limparFormularioFuncionario();
    });
}

// ==============================
// EDITAR E EXCLUIR FUNCIONÁRIO
// ==============================

if (funcionariosCards) {
    funcionariosCards.addEventListener("click", event => {
        const botaoEditar = event.target.closest(".btn-editar-funcionario");
        const botaoExcluir = event.target.closest(".btn-excluir-funcionario");

        if (botaoEditar) {
            const id = botaoEditar.dataset.id;

            const funcionario = funcionarios.find(item =>
                String(item.id) === String(id)
            );

            if (!funcionario) return;

            funcionarioId.value = funcionario.id;
            funcionarioNome.value = funcionario.nome;
            funcionarioComissao.value = funcionario.comissao;

            tituloFormFuncionario.textContent = "Editar funcionário";
            btnSalvarFuncionario.textContent = "Salvar alterações";
            btnCancelarEdicaoFuncionario.hidden = false;

            funcionarioNome.focus();

            return;
        }

        if (botaoExcluir) {
            const id = botaoExcluir.dataset.id;

            const funcionario = funcionarios.find(item =>
                String(item.id) === String(id)
            );

            if (!funcionario) return;

            const confirmar = confirm(
                `Deseja excluir o funcionário ${funcionario.nome}?\n\n` +
                "Os registros de trabalho e as comissões anteriores serão preservados."
            );

            if (!confirmar) return;

            funcionarios = funcionarios.filter(item =>
                String(item.id) !== String(id)
            );

            salvarFuncionarios();
            limparFormularioFuncionario();
            atualizarFuncionarios();
        }
    });
}

// ==============================
// REGISTRAR DIA TRABALHADO
// ==============================

if (registroFuncionarioForm) {
    registroFuncionarioForm.addEventListener("submit", event => {
        event.preventDefault();

        const idFuncionario = registroFuncionario.value;
        const data = registroData.value;
        const setor = registroSetor.value;
        const valor = Number(registroValor.value);

        const funcionario = funcionarios.find(item =>
            String(item.id) === String(idFuncionario)
        );

        if (!funcionario) {
            alert("Selecione um funcionário cadastrado.");
            return;
        }

        if (!obterDataPagamento(data)) {
            alert("Informe uma data válida.");
            return;
        }

        if (!setor) {
            alert("Selecione o setor em que o funcionário trabalhou.");
            return;
        }

        if (
            registroValor.value.trim() === "" ||
            !Number.isFinite(valor) ||
            valor <= 0
        ) {
            alert("Informe um valor de serviço válido.");
            return;
        }

        const porcentagem = Number(funcionario.comissao) || 0;
        const valorComissao = valor * (porcentagem / 100);

        const novoRegistro = {
            id: Date.now(),
            funcionarioId: funcionario.id,
            funcionarioNome: funcionario.nome,
            data,
            setor,
            valorServico: valor,
            comissaoPorcentagem: porcentagem,
            valorComissao
        };

        try {
            registrosFuncionarios.push(novoRegistro);
            salvarRegistrosFuncionarios();

            registroFuncionarioForm.reset();
            registroData.value = obterDataHoje();

            atualizarFuncionarios();

            alert("Trabalho registrado com sucesso!");
        } catch (erro) {
            console.error("Erro ao registrar trabalho:", erro);

            registrosFuncionarios = registrosFuncionarios.filter(item =>
                String(item.id) !== String(novoRegistro.id)
            );

            alert("Não foi possível registrar o trabalho.");
        }
    });
}

// ==============================
// EXCLUIR REGISTRO DE TRABALHO
// ==============================

if (registrosFuncionariosCards) {
    registrosFuncionariosCards.addEventListener("click", event => {
        const botao = event.target.closest(
            ".btn-excluir-registro-funcionario"
        );

        if (!botao) return;

        const id = botao.dataset.id;

        const confirmar = confirm(
            "Deseja excluir este registro de trabalho?"
        );

        if (!confirmar) return;

        registrosFuncionarios = registrosFuncionarios.filter(item =>
            String(item.id) !== String(id)
        );

        salvarRegistrosFuncionarios();
        atualizarFuncionarios();
    });
}

// ==============================
// ATUALIZAR ÁREA DE FUNCIONÁRIOS
// ==============================

function atualizarFuncionarios() {
    funcionarios = carregarLista(CHAVE_FUNCIONARIOS);
    registrosFuncionarios = carregarLista(CHAVE_REGISTROS_FUNCIONARIOS);

    atualizarSelectFuncionarios();
    atualizarCartoesFuncionarios();
    atualizarRegistrosFuncionarios();
}

// ==============================
// ATUALIZAR SELECT DE FUNCIONÁRIOS
// ==============================

function atualizarSelectFuncionarios() {
    if (!registroFuncionario) return;

    const valorSelecionado = registroFuncionario.value;

    registroFuncionario.innerHTML = `
        <option value="">Selecione o funcionário</option>

        ${funcionarios.map(funcionario => `
            <option value="${escaparHTML(funcionario.id)}">
                ${escaparHTML(funcionario.nome)}
            </option>
        `).join("")}
    `;

    if (funcionarios.some(item =>
        String(item.id) === String(valorSelecionado)
    )) {
        registroFuncionario.value = valorSelecionado;
    }
}

// ==============================
// CARTÕES DE FUNCIONÁRIOS
// ==============================

function atualizarCartoesFuncionarios() {
    if (!funcionariosCards) return;

    if (funcionarios.length === 0) {
        funcionariosCards.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum funcionário cadastrado.
            </p>
        `;
        return;
    }

    funcionariosCards.innerHTML = funcionarios.map(funcionario => `
        <div class="financeiro-card">

            <div class="financeiro-card-topo">
                <h3>${escaparHTML(funcionario.nome)}</h3>

                <strong style="color:#EB9933;">
                    ${Number(funcionario.comissao).toLocaleString("pt-BR")}% de comissão
                </strong>
            </div>

            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">

                <button
                    type="button"
                    class="btn-primary btn-editar-funcionario"
                    data-id="${escaparHTML(funcionario.id)}"
                >
                    Editar
                </button>

                <button
                    type="button"
                    class="btn-excluir btn-excluir-funcionario"
                    data-id="${escaparHTML(funcionario.id)}"
                >
                    Excluir
                </button>

            </div>

        </div>
    `).join("");
}

// ==============================
// HISTÓRICO E TOTAL DE COMISSÕES
// ==============================

function atualizarRegistrosFuncionarios() {
    if (!registrosFuncionariosCards) return;

    const total = registrosFuncionarios.reduce((soma, registro) => {
        return soma + (Number(registro.valorComissao) || 0);
    }, 0);

    if (totalComissoes) {
        totalComissoes.textContent = moeda(total);
    }

    if (registrosFuncionarios.length === 0) {
        registrosFuncionariosCards.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum trabalho registrado.
            </p>
        `;
        return;
    }

    const registrosOrdenados = [...registrosFuncionarios].sort((a, b) =>
        String(b.data || "").localeCompare(String(a.data || ""))
    );

    registrosFuncionariosCards.innerHTML = registrosOrdenados.map(registro => `
        <div class="financeiro-card">

            <div class="financeiro-card-topo">
                <div>
                    <h3>${escaparHTML(registro.funcionarioNome)}</h3>

                    <small style="color:#777;">
                        ${escaparHTML(registro.setor)}
                    </small>
                </div>

                <button
                    type="button"
                    class="btn-excluir btn-excluir-registro-funcionario"
                    data-id="${escaparHTML(registro.id)}"
                >
                    Excluir
                </button>
            </div>

            <div class="financeiro-valores">

                <div class="financeiro-valor-item">
                    <span>Data trabalhada</span>
                    <strong>${dataFormatada(registro.data)}</strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Setor</span>
                    <strong>${escaparHTML(registro.setor)}</strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Valor do serviço</span>
                    <strong>${moeda(registro.valorServico)}</strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Comissão aplicada</span>
                    <strong>
                        ${Number(registro.comissaoPorcentagem).toLocaleString("pt-BR")}%
                    </strong>
                </div>

                <div class="financeiro-valor-item">
                    <span>Comissão gerada</span>
                    <strong style="color:#EB9933;">
                        ${moeda(registro.valorComissao)}
                    </strong>
                </div>

            </div>
        </div>
    `).join("");
}

// ==============================
// ATUALIZAÇÕES AUTOMÁTICAS
// ==============================

window.addEventListener("storage", () => {
    atualizarFinanceiro();
    atualizarFuncionarios();
});

window.addEventListener("pageshow", () => {
    atualizarFinanceiro();
    atualizarFuncionarios();
});

document.addEventListener("DOMContentLoaded", () => {
    atualizarFinanceiro();
    atualizarFuncionarios();
});

// ==============================
// INICIALIZAÇÃO
// ==============================

configurarAjustesFinanceiros();
configurarEventosAjustes();
configurarBotoesZerar();

atualizarFinanceiro();
atualizarFuncionarios();