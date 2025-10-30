let currentOverlay = null;

function loadBubbles() {
  // Plus d'images → que des prénoms
  const names = ["Maman", "Papa", "Anton", "Ewan", "Sara"];

  const container = document.getElementById("bubbles");
  const radius = 300; // grand cercle
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  container.innerHTML = "";

  names.forEach((name, i) => {
    const angle = (i / names.length) * Math.PI * 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const bubble = document.createElement("div");
    bubble.className = "bulle";
    bubble.textContent = name;
    bubble.dataset.name = name;

    bubble.addEventListener("click", (e) => {
      e.stopPropagation();
      openBubble(name);
    });

    // Position correcte en cercle
    bubble.style.left = (x - 100) + "px"; // 200/2 = 100
    bubble.style.top = (y - 100) + "px";

    container.appendChild(bubble);
  });

  startSnowflakes();
}

function openBubble(name) {
  closeBubble();

  const overlay = document.createElement("div");
  overlay.id = "text-overlay";
  overlay.innerHTML = `
    <div id="text-content">
      <h2>${name}</h2>
      <textarea id="list-input" placeholder="Ta liste de Noël..."></textarea>
      <button onclick="saveList('${name}')">Sauvegarder</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Charger la liste existante
  firebase.firestore().collection("listes").doc(name).get().then(doc => {
    if (doc.exists && doc.data().text) {
      document.getElementById("list-input").value = doc.data().text;
    }
  });

  setTimeout(() => overlay.classList.add("active"), 10);

  currentOverlay = overlay;
}

function closeBubble() {
  if (currentOverlay) {
    currentOverlay.classList.remove("active");
    setTimeout(() => {
      if (currentOverlay.parentNode) {
        currentOverlay.parentNode.removeChild(currentOverlay);
      }
    }, 300);
    currentOverlay = null;
  }
}

// Clic en dehors → fermer
document.addEventListener("click", (e) => {
  if (currentOverlay && !e.target.closest("#text-content")) {
    closeBubble();
  }
});

// Sauvegarde
window.saveList = function(name) {
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
    closeBubble();
  }).catch(err => alert("❌ " + err.message));
};

// Flocons
function startSnowflakes() {
  if (window.snowflakesStarted) return;
  window.snowflakesStarted = true;
  function createSnowflake() {
    const flakes = "❄❅❆";
    const el = document.createElement("div");
    el.className = "snowflake";
    el.innerHTML = flakes.charAt(Math.random() * flakes.length);
    el.style.left = Math.random() * 100 + "vw";
    el.style.opacity = Math.random() * 0.6 + 0.3;
    el.style.fontSize = (Math.random() * 18 + 20) + "px";
    el.style.animationDuration = (Math.random() * 8 + 6) + "s";
    document.getElementById("snowflakes")?.appendChild(el);
    setTimeout(() => el.remove(), 12000);
  }
  setInterval(createSnowflake, 250);
  for (let i = 0; i < 30; i++) setTimeout(createSnowflake, i * 100);
}

// Lancer
window.addEventListener("load", loadBubbles);
