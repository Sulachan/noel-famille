let currentAnimatedBubble = null;
let pendingClick = null;

const photos = {
  "Maman": "https://i.imgur.com/88Fx119.jpeg",
  "Papa": "https://i.imgur.com/lEa3Dky.jpeg",
  "Anton": "https://i.imgur.com/qU270du.jpeg",
  "Ewan": "https://i.imgur.com/VzvtbSu.jpeg",
  "Sara": "https://i.imgur.com/rwnpdOV.jpeg"
};

function loadBubbles() {
  const container = document.getElementById("bubbles");
  const radius = 340;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  container.innerHTML = "";

  Object.keys(photos).forEach((name, i) => {
    const angle = (i / Object.keys(photos).length) * Math.PI * 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const bubble = document.createElement("div");
    bubble.className = "bulle";

    const img = document.createElement("img");
    img.src = photos[name];
    img.alt = name;

    bubble.appendChild(img);
    bubble.addEventListener("click", (e) => {
      e.stopPropagation();
      handleBubbleClick(bubble, name);
    });

    bubble.style.left = (x - 110) + "px";
    bubble.style.top = (y - 110) + "px";
    container.appendChild(bubble);
  });

  startSnowflakes();
}

function handleBubbleClick(bubble, name) {
  if (currentAnimatedBubble) {
    pendingClick = { bubble, name };
    closeCurrentBubble();
    return;
  }
  animateToCenter(bubble, name);
}

function animateToCenter(originalBubble, name) {
  const rect = originalBubble.getBoundingClientRect();
  const clone = originalBubble.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.left = (rect.left + window.scrollX) + "px";
  clone.style.top = (rect.top + window.scrollY) + "px";
  clone.style.width = "220px";
  clone.style.height = "220px";
  clone.style.zIndex = "30";
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.transition = "none";

  document.body.appendChild(clone);

  setTimeout(() => {
    clone.style.transition = "left 0.6s, top 0.6s, transform 0.6s";
    clone.style.left = "50%";
    clone.style.top = "50%";
    clone.style.transform = "translate(-50%, -50%) scale(1.6)";
  }, 10);

  currentAnimatedBubble = { element: clone, originalBubble, name };
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

  firebase.firestore().collection("listes").doc(name).get().then(doc => {
    if (doc.exists && doc.data().text) {
      document.getElementById("list-input").value = doc.data().text;
    }
  });

  setTimeout(() => overlay.classList.add("active"), 50);
}

function closeCurrentBubble() {
  if (!currentAnimatedBubble) return;

  const { element: clone, originalBubble } = currentAnimatedBubble;
  const rect = originalBubble.getBoundingClientRect();

  clone.style.transition = "left 0.6s, top 0.6s, transform 0.6s";
  clone.style.left = (rect.left + window.scrollX) + "px";
  clone.style.top = (rect.top + window.scrollY) + "px";
  clone.style.transform = "none";

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
    closeCurrentBubble();
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
    closeCurrentBubble();
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
    el.style.fontSize = (Math.random() * 20 + 22) + "px";
    el.style.animationDuration = (Math.random() * 8 + 7) + "s";
    document.getElementById("snowflakes")?.appendChild(el);
    setTimeout(() => el.remove(), 12000);
  }
  setInterval(createSnowflake, 200);
  for (let i = 0; i < 35; i++) setTimeout(createSnowflake, i * 80);
}

window.addEventListener("load", loadBubbles);
