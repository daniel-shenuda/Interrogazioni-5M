let date = [];

function creaInterrogazione() {

    const materia = document.getElementById("materia").value.trim();

    if (materia === "") {
        alert("Inserisci una materia!");
        return;
    }

    document.getElementById("titoloInterrogazione").textContent =
        "Interrogazione di " + materia;

    document.getElementById("sezioneDate").style.display = "block";
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
