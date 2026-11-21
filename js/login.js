
import supabase from "./supabase.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const mensagem = document.getElementById("loginMensagem");

// Exibe mensagens na tela
function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `login-mensagem ${tipo}`;
}

// Verifica se já existe uma sessão
async function verificarSessao() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Erro ao verificar sessão:", error);
        return;
    }

    if (data.session) {
        window.location.replace("./index.html");
    }
}

verificarSessao();

// Realiza o login
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (!email || !senha) {
        mostrarMensagem(
            "Preencha o e-mail e a senha.",
            "erro"
        );
        return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";

    mensagem.className = "login-mensagem";
    mensagem.textContent = "";

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha
        });

        if (error) {
            throw error;
        }

        if (!data.session) {
            throw new Error("Não foi possível iniciar sua sessão.");
        }

        mostrarMensagem(
            "Login realizado! Abrindo o sistema...",
            "sucesso"
        );

        window.location.replace("./index.html");

    } catch (erro) {
        console.error("Erro no login:", erro);

        mostrarMensagem(
            "E-mail ou senha incorretos. Confira seus dados e tente novamente.",
            "erro"
        );

        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar no sistema";
    }
});
