const firebaseConfig = {
  apiKey: "AIzaSyB7EuNjoNM99GPNtx_y0tcKgbxOKkCfetM",
  authDomain: "interrogazioni-efcdc.firebaseapp.com",
  projectId: "interrogazioni-efcdc",
  appId: "1:196857857597:web:e938e2bcff813868fb4c54"
};
// Email Google di chi può modificare (anche più di una)
const EMAIL_ADMIN = ["arpaia.alisia@liceofanti.edu.it", "danielbsnss4@gmail.com"];

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const ref = firebase.firestore().collection("classe").doc("dati");

const $ = id => document.getElementById(id);
let dati = { studenti: [], interrogazioni: [] };
let dateTemp = [];
let isAdmin = false;
const aperti = new Set(); // cartelle (materie) aperte

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
  alert("Nomi salvati (" + dati.studenti.length + ")");
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
  const S = dati.studenti.length;
  if (!materia || !dateTemp.length || !S) {
    return alert("Inserisci materia, almeno una data e i nomi dei compagni.");
  }
  const date = [...dateTemp].sort();
  const k = date.length;

  // dimensione di ogni gruppo: tutti interrogati una sola volta nella materia
  let dim;
  if (S >= k * n) { // più persone dei posti: gli extra vanno nei primi giorni (gruppi da n+1)
    const extra = S - k * n;
    dim = date.map((_, i) => n + Math.floor(extra / k) + (i < extra % k ? 1 : 0));
  } else { // meno persone dei posti: gruppi il più possibile uguali
    dim = date.map((_, i) => Math.floor(S / k) + (i < S % k ? 1 : 0));
  }

  // chi è già stato estratto lo stesso giorno in un'altra materia
  const occupati = data => new Set(
    dati.interrogazioni.flatMap(m => m.giorni.filter(g => g.data === data).flatMap(g => g.nomi))
  );
  const rimasti = mischia(dati.studenti);
  const giorni = date.map(data => ({ data, nomi: [], gia: occupati(data) }));

  giorni.forEach((g, i) => {
    for (let j = 0; j < dim[i]; j++) {
      const idx = rimasti.findIndex(s => !g.gia.has(s));
      if (idx < 0) break;
      g.nomi.push(rimasti.splice(idx, 1)[0]);
    }
  });
  const nonPiazzati = [];
  rimasti.forEach(s => { // chi è rimasto fuori va nel giorno libero con meno persone
    const g = giorni.filter(g => !g.gia.has(s)).sort((a, b) => a.nomi.length - b.nomi.length)[0];
    if (g) g.nomi.push(s); else nonPiazzati.push(s);
  });
  if (nonPiazzati.length) {
    alert("Non è stato possibile assegnare questi nomi (già occupati in altre materie in tutte le date scelte):\n" + nonPiazzati.join(", "));
  }

  dati.interrogazioni.push({ materia, giorni: giorni.map(({ data, nomi }) => ({ data, nomi })) });
  await ref.set(dati);
  dateTemp = [];
  $("materia").value = "";
  mostraDate();
};

// --- Visualizzazione: ogni materia è una "cartella" ---
function mostra() {
  const el = $("programma");
  if (!dati.interrogazioni.length) {
    el.innerHTML = "<p>Nessuna interrogazione programmata.</p>";
    return;
  }
  el.innerHTML = dati.interrogazioni.map((m, i) => `
    <details class="materia" data-m="${esc(m.materia)}" ${aperti.has(m.materia) ? "open" : ""}>
      <summary>📁 ${esc(m.materia)}</summary>
      ${m.giorni.map(g => `<div class="giorno"><strong>${formatData(g.data)}</strong>: ${g.nomi.map(esc).join(", ")}</div>`).join("")}
      ${isAdmin ? `<button class="elimina" data-i="${i}">Elimina materia</button>` : ""}
    </details>`).join("");
  el.querySelectorAll("details").forEach(d => d.ontoggle = () => {
    d.open ? aperti.add(d.dataset.m) : aperti.delete(d.dataset.m);
  });
  el.querySelectorAll(".elimina").forEach(b => b.onclick = async () => {
    if (!confirm("Eliminare questa materia?")) return;
    dati.interrogazioni.splice(+b.dataset.i, 1);
    await ref.set(dati);
  });
}
