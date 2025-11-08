// Configuration des membres de la famille
const familyMembers = [
  { id: 'person1', name: 'Maman', photoUrl: 'https://i.imgur.com/88Fx119.jpeg' },
  { id: 'person2', name: 'Papa', photoUrl: 'https://i.imgur.com/lEa3Dky.jpeg' },
  { id: 'person3', name: 'Anton', photoUrl: 'https://i.imgur.com/3SN6pX7.jpeg' },
  { id: 'person4', name: 'Ewan', photoUrl: 'https://i.imgur.com/VzvtbSu.jpeg' },
  { id: 'person5', name: 'Sara', photoUrl: 'https://i.imgur.com/rwnpdOV.jpeg' }
];

// Variables globales
let currentMember = null;
let centralBubble = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  // Vérifier que Firebase est initialisé
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialisé avec succès');
  } catch (error) {
    console.log('Firebase déjà initialisé ou erreur:', error);
  }
  
  createBubbles();
  createCentralBubble();
  createSnowflakes();
});

// Création des bulles des membres en cercle, avec positionnement en pourcentages
function createBubbles() {
  const bubblesContainer = document.getElementById('bubbles');
  bubblesContainer.innerHTML = '';
  
  // Positions en pourcentages pour un placement responsive
  const positions = [
    { left: '15%', top: '20%' },   // Haut gauche
    { left: '85%', top: '20%' },   // Haut droite
    { left: '15%', top: '80%' },   // Bas gauche
    { left: '85%', top: '80%' },   // Bas droite
    { left: '50%', top: '50%' }    // Centre
  ];
  
  familyMembers.forEach((member, index) => {
    const position = positions[index];
    
    const bubble = document.createElement('div');
    bubble.className = 'bulle';
    bubble.style.left = position.left;
    bubble.style.top = position.top;
    bubble.style.transform = 'translate(-50%, -50%)'; // Centre la bulle sur sa position
    
    const img = document.createElement('img');
    img.src = member.photoUrl;
    img.alt = member.name;
    img.onerror = function() {
      // Image de fallback si le chargement échoue
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QaG90bzwvdGV4dD48L3N2Zz4=';
    };
    
    bubble.appendChild(img);
    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      openCentralBubble(member);
    });
    
    bubblesContainer.appendChild(bubble);
  });
}

// Supprimer l'écouteur de redimensionnement existant qui recrée les bulles
// car maintenant elles sont en pourcentages et s'adaptent automatiquement

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

// Effet de répulsion corrigé sur les bulles extérieures
function applyRepulsion() {
  const bubbles = document.querySelectorAll('.bulle');
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  bubbles.forEach(bubble => {
    const originalX = parseFloat(bubble.dataset.originalX);
    const originalY = parseFloat(bubble.dataset.originalY);
    
    // Calculer la direction de répulsion (opposée au centre)
    const dirX = originalX - centerX;
    const dirY = originalY - centerY;
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
    
    // Normaliser la direction
    const normX = dirX / distance;
    const normY = dirY / distance;
    
    // Distance de répulsion (proportionnelle à la taille des bulles)
    const repulsionDistance = 50;
    
    // Appliquer les valeurs CSS personnalisées pour l'animation
    bubble.style.setProperty('--translate-x', `${normX * repulsionDistance}px`);
    bubble.style.setProperty('--translate-y', `${normY * repulsionDistance}px`);
    
    // Forcer un reflow
    void bubble.offsetWidth;
    
    // Appliquer l'animation de répulsion
    bubble.classList.add('repulsion');
    
    // Retirer l'animation après qu'elle soit terminée
    setTimeout(() => {
      bubble.classList.remove('repulsion');
    }, 500);
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
  document.getElementById('central-bubble-name').textContent = currentMember.name;
  
  loadWishlist(currentMember.id, (text) => {
    document.getElementById('central-bubble-textarea').value = text;
  });
  
  // Réinitialiser l'animation
  centralBubble.classList.remove('closing');
  
  // Forcer un reflow pour réinitialiser l'animation
  void centralBubble.offsetWidth;
  
  // Appliquer l'animation d'ouverture
  centralBubble.classList.add('open');
  
  // Appliquer l'effet de répulsion aux bulles extérieures
  setTimeout(() => {
    applyRepulsion();
  }, 100); // Petit délai pour synchroniser avec l'ouverture
}

// Fermeture de la bulle centrale
function closeCentralBubble(callback) {
  if (!currentMember) return;
  
  // Appliquer l'effet de répulsion aux bulles extérieures
  applyRepulsion();
  
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
  // Vérifier que Firestore est disponible
  if (!firebase.firestore) {
    console.error('Firestore non disponible');
    callback('');
    return;
  }
  
  const db = firebase.firestore();
  
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
  if (!currentMember) {
    alert('Aucun membre sélectionné');
    return;
  }
  
  // Vérifier que Firestore est disponible
  if (!firebase.firestore) {
    alert('Firestore non disponible. Vérifiez la configuration Firebase.');
    return;
  }
  
  const text = document.getElementById('central-bubble-textarea').value;
  const db = firebase.firestore();
  
  db.collection('wishlists').doc(currentMember.id).set({
    text: text,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    console.log('Sauvegardé avec succès!');
    const button = document.getElementById('central-bubble-save');
    const originalText = button.textContent;
    button.textContent = '✓ Sauvegardé!';
    button.style.background = '#2E7D32';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '#4CAF50';
    }, 2000);
  }).catch(error => {
    console.error('Erreur de sauvegarde détaillée:', error);
    
    // Message d'erreur plus explicite
    let errorMessage = 'Erreur lors de la sauvegarde. ';
    
    if (error.code === 'permission-denied') {
      errorMessage += 'Permissions Firebase insuffisantes. Vérifiez les règles de sécurité.';
    } else if (error.code === 'unavailable') {
      errorMessage += 'Connexion internet nécessaire.';
    } else {
      errorMessage += 'Détails: ' + error.message;
    }
    
    alert(errorMessage);
  });
}

// Création des flocons de neige optimisée
function createSnowflakes() {
  const snowflakesContainer = document.getElementById('snowflakes');
  const snowflakeCount = 15;
  
  for (let i = 0; i < snowflakeCount; i++) {
    createSnowflake(snowflakesContainer, i);
  }
}

// Création d'un flocon individuel
function createSnowflake(container, index) {
  setTimeout(() => {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = '❄';
    
    // Position aléatoire
    snowflake.style.left = Math.random() * 100 + 'vw';
    
    // Taille aléatoire réduite
    const size = Math.random() * 10 + 15;
    snowflake.style.fontSize = `${size}px`;
    
    // Durée d'animation plus lente
    const duration = Math.random() * 10 + 10;
    snowflake.style.animationDuration = `${duration}s`;
    
    // Opacité réduite
    snowflake.style.opacity = Math.random() * 0.4 + 0.3;
    
    // Délai d'animation aléatoire
    snowflake.style.animationDelay = Math.random() * 5 + 's';
    
    container.appendChild(snowflake);
    
    // Supprimer le flocon après l'animation
    setTimeout(() => {
      if (snowflake.parentNode) {
        snowflake.remove();
      }
    }, duration * 1000 + 2000);
  }, index * 500);
}

// Redimensionnement des bulles si la fenêtre change de taille
window.addEventListener('resize', function() {
  const bubblesContainer = document.getElementById('bubbles');
  bubblesContainer.innerHTML = '';
  createBubbles();
});

// Démarrer la création périodique de flocons
setInterval(createSnowflakes, 20000);


