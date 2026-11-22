
import supabase from "./supabase.js";

const petForm = document.getElementById("petForm");
const petCards = document.getElementById("petCards");
const petCount = document.getElementById("petCount");
const tutorSelect = document.getElementById("petTutor");

const campoFoto = document.getElementById("petFoto");
const previewFoto = document.getElementById("petFotoPreview");
const removerFotoPreview = document.getElementById("removerPetFoto");

let clientes = [];
let pets = [];
let carregando = false;

// ==============================
// BUSCAR DADOS NO SUPABASE
// ==============================

async function carregarClientes() {
    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("id", { ascending: false });

    if (error) throw error;

    return data || [];
}

async function carregarPets() {
    const { data, error } = await supabase
        .from("pets")
        .select("*")
        .order("id", { ascending: false });

    if (error) throw error;

    return data || [];
}

async function carregarDados() {
    if (carregando) return;

    carregando = true;

    try {
        const [dadosClientes, dadosPets] = await Promise.all([
            carregarClientes(),
            carregarPets()
        ]);

        clientes = dadosClientes;
        pets = dadosPets;

        atualizarTutores();
        atualizarPets();

    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        alert("Não foi possível carregar os pets e clientes do Supabase.");
    } finally {
        carregando = false;
    }
}

// ==============================
// CONVERTER DADOS DO BANCO
// ==============================

function prepararPet(pet) {
    return {
        id: pet.id,
        nome: pet.nome,
        tutorId: pet.cliente_id,
        especie: pet.especie,
        raca: pet.raca,
        nascimento: pet.nascimento,
        sexo: pet.sexo,
        porte: pet.porte,
        castrado: pet.castrado,
        alimentacao: pet.alimentacao,
        problemasSaude: pet.problemas_saude,
        comportamento: pet.comportamento,
        vermifugo: pet.vermifugo,
        dataVermifugo: pet.data_vermifugo,
        antipulgas: pet.antipulgas,
        dataAntipulgas: pet.data_antipulgas,
        veterinario: pet.veterinario,
        telefoneVeterinario: pet.telefone_veterinario,
        observacoes: pet.observacoes,
        foto: pet.foto_url
    };
}

// ==============================
// FOTOS NO SUPABASE STORAGE
// ==============================

async function enviarFoto(arquivo) {
    if (!arquivo || !arquivo.type.startsWith("image/")) {
        throw new Error("Selecione uma imagem válida.");
    }

    if (arquivo.size > 8 * 1024 * 1024) {
        throw new Error("A imagem deve ter no máximo 8 MB.");
    }

    const blob = await comprimirFoto(arquivo);

    const nomeArquivo =
        `pet-${Date.now()}-${crypto.randomUUID()}.jpg`;

    const { error } = await supabase.storage
        .from("foto-pets")
        .upload(nomeArquivo, blob, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: false
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from("foto-pets")
        .getPublicUrl(nomeArquivo);

    if (!data?.publicUrl) {
        throw new Error("Não foi possível obter o endereço da foto.");
    }

    return data.publicUrl;
}

function comprimirFoto(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = function(evento) {
            const imagem = new Image();

            imagem.onload = function() {
                try {
                    const limite = 700;
                    let largura = imagem.naturalWidth;
                    let altura = imagem.naturalHeight;

                    if (!largura || !altura) {
                        reject(new Error("Imagem inválida."));
                        return;
                    }

                    if (largura > limite || altura > limite) {
                        const proporcao = Math.min(
                            limite / largura,
                            limite / altura
                        );

                        largura = Math.round(largura * proporcao);
                        altura = Math.round(altura * proporcao);
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = largura;
                    canvas.height = altura;

                    const contexto = canvas.getContext("2d");

                    if (!contexto) {
                        reject(new Error("Não foi possível processar a imagem."));
                        return;
                    }

                    contexto.fillStyle = "#FFFFFF";
                    contexto.fillRect(0, 0, largura, altura);
                    contexto.drawImage(imagem, 0, 0, largura, altura);

                    canvas.toBlob(
                        blob => {
                            if (!blob) {
                                reject(new Error("Falha ao comprimir a imagem."));
                                return;
                            }

                            resolve(blob);
                        },
                        "image/jpeg",
                        0.78
                    );

                } catch (erro) {
                    reject(erro);
                }
            };

            imagem.onerror = () => {
                reject(new Error("O navegador não conseguiu abrir essa imagem."));
            };

            imagem.src = evento.target.result;
        };

        leitor.onerror = () => {
            reject(new Error("Não foi possível ler a imagem."));
        };

        leitor.readAsDataURL(arquivo);
    });
}

