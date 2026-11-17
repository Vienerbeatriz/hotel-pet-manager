
(() => {
    const CONFIG_KEY_CONFIGURACOES = "hotelPetConfiguracoes";

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
    const modoEscuro = document.getElementById("modoEscuro");

    function obterConfiguracoesSalvas() {
        try {
            return JSON.parse(
                localStorage.getItem(CONFIG_KEY_CONFIGURACOES)
            ) || {};
        } catch {
            return {};
        }
    }

    function aplicarTema(escuro) {
        document.body.classList.toggle("modo-escuro", escuro);

        if (modoEscuro) {
            modoEscuro.checked = escuro;
        }
    }

    function atualizarNomeHotelConfiguracoes() {
        const config = obterConfiguracoesSalvas();
        const nome = config.nome || "Hotel Pet Manager";

        document.querySelectorAll(".nomeHotelDinamico").forEach(elemento => {
            elemento.textContent = nome;
        });
    }

    function carregarConfiguracoes() {
        const config = obterConfiguracoesSalvas();

        nomeHotel.value = config.nome || "Hotel Pet Manager";
        telefoneHotel.value = config.telefone || "";
        enderecoHotel.value = config.endereco || "";
        capacidadeHotel.value = config.capacidade || 10;

        avisoReservas.checked = config.avisoReservas !== false;
        avisoPagamentos.checked = config.avisoPagamentos !== false;

        aplicarTema(config.modoEscuro === true);

        atualizarNomeHotelConfiguracoes();
    }

    function atualizarNomeDigitado() {
        const nome = nomeHotel.value.trim() || "Hotel Pet Manager";

        document.querySelectorAll(".nomeHotelDinamico").forEach(elemento => {
            elemento.textContent = nome;
        });
    }

    function obterConfiguracoes() {
        const configAnterior = obterConfiguracoesSalvas();

        return {
            ...configAnterior,
            nome: nomeHotel.value.trim(),
            telefone: telefoneHotel.value.trim(),
            endereco: enderecoHotel.value.trim(),
            capacidade: Number(capacidadeHotel.value),
            avisoReservas: avisoReservas.checked,
            avisoPagamentos: avisoPagamentos.checked,
            modoEscuro: modoEscuro ? modoEscuro.checked : false
        };
    }

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

        localStorage.setItem(
            CONFIG_KEY_CONFIGURACOES,
            JSON.stringify(config)
        );

        aplicarTema(config.modoEscuro);

        atualizarNomeHotelConfiguracoes();

        window.dispatchEvent(
            new Event("hotelPetConfiguracoesAtualizadas")
        );

        return true;
    }

    configForm.addEventListener("submit", evento => {
        evento.preventDefault();

        if (salvarConfiguracoes()) {
            alert("Configurações salvas com sucesso!");
        }
    });

    document.getElementById("salvarNotificacoes").addEventListener("click", () => {
        if (salvarConfiguracoes()) {
            alert("Preferências salvas com sucesso!");
        }
    });

    if (modoEscuro) {
        modoEscuro.addEventListener("change", () => {
            aplicarTema(modoEscuro.checked);

            const config = obterConfiguracoesSalvas();
            config.modoEscuro = modoEscuro.checked;

            localStorage.setItem(
                CONFIG_KEY_CONFIGURACOES,
                JSON.stringify(config)
            );

            window.dispatchEvent(
                new Event("hotelPetConfiguracoesAtualizadas")
            );
        });
    }

    document.getElementById("exportarBackup").addEventListener("click", () => {
        const backup = {
            sistema: "Hotel Pet Manager",
            dataExportacao: new Date().toISOString(),
            dados: {}
        };

        CHAVES_BACKUP.forEach(chave => {
            try {
                const valor = localStorage.getItem(chave);
                backup.dados[chave] = valor ? JSON.parse(valor) : [];
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

    nomeHotel.addEventListener("input", atualizarNomeDigitado);

    window.addEventListener("storage", carregarConfiguracoes);
    window.addEventListener("pageshow", carregarConfiguracoes);

    window.addEventListener(
        "hotelPetConfiguracoesAtualizadas",
        atualizarNomeHotelConfiguracoes
    );

    carregarConfiguracoes();

    console.log("Configurações iniciadas com sucesso!");
})();
