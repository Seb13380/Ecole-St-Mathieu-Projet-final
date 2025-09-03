// Gestion des actualités - Interface d'administration
console.log('🚀 Script actualites-admin.js chargé');

// Fonctions utilitaires pour les modales d'erreur et de succès
window.showError = function (message) {
    try {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').classList.remove('hidden');
        console.log('❌ Modal d\'erreur affichée:', message);
    } catch (error) {
        console.error('❌ Erreur lors de l\'affichage du modal d\'erreur:', error);
        // Fallback vers alert si les modales ne fonctionnent pas
        alert('Erreur: ' + message);
    }
};

window.showSuccess = function (message) {
    try {
        document.getElementById('successMessage').textContent = message;
        document.getElementById('successModal').classList.remove('hidden');
        console.log('✅ Modal de succès affiché:', message);
    } catch (error) {
        console.error('❌ Erreur lors de l\'affichage du modal de succès:', error);
        // Fallback vers alert si les modales ne fonctionnent pas
        alert('Succès: ' + message);
    }
};

window.closeErrorModal = function () {
    try {
        document.getElementById('errorModal').classList.add('hidden');
        console.log('🔒 Modal d\'erreur fermé');
    } catch (error) {
        console.error('❌ Erreur lors de la fermeture du modal d\'erreur:', error);
    }
};

window.closeSuccessModal = function () {
    try {
        document.getElementById('successModal').classList.add('hidden');
        console.log('🔒 Modal de succès fermé');
    } catch (error) {
        console.error('❌ Erreur lors de la fermeture du modal de succès:', error);
    }
};

// Fonction de modification d'actualité
window.editActualite = function (id, titre, contenu, important, visible) {
    console.log('🔧 Fonction editActualite appelée:', {
        id: id,
        titre: titre,
        contenu: contenu,
        important: important,
        visible: visible
    });

    // Vérification des paramètres
    if (!id) {
        console.error('❌ ID manquant pour editActualite');
        showError('Impossible de modifier cette actualité : identifiant manquant.');
        return;
    }

    try {
        // Sécuriser les valeurs
        const safeId = parseInt(id) || 0;
        const safeTitre = String(titre || '');
        const safeContenu = String(contenu || '');
        const safeImportant = (important === true || important === 'true' || important === 1);
        const safeVisible = (visible === true || visible === 'true' || visible === 1);

        console.log('🔄 Valeurs sécurisées:', {
            safeId, safeTitre, safeContenu, safeImportant, safeVisible
        });

        // Remplir le formulaire
        document.getElementById('editTitre').value = safeTitre;
        document.getElementById('editContenu').value = safeContenu;
        document.getElementById('editImportant').checked = safeImportant;
        document.getElementById('editVisible').checked = safeVisible;
        document.getElementById('editForm').action = `/actualites/${safeId}`;

        // Ouvrir le modal
        document.getElementById('editModal').classList.remove('hidden');
        console.log('✅ Modal d\'édition ouverte avec succès');

    } catch (error) {
        console.error('❌ Erreur lors de l\'ouverture du modal d\'édition:', error);
        showError('Une erreur s\'est produite lors de l\'ouverture du formulaire de modification. Veuillez réessayer.');
    }
};

// Fonction de fermeture du modal d'édition
window.closeEditModal = function () {
    try {
        document.getElementById('editModal').classList.add('hidden');
        console.log('🔒 Modal d\'édition fermée');
    } catch (error) {
        console.error('❌ Erreur lors de la fermeture du modal:', error);
    }
};

