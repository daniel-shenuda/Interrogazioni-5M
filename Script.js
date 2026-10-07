// 1) Incolla qui la config del tuo progetto Firebase (Impostazioni progetto > App web)
const firebaseConfig = {
  apiKey: "AIzaSyB7EuNjoNM99GPNtx_y0tcKgbxOKkCfetM",
  authDomain: "interrogazioni-efcdc.firebaseapp.com",
  projectId: "interrogazioni-efcdc",
  appId: "1:196857857597:web:e938e2bcff813868fb4c54"
};
// 2) Email Google della tua fidanzata: solo lei potrà modificare
const EMAIL_ADMIN = ["arpaia.alisia.liceofanti.edu.it", "danielbsnss4@gmail.com"];

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const ref = firebase.firestore().collection("classe").doc("dati");

const $ = id => document.getElementById(id);
let dati = { studenti: [], interrogazioni: [] };
let dateTemp = [];
let isAdmin = false;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const formatData = d => new Date(d + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });

function mischia(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// --- Dati in tempo reale ---
ref.onSnapshot(doc => {
  if (doc.exists) dati = { studenti: [], interrogazioni: [], ...doc.data() };
  if (document.activeElement !== $("studenti")) $("studenti").value = dati.studenti.join("\n");
  mostra();
});

// --- Login ---
$("btnLogin").onclick = () => {
  if (auth.currentUser) auth.signOut();
  else auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .catch(e => alert("Errore login: " + e.code + "\n" + e.message));
};
auth.onAuthStateChanged(user => {
  const admins = [].concat(EMAIL_ADMIN).map(e => e.toLowerCase());
  isAdmin = !!user && admins.includes((user.email || "").toLowerCase());
  $("admin").hidden = !isAdmin;
  $("btnLogin").textContent = user ? `Esci (${user.email})` : "Accedi (solo rappresentante)";
  if (user && !isAdmin) alert("Hai fatto l'accesso come " + user.email + ", ma questa email non è nell'elenco dei rappresentanti.");
  mostra();
});

// --- Compagni ---
$("salvaStudenti").onclick = async () => {
  dati.studenti = $("studenti").value.split("\n").map(s => s.trim()).filter(Boolean);
  await ref.set(dati);
};

// --- Date ---
$("addData").onclick = () => {
  const d = $("data").value;
  if (d && !dateTemp.includes(d)) dateTemp.push(d);
  mostraDate();
};
function mostraDate() {
  $("dateScelte").innerHTML = dateTemp.sort().map(d => `<span class="chip" data-d="${d}">${formatData(d)} ✕</span>`).join("");
  document.querySelectorAll(".chip").forEach(c => c.onclick = () => {
    dateTemp = dateTemp.filter(d => d !== c.dataset.d);
    mostraDate();
  });
}

// --- Estrazione ---
$("estrai").onclick = async () => {
  const materia = $("materia").value.trim();
  const n = Math.max(1, parseInt($("perGiorno").value) || 1);
  if (!materia || !dateTemp.length || !dati.studenti.length) {
    return alert("Inserisci materia, almeno una data e i nomi dei compagni.");
  }
  // chi è già stato estratto in quella data in un'altra materia
  const occupati = data => new Set(
    dati.interrogazioni.flatMap(m => m.giorni.filter(g => g.data === data).flatMap(g => g.nomi))
  );
  let pool = [];
  const avvisi = [];
  const giorni = [...dateTemp].sort().map(data => {
    const gia = occupati(data);
    const liberi = dati.studenti.filter(s => !gia.has(s));
    const quanti = Math.min(n, liberi.length);
    const nomi = [];
    while (nomi.length < quanti) {
      if (!pool.length) pool = mischia(liberi); // nessuno si ripete finché non sono usciti tutti
      const scelto = pool.pop();
      if (liberi.includes(scelto) && !nomi.includes(scelto)) nomi.push(scelto);
    }
    if (quanti < n) avvisi.push(`${formatData(data)}: solo ${quanti} persone libere su ${n} richieste`);
    return { data, nomi };
  });
  if (avvisi.length) alert("Attenzione:\n" + avvisi.join("\n"));
  dati.interrogazioni.push({ materia, giorni });
  await ref.set(dati);
  dateTemp = [];
  $("materia").value = "";
  mostraDate();
};

// --- Visualizzazione ---
function mostra() {
  const el = $("programma");
  if (!dati.interrogazioni.length) {
    el.innerHTML = "<p>Nessuna interrogazione programmata.</p>";
    return;
  }
  el.innerHTML = dati.interrogazioni.map((m, i) => `
    <div class="materia">
      <h3>${esc(m.materia)}</h3>
      ${m.giorni.map(g => `<div class="giorno"><strong>${formatData(g.data)}</strong>: ${g.nomi.map(esc).join(", ")}</div>`).join("")}
      ${isAdmin ? `<button class="elimina" data-i="${i}">Elimina materia</button>` : ""}
    </div>`).join("");
  document.querySelectorAll(".elimina").forEach(b => b.onclick = async () => {
    if (!confirm("Eliminare questa materia?")) return;
    dati.interrogazioni.splice(+b.dataset.i, 1);
    await ref.set(dati);
  });
}