// ==============================
// AMPLIAR FOTOS
// ==============================

function criarModalFoto() {
    let modal = document.getElementById("fotoPetModal");

    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "fotoPetModal";
    modal.className = "foto-pet-modal";
    modal.setAttribute("aria-hidden", "true");

    const conteudo = document.createElement("div");
    conteudo.className = "foto-pet-modal-conteudo";

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "foto-pet-modal-fechar";
    fechar.textContent = "×";
    fechar.setAttribute("aria-label", "Fechar foto");

    const imagem = document.createElement("img");
    imagem.className = "foto-pet-modal-imagem";
    imagem.alt = "Foto ampliada do pet";

    conteudo.append(fechar, imagem);
    modal.appendChild(conteudo);
    document.body.appendChild(modal);

    fechar.addEventListener("click", fecharFotoPet);

    modal.addEventListener("click", event => {
        if (event.target === modal) fecharFotoPet();
    });

    return modal;
}

function abrirFotoPet(src, nome) {
    if (!src) return;

    const modal = criarModalFoto();
    const imagem = modal.querySelector(".foto-pet-modal-imagem");

    imagem.src = src;
    imagem.alt = `Foto ampliada de ${nome}`;

    modal.classList.add("ativo");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function fecharFotoPet() {
    const modal = document.getElementById("fotoPetModal");

    if (!modal) return;

    modal.classList.remove("ativo");
    modal.setAttribute("aria-hidden", "true");
    modal.querySelector(".foto-pet-modal-imagem").src = "";
    document.body.style.overflow = "";
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") fecharFotoPet();
});

// ==============================
// ATUALIZAR TUTORES
// ==============================

function atualizarTutores() {
    const valorAnterior = tutorSelect.value;

    tutorSelect.innerHTML = "";

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione um tutor";
    tutorSelect.appendChild(opcaoInicial);

    clientes.forEach(cliente => {
        const opcao = document.createElement("option");
        opcao.value = String(cliente.id);
        opcao.textContent = cliente.nome;
        tutorSelect.appendChild(opcao);
    });

    tutorSelect.disabled = clientes.length === 0;

    if (clientes.some(cliente =>
        String(cliente.id) === String(valorAnterior)
    )) {
        tutorSelect.value = String(valorAnterior);
    }
}

// ==============================
// ELEMENTOS DOS CARTÕES
// ==============================

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;

    return elemento;
}

function criarBotao(texto, classe, id) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.textContent = texto;
    botao.className = classe;
    botao.dataset.id = id;

    return botao;
}

function adicionarInformacao(container, titulo, valor) {
    const item = criarElemento("div", "pet-info-item");
    const label = criarElemento("small", "", titulo);
    const texto = criarElemento("strong", "", valor || "Não informado");

    item.append(label, texto);
    container.appendChild(item);
}

// ==============================
// CRIAR CARTÃO DO PET
// ==============================

