
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

function atualizarAplicacao() {
    atualizarNomeHotel();
    atualizarRelogio();
}

atualizarAplicacao();
setInterval(atualizarRelogio, 1000);

window.addEventListener("storage", atualizarNomeHotel);

window.addEventListener("pageshow", atualizarAplicacao);

window.addEventListener(
    "hotelPetConfiguracoesAtualizadas",
    atualizarNomeHotel
);

console.log("Hotel Pet Manager iniciado!");
