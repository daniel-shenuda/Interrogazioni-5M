let studenti = [];

function aggiungiStudente() {
    const input = document.getElementById("nomeStudente");
    const nome = input.value.trim();

    if (nome === "") {
        return;
    }

    studenti.push(nome);

    input.value = "";

    mostraStudenti();
}

function mostraStudenti() {
    const lista = document.getElementById("listaStudenti");

    lista.innerHTML = "";

    studenti.forEach(function(nome) {
        const elemento = document.createElement("li");

        elemento.textContent = nome;

        lista.appendChild(elemento);
    });
}