function criarCartaoPet(pet) {
    const tutor = clientes.find(
        cliente => String(cliente.id) === String(pet.tutorId)
    );

    const cartao = criarElemento("article", "pet-card");
    cartao.dataset.id = pet.id;

    const cabecalho = criarElemento("div", "pet-card-cabecalho");
    const principal = criarElemento("div", "pet-card-principal");
    const areaFoto = criarElemento("div", "pet-card-foto");

    if (pet.foto) {
        const imagem = document.createElement("img");

        imagem.src = pet.foto;
        imagem.alt = `Foto de ${pet.nome}`;
        imagem.classList.add("pet-foto-ampliavel");
        imagem.tabIndex = 0;
        imagem.setAttribute("role", "button");
        imagem.setAttribute("aria-label", `Ampliar foto de ${pet.nome}`);
        imagem.title = "Clique para ampliar a foto";

        imagem.onerror = function() {
            this.onerror = null;
            this.classList.remove("pet-foto-ampliavel");
            this.removeAttribute("role");
            this.removeAttribute("tabindex");
            this.src = "img/logo-petsitter-transparente.png";
        };

        imagem.addEventListener("click", () => abrirFotoPet(pet.foto, pet.nome));

        imagem.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                abrirFotoPet(pet.foto, pet.nome);
            }
        });

        areaFoto.appendChild(imagem);
    } else {
        areaFoto.textContent = pet.especie === "Gato" ? "🐱" : "🐶";
    }

    const informacoes = criarElemento("div", "pet-card-resumo");

    informacoes.append(
        criarElemento("h3", "pet-card-nome", pet.nome),
        criarElemento(
            "p",
            "pet-card-especie",
            `${pet.especie || "Espécie não informada"} • ${pet.raca || "Raça não informada"}`
        ),
        criarElemento(
            "p",
            "pet-card-tutor",
            `👤 Tutor: ${tutor ? tutor.nome : "Tutor não encontrado"}`
        )
    );

    principal.append(areaFoto, informacoes);
    cabecalho.appendChild(principal);

    const detalhes = criarElemento("div", "pet-card-detalhes");
    detalhes.hidden = true;

    const grade = criarElemento("div", "pet-info-grid");

    adicionarInformacao(grade, "Nome", pet.nome);
    adicionarInformacao(grade, "Espécie", pet.especie);
    adicionarInformacao(grade, "Raça", pet.raca);
    adicionarInformacao(grade, "Nascimento", pet.nascimento);
    adicionarInformacao(grade, "Sexo", pet.sexo);
    adicionarInformacao(grade, "Porte", pet.porte);
    adicionarInformacao(grade, "Castrado", pet.castrado);
    adicionarInformacao(grade, "Tutor", tutor ? tutor.nome : "Tutor não encontrado");

    const gradeSaude = criarElemento("div", "pet-info-grid");

    adicionarInformacao(gradeSaude, "Restrições alimentares", pet.alimentacao);
    adicionarInformacao(gradeSaude, "Problemas de saúde", pet.problemasSaude);
    adicionarInformacao(gradeSaude, "Vermífugo", pet.vermifugo);
    adicionarInformacao(gradeSaude, "Data do vermífugo", pet.dataVermifugo);
    adicionarInformacao(gradeSaude, "Antipulgas", pet.antipulgas);
    adicionarInformacao(gradeSaude, "Data do antipulgas", pet.dataAntipulgas);
    adicionarInformacao(gradeSaude, "Veterinário", pet.veterinario);
    adicionarInformacao(gradeSaude, "Telefone do veterinário", pet.telefoneVeterinario);

    const comportamento = criarElemento("div", "pet-info-observacao");
    comportamento.append(
        criarElemento("strong", "", "Comportamento"),
        criarElemento("p", "", pet.comportamento || "Não informado")
    );

    const observacoes = criarElemento("div", "pet-info-observacao");
    observacoes.append(
        criarElemento("strong", "", "Observações"),
        criarElemento("p", "", pet.observacoes || "Nenhuma observação cadastrada.")
    );

    detalhes.append(
        criarElemento("h4", "", "Informações do pet"),
        grade,
        criarElemento("h4", "", "Saúde e cuidados"),
        gradeSaude,
        comportamento,
        observacoes
    );

    const acoes = criarElemento("div", "pet-card-acoes");

    const botaoLerMais = criarBotao(
        "Ler mais", "btn-ler-mais btn-detalhes-pet", pet.id
    );

    const botaoTrocarFoto = criarBotao(
        "Trocar foto", "btn-secondary btn-trocar-foto", pet.id
    );

    const inputTrocar = document.createElement("input");
    inputTrocar.type = "file";
    inputTrocar.accept = "image/*";
    inputTrocar.className = "input-trocar-foto";
    inputTrocar.dataset.id = pet.id;
    inputTrocar.hidden = true;

    acoes.append(botaoLerMais, botaoTrocarFoto, inputTrocar);

    if (pet.foto) {
        acoes.appendChild(
            criarBotao("Remover foto", "btn-secondary btn-remover-foto", pet.id)
        );
    }

    acoes.appendChild(
        criarBotao("Excluir pet", "btn-delete", pet.id)
    );

    cartao.append(cabecalho, detalhes, acoes);

    return cartao;
}

