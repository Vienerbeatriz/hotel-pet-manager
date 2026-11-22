
import supabase from "./supabase.js";

async function verificarAcesso() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!data.session) {
            window.location.replace("./login.html");
            return;
        }

        const script = document.createElement("script");
        script.type = "module";
        script.src = "./js/app.js?v=12";

        script.onload = () => {
            console.log("Painel Petsitter carregado!");
        };

        script.onerror = () => {
            console.error("Erro ao carregar app.js");
        };

        document.body.appendChild(script);

    } catch (erro) {
        console.error("Erro ao verificar sessão:", erro);
        window.location.replace("./login.html");
    }
}

supabase.auth.onAuthStateChange((evento) => {
    if (evento === "SIGNED_OUT") {
        window.location.replace("./login.html");
    }
});

verificarAcesso();
