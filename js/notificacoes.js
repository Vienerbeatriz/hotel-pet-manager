
import supabase from "./supabase.js";

// CHAVE PÚBLICA VAPID
const VAPID_PUBLIC_KEY = "BC8uzTmvthfyLukq6Sn6r1YeVb1tJdV5h68UF0BM-CUNawshRx_rEqhw-7jlh9E-E1JU4eIpykxzkHP6RVAShx8";

// ELEMENTOS
const botao = document.getElementById("ativarNotificacoesPush");
const status = document.getElementById("statusNotificacoesPush");

const botaoTeste = document.getElementById("testarNotificacaoPush");
const statusTeste = document.getElementById("statusTesteNotificacao");

function mostrarStatus(mensagem) {
    if (status) status.textContent = mensagem;
}

function mostrarStatusTeste(mensagem) {
    if (statusTeste) statusTeste.textContent = mensagem;
}

function converterChaveBase64(chave) {
    const padding = "=".repeat((4 - chave.length % 4) % 4);

    const base64 = (chave + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const binario = window.atob(base64);
    const bytes = new Uint8Array(binario.length);

    for (let i = 0; i < binario.length; i++) {
        bytes[i] = binario.charCodeAt(i);
    }

    return bytes;
}

// SALVAR INSCRIÇÃO NO SUPABASE
async function salvarInscricao(inscricao) {
    const {
        data: { user },
        error: erroUsuario
    } = await supabase.auth.getUser();

    if (erroUsuario || !user) {
        throw new Error("Faça login novamente para ativar as notificações.");
    }

    const dados = inscricao.toJSON();

    const { error } = await supabase
        .from("push_subscriptions")
        .upsert(
            {
                user_id: user.id,
                endpoint: dados.endpoint,
                p256dh: dados.keys?.p256dh,
                auth: dados.keys?.auth
            },
            {
                onConflict: "endpoint"
            }
        );

    if (error) throw error;
}

// VERIFICAR ESTADO ATUAL DO DISPOSITIVO
async function verificarNotificacoes() {
    try {
        if (!("serviceWorker" in navigator) ||
            !("PushManager" in window) ||
            !("Notification" in window)) {
            mostrarStatus("Este navegador não oferece suporte a notificações.");
            return;
        }

        if (Notification.permission !== "granted") {
            mostrarStatus("Notificações ainda não foram ativadas neste dispositivo.");
            return;
        }

        const registro = await navigator.serviceWorker.register(
            "./service-worker.js"
        );

        await navigator.serviceWorker.ready;

        const inscricao = await registro.pushManager.getSubscription();

        if (!inscricao) {
            mostrarStatus("Dispositivo ainda não inscrito. Clique em ativar notificações.");
            return;
        }

        await salvarInscricao(inscricao);

        mostrarStatus("✅ Notificações ativadas neste dispositivo!");

    } catch (erro) {
        console.error("Erro ao verificar notificações:", erro);
        mostrarStatus("Não foi possível verificar as notificações.");
    }
}

// ATIVAR NOTIFICAÇÕES
async function ativarNotificacoes() {
    try {
        if (!("serviceWorker" in navigator)) {
            throw new Error("Este navegador não oferece suporte ao Service Worker.");
        }

        if (!("PushManager" in window)) {
            throw new Error("Este navegador não oferece suporte a notificações push.");
        }

        if (!("Notification" in window)) {
            throw new Error("Este navegador não oferece suporte a notificações.");
        }

        mostrarStatus("Solicitando permissão...");

        const permissao = await Notification.requestPermission();

        if (permissao !== "granted") {
            throw new Error("Permissão para notificações não concedida.");
        }

        mostrarStatus("Preparando o dispositivo...");

        const registro = await navigator.serviceWorker.register(
            "./service-worker.js"
        );

        await navigator.serviceWorker.ready;

        let inscricao = await registro.pushManager.getSubscription();

        if (!inscricao) {
            inscricao = await registro.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: converterChaveBase64(
                    VAPID_PUBLIC_KEY
                )
            });
        }

        await salvarInscricao(inscricao);

        mostrarStatus("✅ Notificações ativadas neste dispositivo!");

        alert("Notificações ativadas com sucesso!");

    } catch (erro) {
        console.error("Erro ao ativar notificações:", erro);

        mostrarStatus("Não foi possível ativar as notificações.");

        alert(
            "Erro ao ativar notificações:\n" +
            (erro.message || "Tente novamente.")
        );
    }
}

// ENVIAR NOTIFICAÇÃO DE TESTE
async function testarNotificacao() {
    try {
        mostrarStatusTeste("Verificando autenticação...");

        const {
            data: { session },
            error: erroSessao
        } = await supabase.auth.getSession();

        if (erroSessao || !session) {
            throw new Error("Sua sessão não foi encontrada. Faça login novamente.");
        }

        mostrarStatusTeste("Enviando notificação de teste...");

        const { data, error } = await supabase.functions.invoke(
            "enviar-notificacao",
            {
                body: {
                    title: "Petsitter 🐾",
                    body: "Teste de notificação enviado com sucesso!"
                }
            }
        );

        if (error) throw error;

        console.log("Resposta da notificação:", data);

        mostrarStatusTeste(
            "✅ Solicitação enviada! Verifique se a notificação chegou ao dispositivo."
        );

        alert("Solicitação de teste enviada!");

    } catch (erro) {
        console.error("Erro no teste de notificação:", erro);

        mostrarStatusTeste("Não foi possível enviar a notificação.");

        alert(
            "Erro ao testar notificação:\n" +
            (erro.message || "Tente novamente.")
        );
    }
}

// EVENTOS DOS BOTÕES
if (botao) {
    botao.addEventListener("click", ativarNotificacoes);
}

if (botaoTeste) {
    botaoTeste.addEventListener("click", testarNotificacao);
}

// VERIFICAR AO ABRIR A PÁGINA
verificarNotificacoes();

window.addEventListener("pageshow", verificarNotificacoes);
