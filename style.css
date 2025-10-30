let currentAnimatedBubble = null;
let pendingBubbleClick = null;

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

    bubble.style.left = (x - 50) + "px";  // 100px de large → -50 pour centrer
    bubble.style.top = (y - 50) + "px";
    container.appendChild(bubble);
  });

  startSnowflakes();
}

function handleBubbleClick(bubble, name) {
  if (currentAnimatedBubble) {
    pendingBubbleClick = { bubble, name };
    closeCurrentBubble();
    return;
  }
  animateBubbleToCenter(bubble, name);
}

function animateBubbleToCenter(originalBubble, name) {
  const rect = originalBubble.getBoundingClientRect();
  const clone = document.createElement("div");
  clone.className = "bulle animated";

  // Créer les deux faces
  const front = document.createElement("div");
  front.className = "front";
  front.innerHTML = originalBubble.innerHTML || name;

  const back = document.createElement("div");
  back.className = "back";
  back.innerHTML = `
    <h3 style="font-size:18px;margin-bottom:8px;">${name}</h3>
    <textarea id="list-input" placeholder="Ta liste..." 
      style="width:90%;height:90px;padding:8px;border:none;border-radius:6px;background:rgba(255,255,255,0.9);resize:none;"></textarea>
    <button onclick="saveAndClose('${name}')" 
      style="margin-top:8px;padding:6px 12px;background:white;color:#48dbfb;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">
      Sauvegarder
    </button>
  `;

  clone.appendChild(front);
  clone.appendChild(back);

  // Position initiale
  clone.style.left = (rect.left + window.scrollX) + "px";
  clone.style.top = (rect.top + window.scrollY) + "px";
  clone.style.width = "100px";
  clone.style.height = "100px";

  document.body.appendChild(clone);

  // Forcer repaint
  void clone.offsetWidth;

  // Animer vers le centre ET pivoter
  clone.classList.add("flipped");

  currentAnimatedBubble = { element: clone, name };
}

function closeCurrentBubble() {
  if (!currentAnimatedBubble) return;

  const { element: clone } = currentAnimatedBubble;
  clone.classList.remove("flipped");

  setTimeout(() => {
    clone.remove();
    currentAnimatedBubble = null;

    if (pendingBubbleClick) {
      const { bubble, name } = pendingBubbleClick;
      pendingBubbleClick = null;
      animateBubbleToCenter(bubble, name);
    }
  }, 800);
}

// Clic en dehors → fermer
document.addEventListener("click", (e) => {
  if (currentAnimatedBubble && !e.target.closest(".bulle.animated")) {
    pendingBubbleClick = null;
    closeCurrentBubble();
  }
});

// Sauvegarde + fermeture
window.saveAndClose = function(name) {
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
    closeCurrentBubble();
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
    el.style.opacity = Math.random() * 0.5 + 0.3;
    el.style.fontSize = (Math.random() * 12 + 14) + "px";
    el.style.animationDuration = (Math.random() * 5 + 5) + "s";
    document.getElementById("snowflakes")?.appendChild(el);
    setTimeout(() => el.remove(), 10000);
  }
  setInterval(createSnowflake, 400);
  for (let i = 0; i < 15; i++) setTimeout(createSnowflake, i * 300);
}

// Lancer
window.addEventListener("load", loadBubbles);
