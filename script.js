let currentAnimatedBubble = null;
let pendingBubbleClick = null;

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
    bubble.dataset.name = name;
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
      console.warn("Image non chargée :", url);
    };

    bubble.addEventListener("click", (e) => {
      e.stopPropagation();
      handleBubbleClick(bubble, name);
    });

    bubble.style.left = (x - 50) + "px";
    bubble.style.top = (y - 50) + "px";
    container.appendChild(bubble);
  });

  startSnowflakes();
}

// --- Gestion du clic sur une bulle ---
function handleBubbleClick(bubble, name) {
  if (currentAnimatedBubble) {
    // Une bulle est déjà animée → planifier la prochaine
    pendingBubbleClick = { bubble, name };
    return;
  }

  animateBubbleToCenter(bubble, name);
}

// --- Animer la bulle vers le centre ---
function animateBubbleToCenter(originalBubble, name) {
  const rect = originalBubble.getBoundingClientRect();
  const clone = originalBubble.cloneNode(true);
  clone.classList.add("animated");
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";

  document.body.appendChild(clone);

  // Forcer repaint
  void clone.offsetWidth;

  // Animer vers le centre
  const finalSize = 280;
  const scaleX = finalSize / rect.width;
  const scaleY = finalSize / rect.height;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const translateX = centerX - (rect.left + rect.width / 2);
  const translateY = centerY - (rect.top + rect.height / 2);

  clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

  // Afficher l'overlay de texte après l'animation
  setTimeout(() => {
    showTextOverlay(name, () => {
      // Fermer → retourner la bulle
      clone.style.transform = "";
      setTimeout(() => {
        clone.remove();
        currentAnimatedBubble = null;

        // Enchaîner la prochaine si planifiée
        if (pendingBubbleClick) {
          const { bubble, name } = pendingBubbleClick;
          pendingBubbleClick = null;
          animateBubbleToCenter(bubble, name);
        }
      }, 600);
    });
  }, 600);

  currentAnimatedBubble = clone;
}

// --- Afficher l'overlay de texte ---
function showTextOverlay(name, onClose) {
  const overlay = document.createElement("div");
  overlay.id = "bubble-overlay";
  overlay.innerHTML = `
    <div id="bubble-content">
      <h3>${name}</h3>
      <textarea id="list-input" placeholder="Écris ta liste de Noël..."></textarea>
      <button id="save-btn">Sauvegarder</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Charger la liste
  firebase.firestore().collection("listes").doc(name).get().then(doc => {
    if (doc.exists && doc.data().text) {
      document.getElementById("list-input").value = doc.data().text;
    }
  });

  // Clic en dehors ou sur Sauvegarder
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.id === "save-btn") {
      const textarea = document.getElementById("list-input");
      if (e.target.id === "save-btn") {
        if (textarea?.value.trim()) {
          firebase.firestore().collection("listes").doc(name).set({
            text: textarea.value.trim(),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => {
            alert("✅ Sauvegardé !");
          }).catch(err => alert("❌ " + err.message));
        } else {
          alert("La liste ne peut pas être vide.");
          return;
        }
      }
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        onClose();
      }, 300);
    }
  });

  setTimeout(() => overlay.classList.add("active"), 10);
}

// --- Flocons (inchangé) ---
function startSnowflakes() {
  if (window.snowflakesStarted) return;
  window.snowflakesStarted = true;
  function createSnowflake() {
    const flakes = "❄❅❆";
    const el = document.createElement("div");
    el.className = "snowflake";
    el.innerHTML = flakes.charAt(Math.random() * flakes.length);
    el.style.left = Math.random() * 100 + "vw";
    el.style.opacity = Math.random() * 0.5 + 0.3;
    el.style.fontSize = (Math.random() * 12 + 14) + "px";
    el.style.animationDuration = (Math.random() * 5 + 5) + "s";
    document.getElementById("snowflakes")?.appendChild(el);
    setTimeout(() => el.remove(), 10000);
  }
  setInterval(createSnowflake, 400);
  for (let i = 0; i < 15; i++) setTimeout(createSnowflake, i * 300);
}

// --- Lancer ---
window.addEventListener("load", loadBubbles);