// Fonction de confirmation de suppression
window.confirmDelete = function (actualiteId, actualiteTitle) {
    console.log('🗑️ Fonction confirmDelete appelée:', {
        actualiteId: actualiteId,
        actualiteTitle: actualiteTitle
    });

    // Vérification des paramètres
    if (!actualiteId) {
        console.error('❌ ID manquant pour confirmDelete');
        showError('Impossible de supprimer cette actualité : identifiant manquant.');
        return;
    }

    try {
        // Sécuriser les valeurs
        const safeId = parseInt(actualiteId) || 0;
        const safeTitle = String(actualiteTitle || 'cette actualité');

        console.log('🔄 Valeurs sécurisées:', { safeId, safeTitle });

        // Remplir le modal de confirmation
        document.getElementById('actualiteTitle').textContent = safeTitle;
        document.getElementById('deleteForm').action = `/actualites/${safeId}/delete`;

        // Ouvrir le modal
        document.getElementById('deleteModal').classList.remove('hidden');
        console.log('✅ Modal de suppression ouvert avec succès');

    } catch (error) {
        console.error('❌ Erreur lors de l\'ouverture du modal de suppression:', error);
        showError('Une erreur s\'est produite lors de l\'ouverture du formulaire de suppression. Veuillez réessayer.');
    }
};

// Fonction de fermeture du modal de suppression
window.closeDeleteModal = function () {
    try {
        document.getElementById('deleteModal').classList.add('hidden');
        console.log('🔒 Modal de suppression fermé');
    } catch (error) {
        console.error('❌ Erreur lors de la fermeture du modal:', error);
    }
};

// Initialisation une fois le DOM chargé
document.addEventListener('DOMContentLoaded', function () {
    console.log('📋 Initialisation des gestionnaires d\'événements...');

    try {
        // Fermer les modals en cliquant à l'extérieur
        const editModal = document.getElementById('editModal');
        const deleteModal = document.getElementById('deleteModal');
        const errorModal = document.getElementById('errorModal');
        const successModal = document.getElementById('successModal');

        if (editModal) {
            editModal.addEventListener('click', function (e) {
                if (e.target === this) {
                    closeEditModal();
                }
            });
            console.log('✅ Gestionnaire de clic pour editModal ajouté');
        } else {
            console.warn('⚠️ Element editModal non trouvé');
        }

        if (deleteModal) {
            deleteModal.addEventListener('click', function (e) {
                if (e.target === this) {
                    closeDeleteModal();
                }
            });
            console.log('✅ Gestionnaire de clic pour deleteModal ajouté');
        } else {
            console.warn('⚠️ Element deleteModal non trouvé');
        }

        if (errorModal) {
            errorModal.addEventListener('click', function (e) {
                if (e.target === this) {
                    closeErrorModal();
                }
            });
            console.log('✅ Gestionnaire de clic pour errorModal ajouté');
        } else {
            console.warn('⚠️ Element errorModal non trouvé');
        }

        if (successModal) {
            successModal.addEventListener('click', function (e) {
                if (e.target === this) {
                    closeSuccessModal();
                }
            });
            console.log('✅ Gestionnaire de clic pour successModal ajouté');
        } else {
            console.warn('⚠️ Element successModal non trouvé');
        }

        // Auto-remplir la date avec aujourd'hui
        const dateField = document.getElementById('datePublication');
        if (dateField) {
            const today = new Date().toISOString().split('T')[0];
            dateField.value = today;
            console.log('📅 Date du jour définie:', today);
        }

        // Test de présence des éléments
        console.log('🧪 Tests des éléments DOM:');
        console.log('editModal:', editModal ? '✅' : '❌');
        console.log('deleteModal:', deleteModal ? '✅' : '❌');
        console.log('errorModal:', errorModal ? '✅' : '❌');
        console.log('successModal:', successModal ? '✅' : '❌');
        console.log('editForm:', document.getElementById('editForm') ? '✅' : '❌');
        console.log('deleteForm:', document.getElementById('deleteForm') ? '✅' : '❌');

        console.log('✅ Initialisation terminée avec succès');

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
});

// Test des fonctions disponibles
console.log('🧪 Fonctions disponibles:', {
    editActualite: typeof window.editActualite,
    confirmDelete: typeof window.confirmDelete,
    closeEditModal: typeof window.closeEditModal,
    closeDeleteModal: typeof window.closeDeleteModal,
    showError: typeof window.showError,
    showSuccess: typeof window.showSuccess,
    closeErrorModal: typeof window.closeErrorModal,
    closeSuccessModal: typeof window.closeSuccessModal
});
