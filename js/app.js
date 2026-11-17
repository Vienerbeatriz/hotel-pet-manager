
const CONFIG_KEY = "hotelPetConfiguracoes";

function obterConfiguracoes() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
    } catch {
        return {};
    }
}

function atualizarNomeHotel() {
    const config = obterConfiguracoes();
    const nome = config.nome || "Hotel Pet Manager";

    document.querySelectorAll(".nomeHotelDinamico").forEach(elemento => {
        elemento.textContent = nome;
    });
}

/* MODO ESCURO */

function aplicarTema() {
    const config = obterConfiguracoes();
    const escuro = config.modoEscuro === true;

    document.body.classList.toggle("modo-escuro", escuro);

    const metaTheme = document.querySelector('meta[name="theme-color"]');

    if (metaTheme) {
        metaTheme.setAttribute(
            "content",
            escuro ? "#202923" : "#52765C"
        );
    }
}

/* RELÓGIO */

function atualizarRelogio() {
    const relogio = document.getElementById("relogioDigital");
    const dataAtual = document.getElementById("dataAtual");

    if (!relogio || !dataAtual) return;

    const agora = new Date();

    relogio.textContent = agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    const data = agora.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    dataAtual.textContent =
        data.charAt(0).toUpperCase() + data.slice(1);
}

/* MENU LATERAL */

function configurarMenu() {
    const botaoAbrir = document.getElementById("abrirMenu");
    const fundo = document.getElementById("menuFundo");

    if (!botaoAbrir || !fundo) return;

    if (botaoAbrir.dataset.menuConfigurado === "true") return;

    botaoAbrir.dataset.menuConfigurado = "true";

    function abrirMenu() {
        document.body.classList.add("menu-aberto");
        botaoAbrir.setAttribute("aria-expanded", "true");
    }

    function fecharMenu() {
        document.body.classList.remove("menu-aberto");
        botaoAbrir.setAttribute("aria-expanded", "false");
    }

    function alternarMenu() {
        const menuAberto = document.body.classList.contains("menu-aberto");

        if (menuAberto) {
            fecharMenu();
        } else {
            abrirMenu();
        }
    }

    botaoAbrir.addEventListener("click", alternarMenu);
    fundo.addEventListener("click", fecharMenu);

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            fecharMenu();
        }
    });

    document.querySelectorAll(".sidebar nav a").forEach(link => {
        link.addEventListener("click", fecharMenu);
    });
}

/* ATUALIZAÇÃO GERAL */

function atualizarAplicacao() {
    configurarMenu();
    atualizarNomeHotel();
    aplicarTema();
    atualizarRelogio();
}

atualizarAplicacao();

setInterval(atualizarRelogio, 1000);

window.addEventListener("storage", () => {
    atualizarNomeHotel();
    aplicarTema();
});

window.addEventListener("pageshow", atualizarAplicacao);

window.addEventListener(
    "hotelPetConfiguracoesAtualizadas",
    () => {
        atualizarNomeHotel();
        aplicarTema();
    }
);

console.log("Hotel Pet Manager iniciado!");
