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

function eliminaStudente(indice) {
    studenti.splice(indice, 1);

    mostraStudenti();
}

function mostraStudenti() {
    const lista = document.getElementById("listaStudenti");
function creaInterrogazione() {

    const materia = document.getElementById("materia").value.trim();

    if (materia === "") {
        return;
    }

    const risultato = document.getElementById("interrogazione");

    risultato.innerHTML = `
        <h2>Interrogazione di ${materia}</h2>
    `;
}
    lista.innerHTML = "";

    studenti.forEach(function(nome, indice) {
        const elemento = document.createElement("li");

        elemento.textContent = nome + " ";

        const pulsante = document.createElement("button");

        pulsante.textContent = "Elimina";

        pulsante.onclick = function() {
            eliminaStudente(indice);
        };

        elemento.appendChild(pulsante);

        lista.appendChild(elemento);
    });
}
