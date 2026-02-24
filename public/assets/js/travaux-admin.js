// Gestion des travaux avec modales personnalisées
console.log('🔨 JavaScript travaux-admin.js chargé');

// Fonction pour éditer un travail
function editTravaux(id, titre, description, dateDebut, dateFin, progression, statut, important, visible) {
    console.log('✏️ Édition travail:', { id, titre, description, dateDebut, dateFin, progression, statut, important, visible });

    try {
        document.getElementById('editTitre').value = titre || '';
        document.getElementById('editDescription').value = description || '';
        document.getElementById('editDateDebut').value = dateDebut || '';
        document.getElementById('editDateFin').value = dateFin || '';
        document.getElementById('editProgression').value = progression || 0;
        document.getElementById('editStatut').value = statut || 'EN_COURS';
        document.getElementById('editImportant').checked = important === 1 || important === true;
        document.getElementById('editVisible').checked = visible === 1 || visible === true;
        document.getElementById('editForm').action = `/travaux/${id}`;
        document.getElementById('editModal').classList.remove('hidden');
    } catch (error) {
        console.error('❌ Erreur lors de l\'édition:', error);
        showError('Erreur lors de l\'ouverture du formulaire d\'édition');
    }
}

// Fonction pour fermer la modal d'édition
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

// Fonction pour confirmer la suppression
function confirmDelete(travauxId, travauxTitle) {
    console.log('🗑️ Suppression travail:', { travauxId, travauxTitle });

    try {
        document.getElementById('travauxTitle').textContent = travauxTitle || 'Travail';
        document.getElementById('deleteForm').action = `/travaux/${travauxId}/delete`;
        document.getElementById('deleteModal').classList.remove('hidden');
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        showError('Erreur lors de l\'ouverture de la confirmation de suppression');
    }
}

// Fonction pour fermer la modal de suppression
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

// Fonction pour afficher les erreurs
function showError(message) {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');

    if (errorModal && errorMessage) {
        errorMessage.textContent = message;
        errorModal.classList.remove('hidden');
    } else {
        console.error('❌ Modal d\'erreur non trouvée, utilisation de alert:', message);
        alert(message);
    }
}

// Fonction pour fermer la modal d'erreur
function closeErrorModal() {
    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
        errorModal.classList.add('hidden');
    }
}

// Fonction pour afficher les succès
function showSuccess(message) {
    const successModal = document.getElementById('successModal');
    const successMessage = document.getElementById('successMessage');

    if (successModal && successMessage) {
        successMessage.textContent = message;
        successModal.classList.remove('hidden');
    } else {
        console.log('✅ Modal de succès non trouvée, utilisation de alert:', message);
        alert(message);
    }
}

// Fonction pour fermer la modal de succès
function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.add('hidden');
    }
}

// Event listeners pour fermer les modales en cliquant à l'extérieur
document.addEventListener('DOMContentLoaded', function () {
    // Modal d'édition
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeEditModal();
            }
        });
    }

    // Modal de suppression
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeDeleteModal();
            }
        });
    }

    // Modal d'erreur
    const errorModal = document.getElementById('errorModal');
    if (errorModal) {
        errorModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeErrorModal();
            }
        });
    }

    // Modal de succès
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeSuccessModal();
            }
        });
    }

    console.log('✅ Event listeners installés pour les modales');
});

console.log('✅ JavaScript travaux-admin.js chargé - Fonctions disponibles:', {
    editTravaux: typeof editTravaux,
    confirmDelete: typeof confirmDelete,
    showError: typeof showError,
    showSuccess: typeof showSuccess
});
