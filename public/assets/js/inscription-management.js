// Gestion des Inscriptions - Interface d'Administration

// ============ GESTION DE LA CONFIGURATION ============

document.getElementById('configForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const soustitre = formData.get('soustitre').trim();

    if (!soustitre) {
        showAlert('Le sous-titre ne peut pas être vide', 'error');
        return;
    }

    try {
        showLoading('Mise à jour en cours...');

        const response = await fetch('/inscription-management/admin/config', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ soustitre })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Configuration mise à jour avec succès', 'success');
            // Recharger la page après 1 seconde pour afficher les nouvelles données
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showAlert(result.message || 'Erreur lors de la mise à jour', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur de connexion', 'error');
    } finally {
        hideLoading();
    }
});

// ============ GESTION DES DOCUMENTS ============

function openUploadModal() {
    document.getElementById('uploadModal').style.display = 'flex';
    document.getElementById('documentName').focus();
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    document.getElementById('uploadForm').reset();
}

// Fermer le modal en cliquant à l'extérieur
document.getElementById('uploadModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('uploadModal')) {
        closeUploadModal();
    }
});

// Upload de document
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const file = formData.get('document');

    if (!file || file.size === 0) {
        showAlert('Veuillez sélectionner un fichier PDF', 'error');
        return;
    }

    if (file.type !== 'application/pdf') {
        showAlert('Seuls les fichiers PDF sont acceptés', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
        showAlert('Le fichier ne peut pas dépasser 10MB', 'error');
        return;
    }

    try {
        showLoading('Upload en cours...');

        const response = await fetch('/inscription-management/admin/documents', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Document ajouté avec succès', 'success');
            closeUploadModal();
            // Recharger la page pour afficher le nouveau document
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showAlert(result.message || 'Erreur lors de l\'ajout du document', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors de l\'upload', 'error');
    } finally {
        hideLoading();
    }
});

// Suppression de document
async function deleteDocument(id, nom) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${nom}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    try {
        showLoading('Suppression en cours...');

        const response = await fetch(`/inscription-management/admin/documents/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Document supprimé avec succès', 'success');
            // Supprimer l'élément du DOM
            const documentElement = document.querySelector(`[data-document-id="${id}"]`);
            if (documentElement) {
                documentElement.remove();
            }
        } else {
            showAlert(result.message || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors de la suppression', 'error');
    } finally {
        hideLoading();
    }
}

// Déplacement de document (ordre)
async function moveDocument(id, direction) {
    const container = document.getElementById('documentsContainer');
    const currentElement = document.querySelector(`[data-document-id="${id}"]`);

    if (!currentElement) return;

    let targetElement;
    if (direction === 'up') {
        targetElement = currentElement.previousElementSibling;
    } else {
        targetElement = currentElement.nextElementSibling;
    }

    if (!targetElement) return; // Déjà en première/dernière position

    // Échanger les positions dans le DOM
    if (direction === 'up') {
        container.insertBefore(currentElement, targetElement);
    } else {
        container.insertBefore(targetElement, currentElement);
    }

    // Récupérer le nouvel ordre et l'envoyer au serveur
    const documents = Array.from(container.children).map((element, index) => ({
        id: parseInt(element.dataset.documentId),
        ordre: index + 1
    }));

    try {
        const response = await fetch('/inscription-management/admin/documents/order', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ documents })
        });

        const result = await response.json();

        if (!result.success) {
            showAlert('Erreur lors de la réorganisation', 'error');
            // Recharger la page en cas d'erreur
            window.location.reload();
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors de la réorganisation', 'error');
        window.location.reload();
    }
}

// ============ FONCTIONS UTILITAIRES ============

function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} mb-4 animate-fade-in`;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    alertDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${icon} ${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="text-lg">&times;</button>
        </div>
    `;

    container.appendChild(alertDiv);

    // Auto-suppression après 5 secondes
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

function showLoading(message = 'Chargement...') {
    const container = document.getElementById('alertContainer');

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingAlert';
    loadingDiv.className = 'alert alert-info mb-4';
    loadingDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingAlert = document.getElementById('loadingAlert');
    if (loadingAlert) {
        loadingAlert.remove();
    }
}

// ============ ÉVÉNEMENTS GLOBAUX ============

// Gestion des raccourcis clavier
document.addEventListener('keydown', (e) => {
    // Échap pour fermer les modals
    if (e.key === 'Escape') {
        closeUploadModal();
    }
});

// Prévisualisation du fichier sélectionné
document.getElementById('documentFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const size = (file.size / 1024 / 1024).toFixed(2);
        console.log(`Fichier sélectionné: ${file.name} (${size} MB)`);

        if (file.size > 10 * 1024 * 1024) {
            showAlert('Attention: le fichier dépasse 10MB', 'warning');
        }
    }
});

console.log('✅ Interface de gestion des inscriptions chargée');
