// Base de données intégrée des participants (anonymisée)
const participantsDatabase = {
  "700AEC4A": {
    "id": "700AEC4A",
    "name": "Participant 700AEC4A",
    "region": "Haute-Normandie",
    "events": []
  },
  "1208041C": {
    "id": "1208041C",
    "name": "Participant 1208041C",
    "region": "Strasbourg",
    "events": [
      {
        "name": "Ouverture Journées",
        "time": "JN Le Havre 2024"
      },
      {
        "name": "Courts de Maths Adultes",
        "time": "Samedi 20h30"
      },
      {
        "name": "Courts de Maths Adultes",
        "time": "Samedi 20h30"
      },
      {
        "name": "Courts de Maths Enfants",
        "time": "Samedi 20h30"
      },
      {
        "name": "Banquet",
        "time": "Dimanche 19h30"
      },
      {
        "name": "Banquet",
        "time": "Dimanche 19h30"
      },
      {
        "name": "Réception Hôtel de Ville",
        "time": "Lundi 20h"
      },
      {
        "name": "Clôture Journées",
        "time": "JN Le Havre 2024"
      }
    ]
  },
  "A6569C33": {
    "id": "A6569C33",
    "name": "Participant A6569C33",
    "region": "Strasbourg",
    "events": [
      {
        "name": "Ouverture Journées",
        "time": "JN Le Havre 2024"
      },
      {
        "name": "Banquet",
        "time": "Dimanche 19h30"
      },
      {
        "name": "Banquet",
        "time": "Dimanche 19h30"
      },
      {
        "name": "Clôture Journées",
        "time": "JN Le Havre 2024"
      }
    ]
  },
  "3BA1AAF6": {
    "id": "3BA1AAF6",
    "name": "Participant 3BA1AAF6",
    "region": "Strasbourg",
    "events": [
      {
        "name": "Ouverture Journées",
        "time": "JN Le Havre 2024"
      },
      {
        "name": "Clôture Journées",
        "time": "JN Le Havre 2024"
      }
    ]
  }
};

// Variables globales
let html5QrcodeScanner = null;
let cameraStarted = false;

// Éléments DOM
const elements = {
  tabButtons: document.querySelectorAll('.tab-button'),
  tabContents: document.querySelectorAll('.tab-content'),
  startCameraBtn: document.getElementById('startCamera'),
  stopCameraBtn: document.getElementById('stopCamera'),
  imageUpload: document.getElementById('imageUpload'),
  scanImageBtn: document.getElementById('scanImage'),
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  scanResult: document.getElementById('scanResult'),
  participantInfo: document.getElementById('participantInfo'),
  statusMessage: document.getElementById('statusMessage'),
  newScanBtn: document.getElementById('newScan'),
  newSearchBtn: document.getElementById('newSearch'),
  testImages: document.querySelectorAll('.test-qr'),
  testIdButtons: document.querySelectorAll('.test-id-btn')
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupTabs();
  setupScanner();
  setupSearch();
  setupTestImages();
  setupTestIdButtons();
}

// Gestion des onglets
function setupTabs() {
  elements.tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Arrêter la caméra si elle est active
  if (cameraStarted) {
    stopCamera();
  }

  // Masquer tous les résultats
  elements.scanResult.style.display = 'none';
  elements.participantInfo.style.display = 'none';

  // Changer les onglets actifs
  elements.tabButtons.forEach(btn => btn.classList.remove('active'));
  elements.tabContents.forEach(content => content.classList.remove('active'));

  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// Configuration du scanner
function setupScanner() {
  elements.startCameraBtn.addEventListener('click', startCamera);
  elements.stopCameraBtn.addEventListener('click', stopCamera);
  elements.scanImageBtn.addEventListener('click', scanImageFile);
  elements.newScanBtn.addEventListener('click', resetScanner);
}

function startCamera() {
  if (cameraStarted) return;

  const readerElement = document.getElementById('reader');
  readerElement.style.display = 'block';

  html5QrcodeScanner = new Html5Qrcode("reader");

 Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const cameraId = devices[0].id;

      html5QrcodeScanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText, decodedResult) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore les erreurs répétées de scan
        }
      ).then(() => {
        cameraStarted = true;
        elements.startCameraBtn.style.display = 'none';
        elements.stopCameraBtn.style.display = 'inline-flex';
        showStatus('Caméra démarrée avec succès', 'success');
      }).catch(err => {
        showStatus('Erreur lors du démarrage de la caméra: ' + err, 'error');
      });
    } else {
      showStatus('Aucune caméra détectée', 'error');
    }
  }).catch(err => {
    showStatus('Erreur d\'accès aux caméras: ' + err, 'error');
  });
}

