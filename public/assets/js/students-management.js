// Gestion des Élèves - JavaScript

let currentStudentId = null;
let isEditMode = false;

// Ouvrir le modal de création
function openCreateModal() {
    resetForm();
    isEditMode = false;
    currentStudentId = null;

    document.getElementById('modalTitle').textContent = 'Ajouter un Élève';
    document.getElementById('submitText').textContent = 'Créer l\'Élève';

    document.getElementById('studentModal').style.display = 'flex';
    document.getElementById('firstName').focus();
}

// Ouvrir le modal d'édition
function editStudent(id, firstName, lastName, birthDate, parentId, classeId) {
    resetForm();
    isEditMode = true;
    currentStudentId = id;

    document.getElementById('modalTitle').textContent = 'Modifier l\'Élève';
    document.getElementById('submitText').textContent = 'Mettre à jour';

    // Remplir le formulaire
    document.getElementById('studentId').value = id;
    document.getElementById('firstName').value = firstName;
    document.getElementById('lastName').value = lastName;
    document.getElementById('birthDate').value = birthDate;
    document.getElementById('parentId').value = parentId;
    document.getElementById('classeId').value = classeId || '';

    document.getElementById('studentModal').style.display = 'flex';
    document.getElementById('firstName').focus();
}

// Fermer le modal
function closeModal() {
    document.getElementById('studentModal').style.display = 'none';
    resetForm();
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    currentStudentId = null;
    isEditMode = false;
}

// Supprimer un élève
async function deleteStudent(id, name) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'élève "${name}" ?\n\nCette action est irréversible.`)) {
        return;
    }

    try {
        const response = await fetch(`/user-management/students/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            // Supprimer la ligne du tableau
            const row = document.getElementById(`student-${id}`);
            if (row) {
                row.remove();
            }

            showSuccessMessage('Élève supprimé avec succès');

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
document.getElementById('studentForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        birthDate: formData.get('birthDate'),
        parentId: parseInt(formData.get('parentId')),
        classeId: formData.get('classeId') ? parseInt(formData.get('classeId')) : null
    };

    try {
        const url = isEditMode ? `/user-management/students/${currentStudentId}` : '/user-management/students';
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
document.getElementById('studentModal').addEventListener('click', function (e) {
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

// Fonction de recherche/filtrage des élèves
function filterStudents() {
    const searchTerm = document.getElementById('searchStudents').value.toLowerCase();
    const tableRows = document.querySelectorAll('tbody tr');
    let visibleCount = 0;

    tableRows.forEach(row => {
        const studentName = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const parentName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const className = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        if (studentName.includes(searchTerm) || parentName.includes(searchTerm) || className.includes(searchTerm)) {
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
            countElement.textContent = `Élèves inscrits (${totalCount})`;
        } else {
            countElement.textContent = `Élèves inscrits (${visibleCount}/${totalCount})`;
        }
    }
}
