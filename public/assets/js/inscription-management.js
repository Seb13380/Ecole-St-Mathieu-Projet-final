// Gestion des Inscriptions - Interface d'Administration

// ===== GESTION DE LA CONFIGURATION =====

document.getElementById('configForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const soustitre = formData.get('soustitre').trim();
    const afficherAnnoncePS2026 = formData.get('afficherAnnoncePS2026') === '1';

    if (!soustitre) {
        showAlert('Le sous-titre ne peut pas Ãªtre vide', 'error');
        return;
    }

    try {
        showLoading('Mise Ã  jour en cours...');

        const response = await fetch('/inscription-management/admin/config', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                soustitre,
                afficherAnnoncePS2026
            })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Configuration mise Ã  jour avec succÃ¨s', 'success');
            // Recharger la page aprÃ¨s 1 seconde pour afficher les nouvelles donnÃ©es
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showAlert(result.message || 'Erreur lors de la mise Ã  jour', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur de connexion', 'error');
    } finally {
        hideLoading();
    }
});

// ===== GESTION DES DOCUMENTS =====

function openUploadModal() {
    document.getElementById('uploadModal').style.display = 'flex';
    document.getElementById('documentName').focus();
    // S'assurer que FILE est sÃ©lectionnÃ© par dÃ©faut
    document.querySelector('input[name="type"][value="FILE"]').checked = true;
    toggleDocumentType();
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
    document.getElementById('uploadForm').reset();
    // Remettre FILE par dÃ©faut
    document.querySelector('input[name="type"][value="FILE"]').checked = true;
    toggleDocumentType();
}

function toggleDocumentType() {
    const type = document.querySelector('input[name="type"]:checked').value;
    const fileSection = document.getElementById('fileSection');
    const linkSection = document.getElementById('linkSection');

    if (type === 'FILE') {
        fileSection.style.display = 'block';
        linkSection.style.display = 'none';
    } else {
        fileSection.style.display = 'none';
        linkSection.style.display = 'block';
    }
}

// Fermer le modal en cliquant Ã  l'extÃ©rieur
document.getElementById('uploadModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('uploadModal')) {
        closeUploadModal();
    }
});

// Upload de document
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const type = formData.get('type');
    const nom = formData.get('nom');

    if (!nom || nom.trim().length === 0) {
        showAlert('Le nom du document est requis', 'error');
        return;
    }

    if (type === 'FILE') {
        const file = formData.get('document');

        if (!file || file.size === 0) {
            showAlert('Veuillez sÃ©lectionner un fichier PDF', 'error');
            return;
        }

        if (file.type !== 'application/pdf') {
            showAlert('Seuls les fichiers PDF sont acceptÃ©s', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            showAlert('Le fichier ne peut pas dÃ©passer 10MB', 'error');
            return;
        }
    } else if (type === 'LINK') {
        const lienExterne = formData.get('lienExterne');

        if (!lienExterne || lienExterne.trim().length === 0) {
            showAlert('Le lien externe est requis', 'error');
            return;
        }

        // VÃ©rification basique de l'URL
        try {
            new URL(lienExterne);
        } catch (e) {
            showAlert('Veuillez saisir une URL valide (ex: https://exemple.com)', 'error');
            return;
        }
    }

    try {
        showLoading('Ajout en cours...');

        const response = await fetch('/inscription-management/admin/documents', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Document ajoutÃ© avec succÃ¨s', 'success');
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
    if (!confirm(`ÃŠtes-vous sÃ»r de vouloir supprimer le document "${nom}" ?\n\nCette action est irrÃ©versible.`)) {
        return;
    }

    try {
        showLoading('Suppression en cours...');

        const response = await fetch(`/inscription-management/admin/documents/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Document supprimÃ© avec succÃ¨s', 'success');
            // Supprimer l'Ã©lÃ©ment du DOM
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

// DÃ©placement de document (ordre)
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

    if (!targetElement) return; // DÃ©jÃ  en premiÃ¨re/derniÃ¨re position

    // Ã‰changer les positions dans le DOM
    if (direction === 'up') {
        container.insertBefore(currentElement, targetElement);
    } else {
        container.insertBefore(targetElement, currentElement);
    }

    // RÃ©cupÃ©rer le nouvel ordre et l'envoyer au serveur
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
            showAlert('Erreur lors de la rÃ©organisation', 'error');
            // Recharger la page en cas d'erreur
            window.location.reload();
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur lors de la rÃ©organisation', 'error');
        window.location.reload();
    }
}

// ===== FONCTIONS UTILITAIRES =====

function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} mb-4 animate-fade-in`;

    const icon = type === 'success' ? 'âœ…' : type === 'error' ? 'âŒ' : 'â„¹ï¸';
    alertDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${icon} ${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="text-lg">&times;</button>
        </div>
    `;

    container.appendChild(alertDiv);

    // Auto-suppression aprÃ¨s 5 secondes
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

// ===== Ã‰VÃ‰NEMENTS GLOBAUX =====

// Gestion des raccourcis clavier
document.addEventListener('keydown', (e) => {
    // Ã‰chap pour fermer les modals
    if (e.key === 'Escape') {
        closeUploadModal();
    }
});

// PrÃ©visualisation du fichier sÃ©lectionnÃ©
document.getElementById('documentFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const size = (file.size / 1024 / 1024).toFixed(2);
        console.log(`Fichier sÃ©lectionnÃ©: ${file.name} (${size} MB)`);

        if (file.size > 10 * 1024 * 1024) {
            showAlert('Attention: le fichier dÃ©passe 10MB', 'warning');
        }
    }
});

// Gestion du changement de type de document
document.addEventListener('change', (e) => {
    if (e.target.name === 'type') {
        toggleDocumentType();
    }
});

console.log('âœ… Interface de gestion des inscriptions chargÃ©e');