function stopCamera() {
  if (!cameraStarted || !html5QrcodeScanner) return;

  html5QrcodeScanner.stop().then(() => {
    cameraStarted = false;
    elements.startCameraBtn.style.display = 'inline-flex';
    elements.stopCameraBtn.style.display = 'none';
    document.getElementById('reader').style.display = 'none';
    showStatus('Caméra arrêtée', 'info');
  }).catch(err => {
    showStatus('Erreur lors de l\'arrêt de la caméra: ' + err, 'error');
  });
}

function scanImageFile() {
  const file = elements.imageUpload.files[0];
  if (!file) {
    showStatus('Veuillez sélectionner une image', 'error');
    return;
  }

  const html5QrCode = new Html5Qrcode("reader");
  html5QrCode.scanFile(file, true)
    .then(decodedText => {
      onScanSuccess(decodedText);
    })
    .catch(err => {
      showStatus('Impossible de décoder le QR code dans l\'image: ' + err, 'error');
    });
}

function onScanSuccess(decodedText) {
  const participantId = decodedText.trim();

  if (cameraStarted) {
    stopCamera();
  }

  displayParticipant(participantId, 'scan');
}

// Configuration de la recherche
function setupSearch() {
  elements.searchButton.addEventListener('click', searchParticipant);
  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchParticipant();
    }
  });
  elements.newSearchBtn.addEventListener('click', resetSearch);
}

function searchParticipant() {
  const participantId = elements.searchInput.value.trim().toUpperCase();

  if (!participantId) {
    showStatus('Veuillez entrer un ID participant', 'error');
    return;
  }

  displayParticipant(participantId, 'search');
}

// Configuration des images de test
function setupTestImages() {
  elements.testImages.forEach(img => {
    img.addEventListener('click', () => {
      const participantId = img.dataset.id;
      showStatus('Test avec l\'ID: ' + participantId, 'info');
      displayParticipant(participantId, 'scan');
    });
  });
}

// Configuration des boutons d'ID de test
function setupTestIdButtons() {
  elements.testIdButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const participantId = btn.dataset.id;
      elements.searchInput.value = participantId;
      showStatus('ID de test sélectionné: ' + participantId, 'info');
      displayParticipant(participantId, 'search');
    });
  });
}

// Affichage des informations participant
function displayParticipant(participantId, source) {
  const participant = participantsDatabase[participantId];

  if (!participant) {
    showStatus(`Participant non trouvé: ${participantId}`, 'error');
    return;
  }

  showStatus(`Participant trouvé: ${participant.name}`, 'success');

  const content = createParticipantContent(participant);

  if (source === 'scan') {
    elements.scanResult.querySelector('#scanResultContent').innerHTML = content;
    elements.scanResult.style.display = 'block';
    elements.participantInfo.style.display = 'none';
  } else {
    elements.participantInfo.querySelector('#participantInfoContent').innerHTML = content;
    elements.participantInfo.style.display = 'block';
    elements.scanResult.style.display = 'none';
  }
}

function createParticipantContent(participant) {
  const eventsHtml = participant.events.length > 0
    ? participant.events.map(event => `
        <div class="event-item">
          <div class="event-name">${event.name}</div>
          <div class="event-time">${event.time}</div>
        </div>
      `).join('')
    : '<div class="empty-state"><h4>Aucun événement</h4><p>Ce participant n\'a pas d\'événements enregistrés.</p></div>';

  return `
    <div class="participant-card">
      <h4>${participant.name}</h4>
      <div class="region">📍 ${participant.region}</div>
      <div class="id">ID: ${participant.id}</div>
    </div>

    <div class="events-section">
      <h5>Événements inscrits (${participant.events.length})</h5>
      <div class="events-list">
        ${eventsHtml}
      </div>
    </div>
  `;
}

// Fonctions de réinitialisation
function resetScanner() {
  elements.scanResult.style.display = 'none';
  elements.imageUpload.value = '';
  showStatus('Prêt pour un nouveau scan', 'info');
}

function resetSearch() {
  elements.participantInfo.style.display = 'none';
  elements.searchInput.value = '';
  elements.searchInput.focus();
  showStatus('Prêt pour une nouvelle recherche', 'info');
}

// Gestion des messages de statut
function showStatus(message, type = 'info') {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status-message ${type}`;
  elements.statusMessage.classList.add('show');

  setTimeout(() => {
    elements.statusMessage.classList.remove('show');
  }, 4000);
}

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
  console.error('Erreur globale:', e.error);
  showStatus('Une erreur est survenue', 'error');
});

// Nettoyage lors de la fermeture
window.addEventListener('beforeunload', () => {
  if (cameraStarted && html5QrcodeScanner) {
    html5QrcodeScanner.stop();
  }
});