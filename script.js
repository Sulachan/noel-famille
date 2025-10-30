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
    bubble.className = "bulle fallback";
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

    // Si l'image échoue (ce qui sera le cas), garde le fallback
    img.onerror = () => {
      console.warn("Image non chargée :", url);
    };

    bubble.addEventListener("click", (e) => {
      e.stopPropagation();
      showCenterBubble(name);
    });

    bubble.style.left = (x - 50) + "px";
    bubble.style.top = (y - 50) + "px";
    container.appendChild(bubble);
  });

  startSnowflakes();
}

// --- Flocons de neige ---
function startSnowflakes() {
  if (window.snowflakesStarted) return;
  window.snowflakesStarted = true;

  function createSnowflake() {
    const flakes = "❄❅❆";
    const snowflake = document.createElement("div");
    snowflake.className = "snowflake";
    snowflake.innerHTML = flakes.charAt(Math.floor(Math.random() * flakes.length));
    snowflake.style.left = Math.random() * 100 + "vw";
    snowflake.style.opacity = Math.random() * 0.5 + 0.3;
    snowflake.style.fontSize = (Math.random() * 12 + 14) + "px";
    snowflake.style.animationDuration = (Math.random() * 5 + 5) + "s";
    document.getElementById("snowflakes")?.appendChild(snowflake);
    setTimeout(() => snowflake.remove(), 10000);
  }

  setInterval(createSnowflake, 400);
  for (let i = 0; i < 15; i++) setTimeout(createSnowflake, i * 300);
}

// --- Bulle centrale ---
function showCenterBubble(name) {
  closeCenterBubble();

  const overlay = document.createElement("div");
  overlay.id = "center-overlay";
  document.body.appendChild(overlay);

  const bubble = document.createElement("div");
  bubble.id = "center-bubble";
  bubble.innerHTML = `
    <h3>${name}</h3>
    <textarea id="list-input" placeholder="Écris ta liste de Noël..."></textarea>
    <button onclick="saveList('${name}')">Sauvegarder</button>
  `;
  overlay.appendChild(bubble);

  // Charger la liste existante depuis Firestore
  firebase.firestore().collection("listes").doc(name).get().then(doc => {
    if (doc.exists && doc.data().text) {
      document.getElementById("list-input").value = doc.data().text;
    }
  });

  setTimeout(() => overlay.classList.add("active"), 10);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeCenterBubble();
  });
}

function closeCenterBubble() {
  const overlay = document.getElementById("center-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 300);
  }
}

// --- Sauvegarde dans Firestore (publique) ---
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
    closeCenterBubble();
  })
  .catch(error => {
    alert("❌ Erreur : " + error.message);
  });
}

// --- Lancer à l'ouverture ---
window.addEventListener("load", loadBubbles);
