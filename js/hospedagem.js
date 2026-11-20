
(() => {
    const RESERVATION_KEY = "hotelPetReservas";
    const CONFIG_KEY_HOSPEDAGEM = "hotelPetConfiguracoes";
    const PET_KEY = "hotelPetAnimais";
    const CAPACIDADE_PADRAO = 10;

    const cards = document.getElementById("hospedagemCards");

    let intervaloAtualizacao = null;
    let modalFotoHospedagem = null;

    // ==============================
    // AMPLIAR FOTOS
    // ==============================

    function criarModalFotoHospedagem() {
        if (modalFotoHospedagem) return;

        modalFotoHospedagem = document.createElement("div");
        modalFotoHospedagem.className = "foto-pet-modal";
        modalFotoHospedagem.setAttribute("aria-hidden", "true");

        const conteudo = document.createElement("div");
        conteudo.className = "foto-pet-modal-conteudo";

        const botaoFechar = document.createElement("button");
        botaoFechar.className = "foto-pet-modal-fechar";
        botaoFechar.type = "button";
        botaoFechar.textContent = "×";
        botaoFechar.setAttribute("aria-label", "Fechar imagem");

        const imagem = document.createElement("img");
        imagem.className = "foto-pet-modal-imagem";
        imagem.alt = "Foto ampliada do pet";

        conteudo.append(botaoFechar, imagem);
        modalFotoHospedagem.appendChild(conteudo);
        document.body.appendChild(modalFotoHospedagem);

        botaoFechar.addEventListener("click", fecharFotoHospedagem);

        modalFotoHospedagem.addEventListener("click", evento => {
            if (evento.target === modalFotoHospedagem) {
                fecharFotoHospedagem();
            }
        });
    }

    function abrirFotoHospedagem(src, nome) {
        if (!src || src.includes("logo-petsitter-transparente.png")) return;

        criarModalFotoHospedagem();

        const imagem = modalFotoHospedagem.querySelector(
            ".foto-pet-modal-imagem"
        );

        imagem.src = src;
        imagem.alt = `Foto ampliada de ${nome || "pet"}`;

        modalFotoHospedagem.classList.add("ativo");
        modalFotoHospedagem.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
    }

    function fecharFotoHospedagem() {
        if (!modalFotoHospedagem) return;

        modalFotoHospedagem.classList.remove("ativo");
        modalFotoHospedagem.setAttribute("aria-hidden", "true");

        const imagem = modalFotoHospedagem.querySelector(
            ".foto-pet-modal-imagem"
        );

        imagem.src = "";

        document.body.style.overflow = "";
    }

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            fecharFotoHospedagem();
        }
    });

    cards.addEventListener("click", evento => {
        const foto = evento.target.closest(".pet-foto-ampliavel");

        if (!foto) return;

        abrirFotoHospedagem(foto.src, foto.alt);
    });

    cards.addEventListener("keydown", evento => {
        const foto = evento.target.closest(".pet-foto-ampliavel");

        if (
            foto &&
            (evento.key === "Enter" || evento.key === " ")
        ) {
            evento.preventDefault();
            abrirFotoHospedagem(foto.src, foto.alt);
        }
    });

    // ==============================
    // CONFIGURAÇÕES
    // ==============================

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

    // ==============================
    // CARREGAMENTO DOS DADOS
    // ==============================

    function carregarReservas() {
        try {
            const dados = JSON.parse(localStorage.getItem(RESERVATION_KEY));
            return Array.isArray(dados) ? dados : [];
        } catch {
            return [];
        }
    }

    function carregarPets() {
        try {
            const dados = JSON.parse(localStorage.getItem(PET_KEY));
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

    // ==============================
    // DATAS E FORMATAÇÃO
    // ==============================

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

    function formatarMoeda(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
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

    function criarElemento(tag, classe, texto) {
        const elemento = document.createElement(tag);

        if (classe) elemento.className = classe;
        if (texto !== undefined) elemento.textContent = texto;

        return elemento;
    }

    function adicionarInformacao(container, titulo, valor) {
        const item = criarElemento("div", "hospedagem-info-item");

        item.append(
            criarElemento("span", "hospedagem-info-label", titulo),
            criarElemento("strong", "hospedagem-info-value", valor || "-")
        );

        container.appendChild(item);
    }

    // ==============================
    // CARTÕES DE HOSPEDAGEM
    // ==============================

    function criarCartao(reserva, pets, hoje) {
        const card = criarElemento("article", "hospedagem-card");

        const pet = pets.find(item =>
            String(item.id) === String(reserva.petId)
        );

        const cabecalho = criarElemento("div", "hospedagem-card-header");
        const principal = criarElemento("div", "hospedagem-card-principal");

        const foto = criarElemento("img", "hospedagem-card-foto");
        foto.alt = reserva.petNome || "Pet";

        if (pet && pet.foto) {
            foto.src = pet.foto;

            foto.classList.add("pet-foto-ampliavel");
            foto.tabIndex = 0;
            foto.setAttribute("role", "button");
            foto.setAttribute(
                "aria-label",
                `Ampliar foto de ${reserva.petNome || "pet"}`
            );
            foto.title = "Clique para ampliar a foto";
        } else {
            foto.src = "img/logo-petsitter-transparente.png";
        }

        foto.onerror = () => {
            foto.onerror = null;
            foto.src = "img/logo-petsitter-transparente.png";
            foto.classList.remove("pet-foto-ampliavel");
            foto.removeAttribute("role");
            foto.removeAttribute("tabindex");
        };

        const identificacao = criarElemento("div", "hospedagem-card-identificacao");

        identificacao.append(
            criarElemento("h3", "hospedagem-card-nome", reserva.petNome || "Pet sem nome"),
            criarElemento("p", "hospedagem-card-tutor", `Tutor: ${reserva.tutorNome || "-"}`)
        );

        principal.append(foto, identificacao);

        const status = identificarStatus(reserva, hoje);

        const etiqueta = criarElemento(
            "span",
            `hospedagem-status hospedagem-status-${status.toLowerCase()}`,
            status
        );

        cabecalho.append(principal, etiqueta);

        const resumo = criarElemento("div", "hospedagem-card-resumo");

        adicionarInformacao(resumo, "Entrada", formatarData(reserva.entrada));
        adicionarInformacao(resumo, "Saída", formatarData(reserva.saida));
        adicionarInformacao(
            resumo,
            "Duração",
            `${calcularDias(reserva.entrada, reserva.saida)} dias`
        );
        adicionarInformacao(
            resumo,
            "Valor total",
            formatarMoeda(
                reserva.valorTotal !== undefined
                    ? reserva.valorTotal
                    : reserva.valorInformado
            )
        );

        const detalhes = criarElemento("div", "hospedagem-card-detalhes");
        detalhes.hidden = true;

        const grade = criarElemento("div", "hospedagem-info-grid");

        adicionarInformacao(
            grade,
            "Status da reserva",
            reserva.status || "-"
        );

        adicionarInformacao(
            grade,
            "Valor já pago",
            formatarMoeda(reserva.valorPago)
        );

        adicionarInformacao(
            grade,
            "Forma de pagamento",
            reserva.formaPagamento || "Não informado"
        );

        adicionarInformacao(
            grade,
            "Parcelas",
            reserva.formaPagamento === "Cartão de crédito" &&
            Number(reserva.valorPago) > 0
                ? `${Number(reserva.parcelasPagamento) || 1}x`
                : "-"
        );

        detalhes.appendChild(grade);

        const observacoes = criarElemento("div", "hospedagem-observacoes");

        observacoes.append(
            criarElemento("strong", "", "Observações"),
            criarElemento(
                "p",
                "",
                reserva.observacoes || "Nenhuma observação registrada."
            )
        );

        detalhes.appendChild(observacoes);

        const acoes = criarElemento("div", "hospedagem-card-acoes");

        const botaoDetalhes = criarElemento(
            "button",
            "btn-primary",
            "Ler mais"
        );

        botaoDetalhes.type = "button";

        botaoDetalhes.addEventListener("click", () => {
            detalhes.hidden = !detalhes.hidden;

            botaoDetalhes.textContent = detalhes.hidden
                ? "Ler mais"
                : "Mostrar menos";
        });

        acoes.appendChild(botaoDetalhes);

        card.append(cabecalho, resumo, detalhes, acoes);

        return card;
    }

    // ==============================
    // ATUALIZAR HOSPEDAGENS
    // ==============================

    function atualizarHospedagem() {
        atualizarNomeHotelHospedagem();

        const reservas = carregarReservas();
        const pets = carregarPets();
        const hoje = obterHoje();
        const totalVagas = carregarCapacidade();

        const reservasAtivas = reservas.filter(reserva => {
            return reserva.entrada &&
                reserva.saida &&
                reserva.saida > hoje &&
                calcularDias(reserva.entrada, reserva.saida) > 0 &&
                identificarStatus(reserva, hoje) !== null;
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

        cards.innerHTML = "";

        if (reservasAtivas.length === 0) {
            cards.appendChild(
                criarElemento(
                    "p",
                    "empty-table",
                    "Nenhuma hospedagem ou reserva encontrada."
                )
            );
            return;
        }

        reservasAtivas.sort((a, b) =>
            a.entrada.localeCompare(b.entrada)
        );

        reservasAtivas.forEach(reserva => {
            cards.appendChild(
                criarCartao(reserva, pets, hoje)
            );
        });
    }

    atualizarHospedagem();

    intervaloAtualizacao = setInterval(atualizarHospedagem, 60000);

    window.addEventListener("storage", atualizarHospedagem);
    window.addEventListener("pageshow", atualizarHospedagem);

    window.addEventListener(
        "hotelPetConfiguracoesAtualizadas",
        atualizarHospedagem
    );

    console.log("Hospedagens iniciado com sucesso!");
})();
