let currentAnimatedBubble = null;
let pendingClick = null;

function loadBubbles() {
  const names = ["Maman", "Papa", "Anton", "Ewan", "Sara"]; // pas besoin d'images

  const container = document.getElementById("bubbles");
  const radius = 320; // grand cercle
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
      handleBubbleClick(bubble, name);
    });

    bubble.style.left = (x - 100) + "px"; // 200/2 = 100
    bubble.style.top = (y - 100) + "px";
    container.appendChild(bubble);
  });

  startSnowflakes();
}

function handleBubbleClick(bubble, name) {
  if (currentAnimatedBubble) {
    pendingClick = { bubble, name };
    closeCurrent();
    return;
  }
  animateToCenter(bubble, name);
}

function animateToCenter(originalBubble, name) {
  const rect = originalBubble.getBoundingClientRect();
  const clone = originalBubble.cloneNode(true);
  clone.className = "bulle animated";
  clone.style.left = (rect.left + window.scrollX) + "px";
  clone.style.top = (rect.top + window.scrollY) + "px";
  clone.style.width = "200px";
  clone.style.height = "200px";

  document.body.appendChild(clone);

  // Animer vers le centre et agrandir
  setTimeout(() => {
    clone.style.left = "50%";
    clone.style.top = "50%";
    clone.style.transform = "translate(-50%, -50%) scale(1.8)";
    clone.style.zIndex = "30";
  }, 10);

  currentAnimatedBubble = { element: clone, name };
  showTextOverlay(name);
}

function showTextOverlay(name) {
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

  setTimeout(() => overlay.classList.add("active"), 50);
}

function closeCurrent() {
  if (!currentAnimatedBubble) return;

  const { element: clone } = currentAnimatedBubble;
  clone.style.transform = "";
  clone.style.left = clone.style.getPropertyValue("--start-x") || clone.style.left;
  clone.style.top = clone.style.getPropertyValue("--start-y") || clone.style.top;

  const overlay = document.getElementById("text-overlay");
  if (overlay) overlay.classList.remove("active");

  setTimeout(() => {
    clone.remove();
    if (overlay) overlay.remove();
    currentAnimatedBubble = null;

    if (pendingClick) {
      const { bubble, name } = pendingClick;
      pendingClick = null;
      animateToCenter(bubble, name);
    }
  }, 600);
}

document.addEventListener("click", (e) => {
  if (currentAnimatedBubble && !e.target.closest("#text-content")) {
    pendingClick = null;
    closeCurrent();
  }
});

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
    closeCurrent();
  }).catch(err => alert("❌ " + err.message));
};

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

window.addEventListener("load", loadBubbles);
