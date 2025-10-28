let currentUser = null;
let bubbles = [];

// --- Authentification ---
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {})
    .catch(error => {
      document.getElementById("login-message").innerText = error.message;
    });
}

function createAccount() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {})
    .catch(error => {
      document.getElementById("login-message").innerText = error.message;
    });
}

function logout() {
  auth.signOut().then(() => {
    document.getElementById("app").style.display = "none";
    document.getElementById("login-screen").style.display = "block";
  });
}

// --- Chargement des bulles ---
function loadBubbles() {
  const members = [
    "Maman", "Papa", "Anton", "Ewan", "Sara"
    // 👆 MODIFIE cette liste avec les prénoms de ta famille
  ];

  const container = document.getElementById("bubbles");
  const radius = 200;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  bubbles = [];
  container.innerHTML = "";

  members.forEach((name, i) => {
    const angle = (i / members.length) * Math.PI * 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const bubble = document.createElement("div");
    bubble.className = "bulle";
    bubble.textContent = name;
    bubble.style.left = (x - 50) + "px";
    bubble.style.top = (y - 50) + "px";

    bubble.addEventListener("click", () => showBubbleDetails(name));
    container.appendChild(bubble);
    bubbles.push({ name, element: bubble });
  });
}

// --- Afficher bulle au centre ---
function showBubbleDetails(name) {
  if (!currentUser) return;

  const centerBubble = document.getElementById("center-bubble");
  centerBubble.innerHTML = `<h3>${name}</h3><textarea id="list-input" placeholder="Écris ta liste de Noël..."></textarea><button onclick="saveList('${name}')">Sauvegarder</button>`;

  // Charger la liste depuis Firebase
  db.collection("listes").doc(name).get().then(doc => {
    if (doc.exists && doc.data().text) {
      document.getElementById("list-input").value = doc.data().text;
    }
  });

  centerBubble.style.display = "flex";
}

function saveList(name) {
  const text = document.getElementById("list-input").value;
  db.collection("listes").doc(name).set({
    text: text,
    owner: name // On simplifie : pas d’authentification stricte pour l’instant
  }).then(() => {
    alert("Liste sauvegardée !");
    document.getElementById("center-bubble").style.display = "none";
  });
}

// --- Écouter l’état de l’authentification ---
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadBubbles();
  } else {
    currentUser = null;
  }
});