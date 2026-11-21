
// CHAVES DO LOCALSTORAGE

const CONFIG_KEY = "hotelPetConfiguracoes";
const RESERVAS_KEY = "hotelPetReservas";
const CLIENTES_KEY = "hotelPetClientes";
const PETS_KEY = "hotelPetAnimais";
const BANHO_KEY = "petsitterAgendaBanho";
const VET_KEY = "petsitterAgendaVet";
const DESPESAS_KEY = "hotelPetDespesas";
const NOTIFICACOES_LIDAS_KEY = "hotelPetNotificacoesLidas";

// FUNÇÕES GERAIS

function carregarLista(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function carregarConfiguracoes() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
    } catch {
        return {};
    }
}

function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
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

function obterDataLocal() {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function dataFormatada(data) {
    if (!data) return "-";

    const partes = String(data).split("-");

    if (partes.length !== 3) return "-";

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function registroCancelado(item) {
    const status = String(item.status || "")
        .trim()
        .toLowerCase();

    return status === "cancelado" ||
           status === "cancelada";
}

// TEMA CLARO E ESCURO

function aplicarTema() {
    const config = carregarConfiguracoes();

    const modoEscuro =
        config.modoEscuro === true ||
        config.tema === "escuro";

    document.body.classList.toggle("modo-escuro", modoEscuro);

    const metaTema = document.querySelector(
        'meta[name="theme-color"]'
    );

    if (metaTema) {
        metaTema.setAttribute(
            "content",
            modoEscuro ? "#202923" : "#EB9933"
        );
    }
}

// NOME DINÂMICO DO HOTEL

function atualizarNomeHotel() {
    const config = carregarConfiguracoes();

    const nome =
        config.nomeHotel ||
        config.nomeEstabelecimento ||
        config.nome ||
        "Petsitter";

    document.querySelectorAll(".nomeHotelDinamico").forEach(elemento => {
        elemento.textContent = nome;
    });
}

// RELÓGIO E DATA

function atualizarRelogio() {
    const relogio = document.getElementById("relogioDigital");
    const dataAtual = document.getElementById("dataAtual");

    const agora = new Date();

    if (relogio) {
        relogio.textContent = agora.toLocaleTimeString("pt-BR");
    }

    if (dataAtual) {
        dataAtual.textContent = agora.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }
}

// DASHBOARD

function atualizarDashboard() {
    const reservas = carregarLista(RESERVAS_KEY);
    const clientes = carregarLista(CLIENTES_KEY);
    const banho = carregarLista(BANHO_KEY);
    const vet = carregarLista(VET_KEY);

    const hoje = obterDataLocal();

    atualizarPetsHospedados(reservas, hoje);
    atualizarReservasFuturas(reservas, hoje);
    atualizarClientes(clientes);
    atualizarReceitaMes(reservas, banho, vet, hoje);
    atualizarMovimentacoes(banho, vet, hoje);
    atualizarNotificacoes();
}

// PETS HOSPEDADOS

function atualizarPetsHospedados(reservas, hoje) {
    const elemento = document.getElementById("petsHospedados");

    if (!elemento) return;

    const hospedagensAtivas = reservas.filter(reserva => {
        if (registroCancelado(reserva)) return false;

        const entrada = reserva.entrada;
        const saida = reserva.saida;

        return entrada && saida &&
            entrada <= hoje &&
            saida >= hoje;
    });

    const petsUnicos = new Set(
        hospedagensAtivas.map(reserva =>
            reserva.petId ||
            reserva.petNome ||
            reserva.nomePet ||
            reserva.id
        )
    );

    elemento.textContent = petsUnicos.size;
}

// RESERVAS FUTURAS

function atualizarReservasFuturas(reservas, hoje) {
    const elemento = document.getElementById("reservasFuturas");

    if (!elemento) return;

    const futuras = reservas.filter(reserva => {
        if (registroCancelado(reserva)) return false;

        return reserva.entrada && reserva.entrada > hoje;
    });

    elemento.textContent = futuras.length;
}

// CLIENTES CADASTRADOS

function atualizarClientes(clientes) {
    const elemento = document.getElementById("clientesCadastrados");

    if (!elemento) return;

    elemento.textContent = clientes.length;
}

// RECEITA DO MÊS

function atualizarReceitaMes(reservas, banho, vet, hoje) {
    const elemento = document.getElementById("receitaMes");

    if (!elemento) return;

    const mesAtual = hoje.substring(0, 7);

    let total = 0;

    reservas.forEach(reserva => {
        if (registroCancelado(reserva)) return;

        const dataReferencia = reserva.entrada || "";

        if (!dataReferencia.startsWith(mesAtual)) return;

        total += Math.max(0, Number(reserva.valorPago) || 0);
    });

    banho.forEach(item => {
        if (registroCancelado(item)) return;
        if (!item.formaPagamento) return;
        if (!String(item.data || "").startsWith(mesAtual)) return;

        total += Math.max(0, Number(item.valor) || 0);
    });

    vet.forEach(item => {
        if (registroCancelado(item)) return;
        if (!item.formaPagamento) return;
        if (!String(item.data || "").startsWith(mesAtual)) return;

        total += Math.max(0, Number(item.valor) || 0);
    });

    elemento.textContent = moeda(total);
}

// PRÓXIMAS MOVIMENTAÇÕES

function atualizarMovimentacoes(banho, vet, hoje) {
    const container = document.getElementById("movimentacoesDashboard");

    if (!container) return;

    const movimentacoes = [];

    banho.forEach(item => {
        if (registroCancelado(item)) return;
        if (!item.data || item.data < hoje) return;

        movimentacoes.push({
            data: item.data,
            horario: item.horario || "",
            titulo: "Serviço de banho",
            descricao:
                item.petNome ||
                item.nomePet ||
                "Pet não identificado",
            icone: "🛁"
        });
    });

    vet.forEach(item => {
        if (registroCancelado(item)) return;
        if (!item.data || item.data < hoje) return;

        movimentacoes.push({
            data: item.data,
            horario: item.horario || "",
            titulo: "Atendimento veterinário",
            descricao:
                item.petNome ||
                item.nomePet ||
                "Pet não identificado",
            icone: "🩺"
        });
    });

    movimentacoes.sort((a, b) => {
        const dataA = `${a.data} ${a.horario}`;
        const dataB = `${b.data} ${b.horario}`;

        return dataA.localeCompare(dataB);
    });

    const proximas = movimentacoes.slice(0, 6);

    if (proximas.length === 0) {
        container.innerHTML = `
            <p class="empty-state">
                Nenhum agendamento futuro de banho ou veterinário.
            </p>
        `;
        return;
    }

    container.innerHTML = proximas.map(item => `
        <div class="movimentacao-item">
            <div class="movimentacao-icone">
                ${item.icone}
            </div>

            <div class="movimentacao-info">
                <strong>${escaparHTML(item.titulo)}</strong>
                <span>${escaparHTML(item.descricao)}</span>
            </div>

            <div class="movimentacao-data">
                <strong>${dataFormatada(item.data)}</strong>
                ${item.horario ? `
                    <span>${escaparHTML(item.horario)}</span>
                ` : ""}
            </div>
        </div>
    `).join("");
}

// ==========================================
// CENTRAL DE NOTIFICAÇÕES
// ==========================================

function carregarNotificacoesLidas() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(NOTIFICACOES_LIDAS_KEY)
        );

        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarNotificacoesLidas(lista) {
    localStorage.setItem(
        NOTIFICACOES_LIDAS_KEY,
        JSON.stringify(lista)
    );
}

function diasAteData(data) {
    if (!data) return null;

    const partes = String(data).split("-");

    if (partes.length !== 3) return null;

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    const dataAlvo = Date.UTC(ano, mes - 1, dia);

    const hojePartes = obterDataLocal().split("-");

    const dataHoje = Date.UTC(
        Number(hojePartes[0]),
        Number(hojePartes[1]) - 1,
        Number(hojePartes[2])
    );

    if (!Number.isFinite(dataAlvo)) return null;

    return Math.round(
        (dataAlvo - dataHoje) / 86400000
    );
}

function textoDataNotificacao(data) {
    const dias = diasAteData(data);

    if (dias === 0) return "Hoje";
    if (dias === 1) return "Amanhã";
    if (dias > 1) return `Em ${dias} dias`;

    return dataFormatada(data);
}

function criarIdNotificacao(tipo, item, data) {
    const identificador =
        item.id ??
        item.reservaId ??
        [
            item.petId || item.petNome || item.nomePet || "pet",
            item.data || data,
            item.horario || "",
            item.entrada || "",
            item.saida || ""
        ].join("-");

    return `${tipo}-${identificador}-${data}`;
}

function gerarNotificacoes() {
    const reservas = carregarLista(RESERVAS_KEY);
    const banho = carregarLista(BANHO_KEY);
    const vet = carregarLista(VET_KEY);

    const notificacoes = [];

    function adicionarNotificacao(tipo, item, data, titulo, icone) {
        if (!data || registroCancelado(item)) return;

        const dias = diasAteData(data);

        if (dias === null || dias < 0 || dias > 3) return;

        const pet =
            item.petNome ||
            item.nomePet ||
            item.nome ||
            "Pet não identificado";

        const horario = item.horario || "";

        notificacoes.push({
            id: criarIdNotificacao(tipo, item, data),
            tipo,
            titulo,
            pet,
            data,
            horario,
            icone,
            textoData: textoDataNotificacao(data)
        });
    }

    reservas.forEach(item => {
        adicionarNotificacao(
            "reserva",
            item,
            item.entrada,
            "Entrada de hospedagem",
            "🏨"
        );
    });

    banho.forEach(item => {
        adicionarNotificacao(
            "banho",
            item,
            item.data,
            "Banho agendado",
            "🛁"
        );
    });

    vet.forEach(item => {
        adicionarNotificacao(
            "vet",
            item,
            item.data,
            "Atendimento veterinário",
            "🩺"
        );
    });

    notificacoes.sort((a, b) => {
        const dataA = `${a.data} ${a.horario}`;
        const dataB = `${b.data} ${b.horario}`;

        return dataA.localeCompare(dataB);
    });

    return notificacoes;
}

function atualizarNotificacoes() {
    const contador = document.getElementById("contadorNotificacoes");
    const lista = document.getElementById("listaNotificacoes");

    if (!contador || !lista) return;

    const notificacoes = gerarNotificacoes();
    const lidas = carregarNotificacoesLidas();

    const quantidadeNaoLidas = notificacoes.filter(
        item => !lidas.includes(item.id)
    ).length;

    contador.textContent =
        quantidadeNaoLidas > 99 ? "99+" : quantidadeNaoLidas;

    contador.hidden = quantidadeNaoLidas === 0;

    if (notificacoes.length === 0) {
        lista.innerHTML = `
            <div class="notificacoes-vazio">
                <span style="font-size: 25px;">🐾</span>
                <p>Nenhum compromisso para os próximos 3 dias.</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = notificacoes.map(item => {
        const foiLida = lidas.includes(item.id);

        return `
            <div class="notificacao-item ${foiLida ? "" : "nao-lida"}">

                <div class="notificacao-icone">
                    ${item.icone}
                </div>

                <div class="notificacao-conteudo">
                    <strong>${escaparHTML(item.titulo)}</strong>

                    <p>
                        ${escaparHTML(item.pet)}
                        ${item.horario
                            ? ` às ${escaparHTML(item.horario)}`
                            : ""}
                    </p>

                    <small>
                        ${escaparHTML(item.textoData)}
                        • ${dataFormatada(item.data)}
                    </small>
                </div>

                ${foiLida ? `
                    <span class="btn-marcar-notificacao">
                        Lida
                    </span>
                ` : `
                    <button
                        type="button"
                        class="btn-marcar-notificacao"
                        data-notificacao-id="${encodeURIComponent(item.id)}"
                    >
                        Marcar lida
                    </button>
                `}

            </div>
        `;
    }).join("");
}

// ABRIR E FECHAR A CENTRAL

function configurarNotificacoes() {
    const botao = document.getElementById("btnNotificacoes");
    const painel = document.getElementById("painelNotificacoes");
    const botaoMarcarTodas = document.getElementById("btnMarcarTodas");
    const lista = document.getElementById("listaNotificacoes");

    if (!botao || !painel) return;

    if (botao.dataset.notificacoesConfiguradas === "true") {
        return;
    }

    botao.dataset.notificacoesConfiguradas = "true";

    botao.addEventListener("click", evento => {
        evento.stopPropagation();

        const vaiAbrir = painel.hidden;

        painel.hidden = !vaiAbrir;

        botao.setAttribute("aria-expanded", String(vaiAbrir));

        if (vaiAbrir) {
            atualizarNotificacoes();
        }
    });

    document.addEventListener("click", evento => {
        if (
            !painel.hidden &&
            !painel.contains(evento.target) &&
            !botao.contains(evento.target)
        ) {
            painel.hidden = true;
            botao.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            painel.hidden = true;
            botao.setAttribute("aria-expanded", "false");
        }
    });

    if (lista) {
        lista.addEventListener("click", evento => {
            const botaoLer = evento.target.closest(
                "[data-notificacao-id]"
            );

            if (!botaoLer) return;

            const id = decodeURIComponent(
                botaoLer.dataset.notificacaoId
            );

            const lidas = carregarNotificacoesLidas();

            if (!lidas.includes(id)) {
                lidas.push(id);
                salvarNotificacoesLidas(lidas);
            }

            atualizarNotificacoes();
        });
    }

    if (botaoMarcarTodas) {
        botaoMarcarTodas.addEventListener("click", () => {
            const notificacoes = gerarNotificacoes();
            const lidas = carregarNotificacoesLidas();

            notificacoes.forEach(item => {
                if (!lidas.includes(item.id)) {
                    lidas.push(item.id);
                }
            });

            salvarNotificacoesLidas(lidas);
            atualizarNotificacoes();
        });
    }
}

// ==========================================
// NOTIFICAÇÕES DO DISPOSITIVO
// ==========================================

async function configurarNotificacoesDispositivo() {
    const botao = document.getElementById(
        "btnAtivarNotificacoes"
    );

    const status = document.getElementById(
        "statusNotificacoesDispositivo"
    );

    if (!botao || !status) return;

    if (!("Notification" in window)) {
        status.textContent =
            "Este navegador não oferece suporte a notificações.";

        botao.disabled = true;
        return;
    }

    function atualizarStatus() {
        if (Notification.permission === "granted") {
            botao.textContent = "✓ Notificações ativadas";
            status.textContent =
                "O navegador já autorizou as notificações.";
            botao.disabled = true;

        } else if (Notification.permission === "denied") {
            botao.textContent = "Permissão bloqueada";
            status.textContent =
                "Altere a permissão nas configurações do navegador.";
            botao.disabled = true;

        } else {
            botao.textContent =
                "🔔 Ativar notificações no dispositivo";

            status.textContent =
                "Clique para permitir notificações neste navegador.";

            botao.disabled = false;
        }
    }

    atualizarStatus();

    if (botao.dataset.dispositivoConfigurado === "true") {
        return;
    }

    botao.dataset.dispositivoConfigurado = "true";

    botao.addEventListener("click", async () => {
        botao.disabled = true;
        status.textContent = "Solicitando permissão...";

        try {
            if (!("serviceWorker" in navigator)) {
                throw new Error("Service Worker não disponível.");
            }

            const permissao =
                await Notification.requestPermission();

            if (permissao !== "granted") {
                atualizarStatus();
                return;
            }

            const registro =
                await navigator.serviceWorker.ready;

            await registro.showNotification(
                "Petsitter ativado! 🐾",
                {
                    body: "As notificações do dispositivo foram ativadas.",
                    icon: "./img/logo-petsitter-transparente.png",
                    badge: "./img/logo-petsitter-transparente.png",
                    data: {
                        url: "./index.html"
                    }
                }
            );

            atualizarStatus();

        } catch (erro) {
            console.error(
                "Erro ao ativar notificações:",
                erro
            );

            botao.disabled = false;

            status.textContent =
                "Não foi possível ativar. Confira o Console.";
        }
    });
}

// MENU MOBILE

function configurarMenu() {
    const botaoMenu = document.getElementById("abrirMenu");
    const fundoMenu = document.getElementById("menuFundo");
    const sidebar = document.querySelector(".sidebar");

    if (!botaoMenu || !sidebar) {
        console.error("Elementos do menu não encontrados.");
        return;
    }

    if (botaoMenu.dataset.menuConfigurado === "true") {
        return;
    }

    botaoMenu.dataset.menuConfigurado = "true";

    function abrirMenu() {
        document.body.classList.add("menu-aberto");
        botaoMenu.setAttribute("aria-expanded", "true");
    }

    function fecharMenu() {
        document.body.classList.remove("menu-aberto");
        botaoMenu.setAttribute("aria-expanded", "false");
    }

    function alternarMenu(evento) {
        evento.stopPropagation();

        if (document.body.classList.contains("menu-aberto")) {
            fecharMenu();
        } else {
            abrirMenu();
        }
    }

    botaoMenu.addEventListener("click", alternarMenu);

    if (fundoMenu) {
        fundoMenu.addEventListener("click", fecharMenu);
    }

    sidebar.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", fecharMenu);
    });

    document.addEventListener("click", function (evento) {
        if (!document.body.classList.contains("menu-aberto")) {
            return;
        }

        const clicouNaSidebar = sidebar.contains(evento.target);
        const clicouNoBotao = botaoMenu.contains(evento.target);

        if (!clicouNaSidebar && !clicouNoBotao) {
            fecharMenu();
        }
    });

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            fecharMenu();
        }
    });
}

// INICIALIZAÇÃO

function iniciarAplicacao() {
    aplicarTema();
    atualizarNomeHotel();
    atualizarRelogio();

    configurarNotificacoes();
    configurarNotificacoesDispositivo();

    atualizarDashboard();
    configurarMenu();
}

iniciarAplicacao();

// ATUALIZA O RELÓGIO A CADA SEGUNDO

setInterval(atualizarRelogio, 1000);

// ATUALIZA OS DADOS AO VOLTAR PARA A PÁGINA

window.addEventListener("pageshow", () => {
    aplicarTema();
    atualizarNomeHotel();
    atualizarDashboard();
});

// ATUALIZA QUANDO OUTRA ABA ALTERA OS DADOS

window.addEventListener("storage", () => {
    aplicarTema();
    atualizarNomeHotel();
    atualizarDashboard();
});

// ATUALIZA PERIODICAMENTE OS INDICADORES E NOTIFICAÇÕES

setInterval(atualizarDashboard, 5000);
