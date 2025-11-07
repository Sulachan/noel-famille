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

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  createBubbles();
  createCentralBubble();
  createSnowflakes();
});

// Création des bulles des membres en cercle, collées à la bulle centrale
function createBubbles() {
  const bubblesContainer = document.getElementById('bubbles');
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  // Rayon pour positionner les bulles autour de la bulle centrale
  const radius = 425;
  
  familyMembers.forEach((member, index) => {
    const angle = (index / familyMembers.length) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle) - 175; // -175 pour centrer (350px/2)
    const y = centerY + radius * Math.sin(angle) - 175;
    
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
  
  document.getElementById('central-bubble-save').addEventListener('click', saveWishlist);
  
  // Fermer la bulle centrale en cliquant à l'extérieur
  document.addEventListener('click', (e) => {
    if (currentMember && !centralBubble.contains(e.target) && 
        !e.target.closest('.bulle')) {
      closeCentralBubble();
    }
  });
}

// Ouverture de la bulle centrale
function openCentralBubble(member) {
  // Si on clique sur la même bulle, on ferme la bulle centrale
  if (currentMember && currentMember.id === member.id) {
    closeCentralBubble();
    return;
  }
  
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
  
  // Réinitialiser l'animation
  centralBubble.classList.remove('closing');
  
  // Forcer un reflow pour réinitialiser l'animation
  void centralBubble.offsetWidth;
  
  // Appliquer l'animation d'ouverture
  centralBubble.classList.add('open');
}

// Fermeture de la bulle centrale
function closeCentralBubble(callback) {
  if (!currentMember) return;
  
  // Supprimer la classe d'ouverture et ajouter la classe de fermeture
  centralBubble.classList.remove('open');
  
  // Forcer un reflow pour réinitialiser l'animation
  void centralBubble.offsetWidth;
  
  // Appliquer l'animation de fermeture
  centralBubble.classList.add('closing');
  
  // Réinitialiser après l'animation
  setTimeout(() => {
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

// Création des flocons de neige (code d'origine qui fonctionnait bien)
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
        if (snowflake.parentNode) {
          snowflake.remove();
        }
      }, 10000);
    }, i * 200);
  }
  
  // Recréer des flocons périodiquement
  setInterval(createSnowflakes, 10000);
}

// Redimensionnement des bulles si la fenêtre change de taille
window.addEventListener('resize', function() {
  const bubblesContainer = document.getElementById('bubbles');
  bubblesContainer.innerHTML = '';
  createBubbles();
});