// ==============================
// ATUALIZAR LISTAGEM
// ==============================

function atualizarPets() {
    petCards.innerHTML = "";

    petCount.textContent =
        `${pets.length} ${pets.length === 1 ? "pet" : "pets"}`;

    if (pets.length === 0) {
        petCards.appendChild(
            criarElemento("p", "empty-table", "Nenhum pet cadastrado ainda.")
        );
        return;
    }

    pets.forEach(dado => {
        petCards.appendChild(criarCartaoPet(prepararPet(dado)));
    });
}

// ==============================
// PRÉVIA DA FOTO
// ==============================

function limparPreviewFoto() {
    campoFoto.value = "";
    previewFoto.src = "";
    previewFoto.style.display = "none";
    removerFotoPreview.style.display = "none";
}

campoFoto.addEventListener("change", function() {
    const arquivo = this.files[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
        alert("Selecione uma imagem válida.");
        limparPreviewFoto();
        return;
    }

    if (arquivo.size > 8 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 8 MB.");
        limparPreviewFoto();
        return;
    }

    const leitor = new FileReader();

    leitor.onload = evento => {
        previewFoto.src = evento.target.result;
        previewFoto.style.display = "block";
        removerFotoPreview.style.display = "inline-block";
    };

    leitor.onerror = () => {
        alert("Não foi possível carregar a prévia da imagem.");
        limparPreviewFoto();
    };

    leitor.readAsDataURL(arquivo);
});

removerFotoPreview.addEventListener("click", limparPreviewFoto);

petForm.addEventListener("reset", () => {
    setTimeout(limparPreviewFoto, 0);
});

// ==============================
// CADASTRAR PET
// ==============================

petForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const tutorId = tutorSelect.value;
    const tutor = clientes.find(
        cliente => String(cliente.id) === String(tutorId)
    );

    if (!tutor) {
        alert("Selecione um cliente cadastrado no campo Tutor.");
        return;
    }

    const botaoSalvar = petForm.querySelector('button[type="submit"]');
    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    try {
        let fotoUrl = null;
        const arquivo = campoFoto.files[0];

        if (arquivo) {
            fotoUrl = await enviarFoto(arquivo);
        }

        const novoPet = {
            cliente_id: tutor.id,
            nome: document.getElementById("petNome").value.trim(),
            especie: document.getElementById("petEspecie").value || null,
            raca: document.getElementById("petRaca").value.trim() || null,
            nascimento: document.getElementById("petNascimento").value || null,
            sexo: document.getElementById("petSexo").value || null,
            porte: document.getElementById("petPorte").value || null,
            castrado: document.getElementById("petCastrado").value || null,
            alimentacao: document.getElementById("petAlimentacao").value.trim() || null,
            problemas_saude: document.getElementById("petProblemasSaude").value.trim() || null,
            comportamento: document.getElementById("petComportamento").value.trim() || null,
            vermifugo: document.getElementById("petVermifugo").value || null,
            data_vermifugo: document.getElementById("petDataVermifugo").value || null,
            antipulgas: document.getElementById("petAntipulgas").value || null,
            data_antipulgas: document.getElementById("petDataAntipulgas").value || null,
            veterinario: document.getElementById("petVeterinario").value.trim() || null,
            telefone_veterinario: document.getElementById("petTelefoneVeterinario").value.trim() || null,
            observacoes: document.getElementById("petObservacoes").value.trim() || null,
            foto_url: fotoUrl
        };

        const { error } = await supabase
            .from("pets")
            .insert([novoPet]);

        if (error) throw error;

        await carregarDados();
        petForm.reset();

        alert("Pet cadastrado com sucesso! 🐾");

    } catch (erro) {
        console.error("Erro ao cadastrar pet:", erro);
        alert(erro.message || "Não foi possível cadastrar o pet.");
    } finally {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Salvar pet";
    }
});

