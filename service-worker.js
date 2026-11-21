
const CACHE_NAME = "petsitter-v2";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./img/logo-petsitter-transparente.png",
    "./js/app.js",
    "./clientes.html",
    "./pets.html",
    "./reservas.html",
    "./hospedagem.html",
    "./agenda-banho.html",
    "./agenda-vet.html",
    "./financeiro.html",
    "./configuracoes.html"
];

// INSTALAÇÃO
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ARQUIVOS);
        })
    );

    self.skipWaiting();
});

// ATIVAÇÃO
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((nomes) => {
            return Promise.all(
                nomes
                    .filter((nome) => nome !== CACHE_NAME)
                    .map((nome) => caches.delete(nome))
            );
        })
    );

    self.clients.claim();
});

// CARREGAMENTO DOS ARQUIVOS
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then((resposta) => {
                if (resposta.ok) {
                    const copia = resposta.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, copia);
                    });
                }

                return resposta;
            })
            .catch(async () => {
                const arquivo = await caches.match(event.request);

                if (arquivo) return arquivo;

                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }

                return Response.error();
            })
    );
});

// RECEBER NOTIFICAÇÕES PUSH
self.addEventListener("push", (event) => {
    let dados = {};

    try {
        dados = event.data ? event.data.json() : {};
    } catch (erro) {
        dados = {
            title: "Petsitter",
            body: event.data ? event.data.text() : "Você tem um novo aviso!"
        };
    }

    const titulo = dados.title || "Petsitter";

    const opcoes = {
        body: dados.body || "Você tem um novo aviso!",
        icon: "./img/logo-petsitter-transparente.png",
        badge: "./img/logo-petsitter-transparente.png",
        data: {
            url: dados.url || "./index.html"
        }
    };

    event.waitUntil(
        self.registration.showNotification(titulo, opcoes)
    );
});

// CLIQUE NA NOTIFICAÇÃO
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const destino = event.notification.data?.url || "./index.html";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((janelas) => {
            for (const janela of janelas) {
                if ("focus" in janela) {
                    janela.navigate(destino);
                    return janela.focus();
                }
            }

            return clients.openWindow(destino);
        })
    );
});
