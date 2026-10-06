let date = [];

function creaInterrogazione() {

    const materia = document.getElementById("materia").value.trim();

    if (materia === "") {
        alert("Inserisci una materia!");
        return;
    }

    const risultato = document.getElementById("interrogazione");

    risultato.innerHTML = `
        <h2>Interrogazione di ${materia}</h2>

        <h3>Date</h3>

        <input type="date" id="dataInterrogazione">

        <button onclick="aggiungiData()">
            Aggiungi data
        </button>

        <ul id="listaDate"></ul>
    `;
}


function aggiungiData() {

    const input = document.getElementById("dataInterrogazione");

    const data = input.value;

    if (data === "") {
        alert("Seleziona una data!");
        return;
    }

    date.push(data);

    input.value = "";

    mostraDate();
}


function mostraDate() {

    const lista = document.getElementById("listaDate");

    lista.innerHTML = "";

    date.forEach(function(data) {

        const elemento = document.createElement("li");

        elemento.textContent = data;

        lista.appendChild(elemento);

    });
}