// ==============================
// AÇÕES DOS CARTÕES
// ==============================

petCards.addEventListener("click", async function(event) {
    const botaoLerMais = event.target.closest(".btn-detalhes-pet");
    const botaoTrocar = event.target.closest(".btn-trocar-foto");
    const botaoRemover = event.target.closest(".btn-remover-foto");
    const botaoExcluir = event.target.closest(".btn-delete");

    if (botaoLerMais) {
        const cartao = botaoLerMais.closest(".pet-card");
        const detalhes = cartao.querySelector(".pet-card-detalhes");

        detalhes.hidden = !detalhes.hidden;
        botaoLerMais.textContent = detalhes.hidden ? "Ler mais" : "Mostrar menos";
        return;
    }

    if (botaoTrocar) {
        botaoTrocar.closest(".pet-card")
            .querySelector(".input-trocar-foto").click();
        return;
    }

    if (botaoRemover) {
        if (!confirm("Deseja remover a foto deste pet?")) return;

        try {
            const { error } = await supabase
                .from("pets")
                .update({ foto_url: null })
                .eq("id", botaoRemover.dataset.id);

            if (error) throw error;

            await carregarDados();
            alert("Foto removida com sucesso!");
        } catch (erro) {
            console.error("Erro ao remover foto:", erro);
            alert("Não foi possível remover a foto.");
        }

        return;
    }

    if (botaoExcluir) {
        if (!confirm("Deseja realmente excluir este pet?")) return;

        try {
            const { error } = await supabase
                .from("pets")
                .delete()
                .eq("id", botaoExcluir.dataset.id);

            if (error) throw error;

            await carregarDados();
            alert("Pet excluído com sucesso!");
        } catch (erro) {
            console.error("Erro ao excluir pet:", erro);
            alert("Não foi possível excluir o pet.");
        }
    }
});

// ==============================
// TROCAR FOTO
// ==============================

petCards.addEventListener("change", async function(event) {
    const input = event.target.closest(".input-trocar-foto");

    if (!input || !input.files[0]) return;

    try {
        const fotoUrl = await enviarFoto(input.files[0]);

        const { error } = await supabase
            .from("pets")
            .update({ foto_url: fotoUrl })
            .eq("id", input.dataset.id);

        if (error) throw error;

        await carregarDados();
        alert("Foto atualizada com sucesso! 🐶");

    } catch (erro) {
        console.error("Erro ao trocar foto:", erro);
        alert(erro.message || "Não foi possível atualizar a foto.");
    } finally {
        input.value = "";
    }
});

// ==============================
// ATUALIZAÇÃO
// ==============================

window.addEventListener("pageshow", () => {
    carregarDados();
});

// ==============================
// INICIALIZAÇÃO
// ==============================

carregarDados();

console.log("Módulo de pets conectado ao Supabase!");
