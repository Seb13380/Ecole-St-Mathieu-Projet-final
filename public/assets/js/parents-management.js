// Gestion des Parents - JavaScript

let currentParentId = null;
let isEditMode = false;

// Ouvrir le modal de création
function openCreateModal() {
    resetForm();
    isEditMode = false;
    currentParentId = null;

    document.getElementById('modalTitle').textContent = 'Ajouter un Parent';
    document.getElementById('submitText').textContent = 'Créer le Parent';
    document.getElementById('passwordLabel').innerHTML = 'Mot de passe * <span class="text-xs text-slate-500">(Défaut: Parent2025!)</span>';
    document.getElementById('password').required = true;

    document.getElementById('parentModal').classList.remove('hidden');
    document.getElementById('firstName').focus();
}

// Ouvrir le modal d'édition
function editParent(id, firstName, lastName, email, phone, adress) {
    resetForm();
    isEditMode = true;
    currentParentId = id;

    document.getElementById('modalTitle').textContent = 'Modifier le Parent';
    document.getElementById('submitText').textContent = 'Mettre à jour';
    document.getElementById('passwordLabel').innerHTML = 'Nouveau mot de passe <span class="text-xs text-slate-500">(Laisser vide pour ne pas changer)</span>';
    document.getElementById('password').required = false;

    // Remplir le formulaire
    document.getElementById('parentId').value = id;
    document.getElementById('firstName').value = firstName;
    document.getElementById('lastName').value = lastName;
    document.getElementById('email').value = email;
    document.getElementById('phone').value = phone || '';
    document.getElementById('adress').value = adress || '';

    document.getElementById('parentModal').classList.remove('hidden');
    document.getElementById('firstName').focus();
}

// Fermer le modal
function closeModal() {
    document.getElementById('parentModal').classList.add('hidden');
    resetForm();
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('parentForm').reset();
    document.getElementById('parentId').value = '';
    currentParentId = null;
    isEditMode = false;
}

// Supprimer un parent
async function deleteParent(id, name) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le parent "${name}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    try {
        const response = await fetch(`/user-management/parents/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            // Supprimer la ligne du tableau
            const row = document.getElementById(`parent-${id}`);
            if (row) {
                row.remove();
            }

            showSuccessMessage('Parent supprimé avec succès');

            // Recharger la page après un délai pour mettre à jour les compteurs
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showErrorMessage(result.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showErrorMessage('Erreur de communication avec le serveur');
    }
}

// Gestion du formulaire
document.getElementById('parentForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        adress: formData.get('adress'),
        password: formData.get('password')
    };

    try {
        const url = isEditMode ? `/user-management/parents/${currentParentId}` : '/user-management/parents';
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            closeModal();
            showSuccessMessage(result.message);

            // Recharger la page après un délai
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showErrorMessage(result.message || 'Une erreur est survenue');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showErrorMessage('Erreur de communication avec le serveur');
    }
});

// Fonctions utilitaires pour les messages
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            ${message}
        </div>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            ${message}
        </div>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Fermer le modal en cliquant à l'extérieur
document.getElementById('parentModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});

// Gestion de la touche Escape
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Fonction de recherche/filtrage des parents
function filterParents() {
    const searchTerm = document.getElementById('searchParents').value.toLowerCase();
    const tableRows = document.querySelectorAll('tbody tr');
    let visibleCount = 0;

    tableRows.forEach(row => {
        const parentName = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const parentContact = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        
        if (parentName.includes(searchTerm) || parentContact.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Mettre à jour le compteur
    const countElement = document.querySelector('h3');
    if (countElement) {
        const originalText = countElement.textContent;
        const totalCount = originalText.match(/\((\d+)\)/)[1];
        
        if (searchTerm === '') {
            countElement.textContent = `Parents inscrits (${totalCount})`;
        } else {
            countElement.textContent = `Parents inscrits (${visibleCount}/${totalCount})`;
        }
    }
}
