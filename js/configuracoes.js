
const CONFIG_KEY = "hotelPetConfiguracoes";

const CHAVES_BACKUP = [
    "hotelPetClientes",
    "hotelPetAnimais",
    "hotelPetReservas",
    "hotelPetDespesas",
    "hotelPetConfiguracoes"
];

const configForm = document.getElementById("configForm");

const nomeHotel = document.getElementById("nomeHotel");
const telefoneHotel = document.getElementById("telefoneHotel");
const enderecoHotel = document.getElementById("enderecoHotel");
const capacidadeHotel = document.getElementById("capacidadeHotel");

const avisoReservas = document.getElementById("avisoReservas");
const avisoPagamentos = document.getElementById("avisoPagamentos");

// Busca as configurações salvas
function obterConfiguracoesSalvas() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
    } catch {
        return {};
    }
}

// Atualiza o nome do hotel em toda a página
function atualizarNomeHotel() {
    const config = obterConfiguracoesSalvas();
    const nome = config.nome || "Hotel Pet Manager";

    document.querySelectorAll(".nomeHotelDinamico").forEach(elemento => {
        elemento.textContent = nome;
    });
}

// Carrega as configurações
function carregarConfiguracoes() {
    const config = obterConfiguracoesSalvas();

    nomeHotel.value = config.nome || "Hotel Pet Manager";
    telefoneHotel.value = config.telefone || "";
    enderecoHotel.value = config.endereco || "";
    capacidadeHotel.value = config.capacidade || 10;

    avisoReservas.checked = config.avisoReservas !== false;
    avisoPagamentos.checked = config.avisoPagamentos !== false;

    atualizarNomeHotel();
}

// Atualiza o nome enquanto é digitado
function atualizarNomeDigitado() {
    const nome = nomeHotel.value.trim() || "Hotel Pet Manager";

    document.querySelectorAll(".nomeHotelDinamico").forEach(elemento => {
        elemento.textContent = nome;
    });
}

// Organiza os dados para salvar
function obterConfiguracoes() {
    return {
        nome: nomeHotel.value.trim(),
        telefone: telefoneHotel.value.trim(),
        endereco: enderecoHotel.value.trim(),
        capacidade: Number(capacidadeHotel.value),
        avisoReservas: avisoReservas.checked,
        avisoPagamentos: avisoPagamentos.checked
    };
}

// Salva as configurações
function salvarConfiguracoes() {
    const capacidade = Number(capacidadeHotel.value);

    if (!Number.isInteger(capacidade) || capacidade < 1) {
        alert("Informe uma quantidade de vagas válida.");
        return false;
    }

    const config = obterConfiguracoes();

    if (!config.nome) {
        alert("Informe o nome do hotel.");
        return false;
    }

    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));

    atualizarNomeHotel();

    window.dispatchEvent(
        new Event("hotelPetConfiguracoesAtualizadas")
    );

    return true;
}

// Salvar dados do estabelecimento
configForm.addEventListener("submit", function(evento) {
    evento.preventDefault();

    if (salvarConfiguracoes()) {
        alert("Configurações salvas com sucesso!");
    }
});

// Salvar preferências de notificações
document.getElementById("salvarNotificacoes")
    .addEventListener("click", function() {

        if (salvarConfiguracoes()) {
            alert("Preferências de notificações salvas!");
        }
    });

// Exportar backup
document.getElementById("exportarBackup")
    .addEventListener("click", function() {

        const backup = {
            sistema: "Hotel Pet Manager",
            dataExportacao: new Date().toISOString(),
            dados: {}
        };

        CHAVES_BACKUP.forEach(chave => {
            try {
                const valor = localStorage.getItem(chave);

                backup.dados[chave] = valor
                    ? JSON.parse(valor)
                    : [];
            } catch {
                backup.dados[chave] = [];
            }
        });

        const arquivo = new Blob(
            [JSON.stringify(backup, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(arquivo);

        const link = document.createElement("a");
        link.href = url;
        link.download = "backup-hotel-pet-manager.json";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        alert("Backup exportado com sucesso!");
    });

// Atualiza o nome enquanto digita
nomeHotel.addEventListener("input", atualizarNomeDigitado);

// Sincronização com outras páginas
window.addEventListener("storage", carregarConfiguracoes);

window.addEventListener("pageshow", carregarConfiguracoes);

window.addEventListener(
    "hotelPetConfiguracoesAtualizadas",
    atualizarNomeHotel
);

// Inicialização
carregarConfiguracoes();

console.log("Configurações iniciadas com sucesso!");
