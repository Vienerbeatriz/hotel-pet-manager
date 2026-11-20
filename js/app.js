
// CHAVES DO LOCALSTORAGE

const CONFIG_KEY = "hotelPetConfiguracoes";
const RESERVAS_KEY = "hotelPetReservas";
const CLIENTES_KEY = "hotelPetClientes";
const PETS_KEY = "hotelPetAnimais";
const BANHO_KEY = "petsitterAgendaBanho";
const VET_KEY = "petsitterAgendaVet";
const DESPESAS_KEY = "hotelPetDespesas";

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

// MENU MOBILE

function configurarMenu() {
    const botaoMenu = document.getElementById("abrirMenu");
    const fundoMenu = document.getElementById("menuFundo");
    const sidebar = document.querySelector(".sidebar");

    if (!botaoMenu || !sidebar) {
        console.error("Elementos do menu não encontrados.");
        return;
    }

    // Evita configurar os eventos mais de uma vez
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

    // Abrir e fechar pelo botão
    botaoMenu.addEventListener("click", alternarMenu);

    // Fechar pelo fundo escuro
    if (fundoMenu) {
        fundoMenu.addEventListener("click", fecharMenu);
    }

    // Fechar ao clicar em um link
    sidebar.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", fecharMenu);
    });

    // Fechar ao clicar fora do menu
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

    // Fechar com ESC
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

// ATUALIZA PERIODICAMENTE OS INDICADORES

setInterval(atualizarDashboard, 5000);
