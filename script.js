let currentUser = null;

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
      console.error("Erreur login:", error);
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
      console.error("Erreur création:", error);
      document.getElementById("login-message").innerText = "Erreur : " + error.message;
    });
}

function logout() {
  firebase.auth().signOut().then(() => {
    document.getElementById("app").style.display = "none";
    document.getElementById("login-screen").style.display = "block";
  });
}

// --- Chargement des bulles avec photos ---
function loadBubbles() {
  // 🔸 Remplace ces URL par les tiennes depuis Imgur !
  const photos = {
    "Maman": "https://i.imgur.com/88Fx119.jpeg",
    "Papa": "https://i.imgur.com/lEa3Dky.jpeg",
    "Anton": "https://i.imgur.com/3SN6pX7.jpeg",
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
    
    const img = document.createElement("img");
    img.src = url;
    img.alt = name;
    img.style.width = "80%";
    img.style.height = "80%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "50%";

    bubble.appendChild(img);
    bubble.addEventListener("click", () => showBubbleDetails(name));
    bubble.style.left = (x - 50) + "px";
    bubble.style.top = (y - 50) + "px";

    container.appendChild(bubble);
  });
}

// --- Afficher la bulle au centre avec la liste ---
function showBubbleDetails(name) {
  const centerBubble = document.getElementById("center-bubble");
  centerBubble.innerHTML = `
    <h3>${name}</h3>
    <textarea id="list-input" placeholder="Écris ta liste de Noël..."></textarea>
    <button onclick="saveList('${name}')">Sauvegarder</button>
  `;

  // Charger la liste existante depuis Firestore
  firebase.firestore().collection("listes").doc(name).get().then(doc => {
    if (doc.exists && doc.data().text) {
      document.getElementById("list-input").value = doc.data().text;
    }
  });

  centerBubble.style.display = "flex";
}

// --- Sauvegarder la liste ---
function saveList(name) {
  const textarea = document.getElementById("list-input");
  if (!textarea) {
    console.error("Champ de texte introuvable");
    return;
  }

  const text = textarea.value.trim();
  if (text === "") {
    alert("La liste ne peut pas être vide.");
    return;
  }

  firebase.firestore().collection("listes").doc(name).set({
    text: text,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("✅ Liste sauvegardée !");
    document.getElementById("center-bubble").style.display = "none";
  })
  .catch(error => {
    console.error("Erreur sauvegarde :", error);
    alert("❌ Erreur : " + error.message);
  });
}

// --- Écouter l’état de l’authentification ---
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadBubbles();
  } else {
    currentUser = null;
  }
});

