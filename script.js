let currentUser = null;

// --- Auth ---
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
    bubble.className = "bulle fallback"; // fallback par défaut
    bubble.textContent = name;

    const img = new Image();
    img.src = url;
    img.alt = name;
    img.style.display = "none";

    img.onload = () => {
      bubble.innerHTML = "";
      bubble.appendChild(img);
      img.style.display = "block";
      bubble.classList.remove("fallback");
    };

    img.onerror = () => {
      console.warn("Échec du chargement :", url);
      // garde le fallback (texte + fond doré)
    };

    bubble.addEventListener("click", (e) => {
      e.stopPropagation();
      showCenterBubble(name, url);
    });

    bubble.style.left = (x - 50) + "px";
    bubble.style.top = (y - 50) + "px";
    container.appendChild(bubble);
  });
}

// --- Bulle centrale simple (overlay) ---
function showCenterBubble(name, url) {
  let overlay = document.getElementById("center-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "center-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 25;
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", () => {
      document.body.removeChild(overlay);
    });
  }

  const content = document.createElement("div");
  content.style.cssText = `
    width: 300px;
    height: 300px;
    background: #48dbfb;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 8px 25px rgba(0,0,0,0.4);
  `;
  content.innerHTML = `
    <h3>${name}</h3>
    <textarea id="list-input" placeholder="Écris ta liste..." 
      style="width:90%;height:120px;margin:10px 0;padding:10px;border:none;border-radius:8px;"></textarea>
    <button onclick="saveList('${name}')">Sauvegarder</button>
  `;
  overlay.appendChild(content);
  content.addEventListener("click", (e) => e.stopPropagation());

  firebase.firestore().collection("listes").doc(name).get().then(doc => {
    if (doc.exists && doc.data().text) {
      document.getElementById("list-input").value = doc.data().text;
    }
  });
}

// --- Sauvegarde ---
function saveList(name) {
  const textarea = document.getElementById("list-input");
  if (!textarea?.value.trim()) {
    alert("La liste ne peut pas être vide.");
    return;
  }
  firebase.firestore().collection("listes").doc(name).set({
    text: textarea.value.trim(),
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("✅ Sauvegardé !");
    document.getElementById("center-overlay")?.remove();
  }).catch(err => alert("❌ " + err.message));
}

// --- Auth state ---
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadBubbles();
  }
});
