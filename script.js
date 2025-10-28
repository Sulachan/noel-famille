let currentUser = null;
let currentCenterBubbleName = null;

// --- Authentification ---
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!email || !password) {
    document.getElementById("login-message").innerText = "Remplis tous les champs.";
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(error => {
      document.getElementById("login-message").innerText = "Erreur : " + error.message;
    });
}

function createAccount() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!email || !password || password.length < 6) {
    document.getElementById("login-message").innerText = "Mot de passe : min. 6 caractères.";
    return;
  }
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .catch(error => {
      document.getElementById("login-message").innerText = "Erreur : " + error.message;
    });
}

function logout() {
  firebase.auth().signOut().then(() => {
    document.getElementById("app").style.display = "none";
    document.getElementById("login-screen").style.display = "block";
    document.getElementById("center-overlay").style.display = "none";
    currentCenterBubbleName = null;
  });
}

// --- Chargement des bulles ---
function loadBubbles() {
  const photos = {
    "Maman": "https://i.imgur.com/88Fx119.jpeg",
    "Papa": "https://i.imgur.com/lEa3Dky.jpeg",
    "Anton": "https://i.imgur.com/qU270du.jpeg",
    "Ewan": "https://i.imgur.com/VzvtbSu.jpeg",
    "Sara": "https://i.imgur.com/rwnpdOV.jpeg"
  };

  const container = document.getElementById("bubbles");
  const radius = 200;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  container.innerHTML = "";

Object.entries(photos).forEach(([name, url], i) => {
  const angle = (i / Object.keys(photos).length) * Math.PI * 2;
  const x = centerX + radius * Math.cos(angle);
  const y = centerY + radius * Math.sin(angle);

  const bubble = document.createElement("div");
  bubble.className = "bulle";
  bubble.innerHTML = `<img src="${url}" alt="${name}" loading="lazy">`;
  
  // Ajouter le listener APRÈS l'insertion dans le DOM
  bubble.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Clic détecté sur :", name); // pour tester
    showBubbleDetails(name);
  });

  bubble.style.left = (x - 50) + "px";
  bubble.style.top = (y - 50) + "px";

  container.appendChild(bubble);
});
}

// --- Gestion bulle centrale ---
function closeCenterBubble(event) {
  if (event.target.closest("#center-bubble")) return;
  hideCenterBubble();
}

function hideCenterBubble() {
  const overlay = document.getElementById("center-overlay");
  if (overlay.classList.contains("active")) {
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.style.display = "none";
      currentCenterBubbleName = null;
    }, 500);
  }
}

function showBubbleDetails(name) {
  if (currentCenterBubbleName === name) return;

  const overlay = document.getElementById("center-overlay");

  if (currentCenterBubbleName) {
    overlay.classList.remove("active");
    setTimeout(() => openNewBubble(name), 500);
  } else {
    openNewBubble(name);
  }
}

function openNewBubble(name) {
  const overlay = document.getElementById("center-overlay");
  const centerBubble = document.getElementById("center-bubble");

  centerBubble.innerHTML = `
    <h3>${name}</h3>
    <textarea id="list-input" placeholder="Écris ta liste de Noël..."></textarea>
    <button onclick="saveList('${name}')">Sauvegarder</button>
  `;

  firebase.firestore().collection("listes").doc(name).get().then(doc => {
    if (doc.exists && doc.data().text) {
      document.getElementById("list-input").value = doc.data().text;
    }
  });

  overlay.style.display = "flex";
  setTimeout(() => {
    overlay.classList.add("active");
    currentCenterBubbleName = name;
  }, 10);
}

// --- Sauvegarde ---
function saveList(name) {
  const textarea = document.getElementById("list-input");
  if (!textarea || !textarea.value.trim()) {
    alert("La liste ne peut pas être vide.");
    return;
  }

  firebase.firestore().collection("listes").doc(name).set({
    text: textarea.value.trim(),
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("✅ Liste sauvegardée !");
  })
  .catch(error => {
    alert("❌ " + error.message);
  });
}

// --- État auth ---
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadBubbles();
  }
});

