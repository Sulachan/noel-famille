// Configuration des membres de la famille
const familyMembers = [
  { id: 'person1', name: 'Personne 1', photoUrl: 'https://i.imgur.com/photo1.jpg' },
  { id: 'person2', name: 'Personne 2', photoUrl: 'https://i.imgur.com/photo2.jpg' },
  { id: 'person3', name: 'Personne 3', photoUrl: 'https://i.imgur.com/photo3.jpg' },
  { id: 'person4', name: 'Personne 4', photoUrl: 'https://i.imgur.com/photo4.jpg' },
  { id: 'person5', name: 'Personne 5', photoUrl: 'https://i.imgur.com/photo5.jpg' }
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

// Création des bulles des membres en cercle
function createBubbles() {
  const bubblesContainer = document.getElementById('bubbles');
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const radius = Math.min(centerX, centerY) * 0.7; // Rayon du cercle
  
  familyMembers.forEach((member, index) => {
    const angle = (index / familyMembers.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle) - 90; // -90 pour centrer la bulle (180px/2)
    const y = centerY + radius * Math.sin(angle) - 90;
    
    const bubble = document.createElement('div');
    bubble.className = 'bulle';
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
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
    const originalText = button.textContent;
    button.textContent = '✓ Sauvegardé!';
    button.style.background = '#2E7D32';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '#4CAF50';
    }, 2000);
  }).catch(error => {
    console.error('Erreur de sauvegarde:', error);
    alert('Erreur lors de la sauvegarde');
  });
}

// Création des flocons de neige optimisée
function createSnowflakes() {
  const snowflakesContainer = document.getElementById('snowflakes');
  const snowflakeCount = 15; // Réduit de 50 à 15 flocons
  
  for (let i = 0; i < snowflakeCount; i++) {
    setTimeout(() => {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.innerHTML = '❄';
      
      // Taille plus grande et variable
      const size = Math.random() * 30 + 25; // 25px à 55px
      snowflake.style.fontSize = `${size}px`;
      
      // Position horizontale
      snowflake.style.left = Math.random() * 100 + 'vw';
      
      // Durée d'animation plus lente
      const duration = Math.random() * 10 + 15; // 15 à 25 secondes
      snowflake.style.animationDuration = `${duration}s`;
      
      // Opacité réduite
      snowflake.style.opacity = Math.random() * 0.4 + 0.3;
      
      // Délai d'animation aléatoire
      snowflake.style.animationDelay = Math.random() * 5 + 's';
      
      snowflakesContainer.appendChild(snowflake);
      
      // Supprimer le flocon après l'animation (plus long)
      setTimeout(() => {
        if (snowflake.parentNode) {
          snowflake.remove();
        }
      }, duration * 1000 + 5000);
    }, i * 500); // Espacement plus long entre la création des flocons
  }
  
  // Recréer des flocons moins fréquemment
  setInterval(createSnowflakes, 15000); // Toutes les 15 secondes au lieu de 10
}

// Redimensionnement des bulles si la fenêtre change de taille
window.addEventListener('resize', function() {
  const bubblesContainer = document.getElementById('bubbles');
  bubblesContainer.innerHTML = '';
  createBubbles();
});
