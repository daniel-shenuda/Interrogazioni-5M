function creaInterrogazione() {

    const materia = document.getElementById("materia").value.trim();

    if (materia === "") {
        alert("Inserisci una materia!");
        return;
    }

    const risultato = document.getElementById("interrogazione");

    risultato.innerHTML = `
        <h2>Interrogazione di ${materia}</h2>
    `;
}
    });
}
