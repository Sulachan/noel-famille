// Configuration des membres de la famille
const familyMembers = [
  { id: 'person1', name: 'Personne 1', photoUrl: 'https://i.imgur.com/photo1.jpg', left: '15%', top: '20%' },
  { id: 'person2', name: 'Personne 2', photoUrl: 'https://i.imgur.com/photo2.jpg', left: '85%', top: '20%' },
  { id: 'person3', name: 'Personne 3', photoUrl: 'https://i.imgur.com/photo3.jpg', left: '15%', top: '80%' },
  { id: 'person4', name: 'Personne 4', photoUrl: 'https://i.imgur.com/photo4.jpg', left: '85%', top: '80%' },
  { id: 'person5', name: 'Personne 5', photoUrl: 'https://i.imgur.com/photo5.jpg', left: '50%', top: '50%' }
];

// Variables globales
let currentMember = null;
let centralBubble = null;
let overlay = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  createBubbles();
  createCentralBubble();
  createOverlay();
  createSnowflakes();
});

// Création des bulles des membres
function createBubbles() {
  const bubblesContainer = document.getElementById('bubbles');
  
  familyMembers.forEach(member => {
    const bubble = document.createElement('div');
    bubble.className = 'bulle';
    bubble.style.left = member.left;
    bubble.style.top = member.top;
    bubble.innerHTML = `<img src="${member.photoUrl}" alt="${member.name}">`;
    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      openCentralBubble(member);
    });
    bubblesContainer.appendChild(bubble);
  });
}

// Création de la bulle centrale
function createCentralBubble() {
  centralBubble = document.createElement('div');
  centralBubble.className = 'central-bubble';
  centralBubble.innerHTML = `
    <div class="central-bubble-content">
      <h2 id="central-bubble-name"></h2>
      <textarea id="central-bubble-textarea" placeholder="Ajoutez vos souhaits de Noël..."></textarea>
      <button id="central-bubble-save">Sauvegarder</button>
    </div>
  `;
  document.body.appendChild(centralBubble);
  
  // Gestionnaire de sauvegarde
  document.getElementById('central-bubble-save').addEventListener('click', saveWishlist);
}

// Création de l'overlay
function createOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.addEventListener('click', closeCentralBubble);
  document.body.appendChild(overlay);
}

// Ouverture de la bulle centrale
function openCentralBubble(member) {
  if (currentMember && currentMember.id === member.id) return;
  
  if (currentMember) {
    // Fermer la bulle actuelle avant d'ouvrir une nouvelle
    closeCentralBubble(() => {
      currentMember = member;
      showCentralBubble();
    });
  } else {
    currentMember = member;
    showCentralBubble();
  }
}

// Affichage de la bulle centrale
function showCentralBubble() {
  // Mettre à jour le contenu
  document.getElementById('central-bubble-name').textContent = currentMember.name;
  
  // Charger les souhaits existants
  loadWishlist(currentMember.id, (text) => {
    document.getElementById('central-bubble-textarea').value = text;
  });
  
  // Afficher avec animation
  overlay.classList.add('active');
  centralBubble.classList.remove('closing');
  centralBubble.classList.add('open');
}

// Fermeture de la bulle centrale
function closeCentralBubble(callback) {
  centralBubble.classList.remove('open');
  centralBubble.classList.add('closing');
  
  setTimeout(() => {
    overlay.classList.remove('active');
    centralBubble.classList.remove('closing');
    currentMember = null;
    if (callback) callback();
  }, 500);
}

// Chargement de la liste de souhaits depuis Firestore
function loadWishlist(memberId, callback) {
  db.collection('wishlists').doc(memberId).get().then(doc => {
    if (doc.exists) {
      callback(doc.data().text || '');
    } else {
      callback('');
    }
  }).catch(error => {
    console.error('Erreur de chargement:', error);
    callback('');
  });
}

// Sauvegarde de la liste de souhaits dans Firestore
function saveWishlist() {
  if (!currentMember) return;
  
  const text = document.getElementById('central-bubble-textarea').value;
  
  db.collection('wishlists').doc(currentMember.id).set({
    text: text,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    console.log('Sauvegardé!');
    // Petit feedback visuel
    const button = document.getElementById('central-bubble-save');
    button.textContent = '✓ Sauvegardé!';
    setTimeout(() => {
      button.textContent = 'Sauvegarder';
    }, 2000);
  }).catch(error => {
    console.error('Erreur de sauvegarde:', error);
    alert('Erreur lors de la sauvegarde');
  });
}

// Création des flocons de neige
function createSnowflakes() {
  const snowflakesContainer = document.getElementById('snowflakes');
  const snowflakeCount = 50;
  
  for (let i = 0; i < snowflakeCount; i++) {
    setTimeout(() => {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.innerHTML = '❄';
      snowflake.style.left = Math.random() * 100 + 'vw';
      snowflake.style.animationDuration = (Math.random() * 5 + 5) + 's';
      snowflake.style.opacity = Math.random() * 0.5 + 0.3;
      snowflake.style.fontSize = (Math.random() * 10 + 15) + 'px';
      
      snowflakesContainer.appendChild(snowflake);
      
      // Supprimer le flocon après l'animation
      setTimeout(() => {
        snowflake.remove();
      }, 10000);
    }, i * 200);
  }
  
  // Recréer des flocons périodiquement
  setInterval(createSnowflakes, 10000);
}
