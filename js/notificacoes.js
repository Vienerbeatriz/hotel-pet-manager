
import supabase from "./supabase.js";

// COLOQUE AQUI SUA CHAVE PÚBLICA VAPID
const VAPID_PUBLIC_KEY = "BC8uzTmvthfyLukq6Sn6r1YeVb1tJdV5h68UF0BM-CUNawshRx_rEqhw-7jlh9E-E1JU4eIpykxzkHP6RVAShx8";

const botao = document.getElementById("ativarNotificacoesPush");
const status = document.getElementById("statusNotificacoesPush");

function mostrarStatus(mensagem) {
    if (status) {
        status.textContent = mensagem;
    }
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

        if (VAPID_PUBLIC_KEY === "COLE_AQUI_SUA_CHAVE_PUBLICA_VAPID") {
            throw new Error("A chave pública VAPID ainda não foi configurada.");
        }

        mostrarStatus("Solicitando permissão para notificações...");

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

        const {
            data: { user },
            error: erroUsuario
        } = await supabase.auth.getUser();

        if (erroUsuario || !user) {
            throw new Error("Faça login novamente para ativar as notificações.");
        }

        const dadosInscricao = inscricao.toJSON();

        const endpoint = dadosInscricao.endpoint;
        const p256dh = dadosInscricao.keys?.p256dh;
        const auth = dadosInscricao.keys?.auth;

        if (!endpoint || !p256dh || !auth) {
            throw new Error("Não foi possível obter os dados da inscrição.");
        }

        const { error } = await supabase
            .from("push_subscriptions")
            .upsert(
                {
                    user_id: user.id,
                    endpoint,
                    p256dh,
                    auth
                },
                {
                    onConflict: "endpoint"
                }
            );

        if (error) {
            throw error;
        }

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

if (botao) {
    botao.addEventListener("click", ativarNotificacoes);
}
