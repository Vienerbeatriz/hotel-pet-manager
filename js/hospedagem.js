
(() => {
    const RESERVATION_KEY = "hotelPetReservas";
    const CONFIG_KEY_HOSPEDAGEM = "hotelPetConfiguracoes";
    const CAPACIDADE_PADRAO = 10;

    const tabela = document.getElementById("hospedagemTable");

    function obterConfiguracoes() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG_KEY_HOSPEDAGEM)) || {};
        } catch {
            return {};
        }
    }

    function atualizarNomeHotelHospedagem() {
        const config = obterConfiguracoes();
        const nome = config.nome || "Hotel Pet Manager";

        document.querySelectorAll(".nomeHotelDinamico").forEach(elemento => {
            elemento.textContent = nome;
        });
    }

    function carregarReservas() {
        try {
            const dados = JSON.parse(localStorage.getItem(RESERVATION_KEY));
            return Array.isArray(dados) ? dados : [];
        } catch {
            return [];
        }
    }

    function carregarCapacidade() {
        const config = obterConfiguracoes();
        const capacidade = Number(config.capacidade);

        return Number.isInteger(capacidade) && capacidade >= 1
            ? capacidade
            : CAPACIDADE_PADRAO;
    }

    function obterHoje() {
        const agora = new Date();

        return [
            agora.getFullYear(),
            String(agora.getMonth() + 1).padStart(2, "0"),
            String(agora.getDate()).padStart(2, "0")
        ].join("-");
    }

    function formatarData(data) {
        if (!data) return "-";

        return new Date(data + "T12:00:00").toLocaleDateString("pt-BR");
    }

    function calcularDias(entrada, saida) {
        const inicio = new Date(entrada + "T12:00:00");
        const fim = new Date(saida + "T12:00:00");

        return Math.round((fim - inicio) / (1000 * 60 * 60 * 24));
    }

    function identificarStatus(reserva, hoje) {
        if (reserva.status === "Pendente") {
            return "Pendente";
        }

        if (reserva.status === "Confirmada") {
            if (reserva.entrada <= hoje && reserva.saida > hoje) {
                return "Hospedado";
            }

            if (reserva.entrada > hoje) {
                return "Agendado";
            }
        }

        return null;
    }

    function atualizarHospedagem() {
        atualizarNomeHotelHospedagem();

        const reservas = carregarReservas();
        const hoje = obterHoje();
        const totalVagas = carregarCapacidade();

        const reservasAtivas = reservas.filter(reserva => {
            return reserva.entrada &&
                reserva.saida &&
                reserva.saida > hoje &&
                calcularDias(reserva.entrada, reserva.saida) > 0;
        });

        const hospedados = reservasAtivas.filter(
            reserva => identificarStatus(reserva, hoje) === "Hospedado"
        );

        const proximas = reservasAtivas.filter(reserva => {
            return reserva.entrada > hoje &&
                reserva.status === "Confirmada";
        });

        const ocupandoHoje = reservasAtivas.filter(reserva => {
            return reserva.status === "Confirmada" &&
                reserva.entrada <= hoje &&
                reserva.saida > hoje;
        });

        const quantidadeHospedados = hospedados.length;
        const quantidadeProximas = proximas.length;
        const quantidadeOcupada = ocupandoHoje.length;

        const vagasDisponiveis = Math.max(0, totalVagas - quantidadeOcupada);

        document.getElementById("totalHospedados").textContent = quantidadeHospedados;
        document.getElementById("totalVagas").textContent = totalVagas;
        document.getElementById("proximasReservas").textContent = quantidadeProximas;
        document.getElementById("vagasDisponiveis").textContent = vagasDisponiveis;

        document.getElementById("hospedagemCount").textContent =
            reservasAtivas.length +
            (reservasAtivas.length === 1 ? " reserva" : " reservas");

        tabela.innerHTML = "";

        if (reservasAtivas.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-table">
                        Nenhuma hospedagem ou reserva encontrada.
                    </td>
                </tr>
            `;
            return;
        }

        reservasAtivas.sort((a, b) =>
            a.entrada.localeCompare(b.entrada)
        );

        reservasAtivas.forEach(reserva => {
            const linha = document.createElement("tr");

            const status = identificarStatus(reserva, hoje);
            const valorTotal = Number(reserva.valorTotal) || 0;

            const valores = [
                reserva.petNome || "-",
                reserva.tutorNome || "-",
                formatarData(reserva.entrada),
                formatarData(reserva.saida),
                calcularDias(reserva.entrada, reserva.saida) + " dias",
                valorTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                })
            ];

            valores.forEach(valor => {
                const celula = document.createElement("td");
                celula.textContent = valor;
                linha.appendChild(celula);
            });

            const celulaStatus = document.createElement("td");
            const etiqueta = document.createElement("span");

            etiqueta.textContent = status;

            if (status === "Hospedado") {
                etiqueta.style.color = "#52765C";
            } else if (status === "Agendado") {
                etiqueta.style.color = "#4976A5";
            } else {
                etiqueta.style.color = "#B47B2C";
            }

            etiqueta.style.fontWeight = "bold";

            celulaStatus.appendChild(etiqueta);
            linha.appendChild(celulaStatus);
            tabela.appendChild(linha);
        });
    }

    atualizarHospedagem();

    setInterval(atualizarHospedagem, 60000);

    window.addEventListener("storage", atualizarHospedagem);
    window.addEventListener("pageshow", atualizarHospedagem);

    window.addEventListener(
        "hotelPetConfiguracoesAtualizadas",
        atualizarNomeHotelHospedagem
    );

    console.log("Hospedagens iniciado com sucesso!");
})();
