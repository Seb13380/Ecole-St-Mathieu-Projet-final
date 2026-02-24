// Variables globales
let currentEventId = null;
let isEditMode = false;

// Fonctions principales
function openCreateModal() {
    isEditMode = false;
    currentEventId = null;
    document.getElementById('modalTitle').textContent = 'Nouvel événement';
    document.getElementById('submitText').textContent = 'Créer l\'événement';

    // Réinitialiser le formulaire
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    document.getElementById('visible').checked = true;
    document.getElementById('couleur').value = '#3b82f6';

    document.getElementById('eventModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('eventModal').classList.add('hidden');
    currentEventId = null;
    isEditMode = false;
}

function editEvent(eventId) {
    isEditMode = true;
    currentEventId = eventId;
    document.getElementById('modalTitle').textContent = 'Modifier l\'événement';
    document.getElementById('submitText').textContent = 'Modifier l\'événement';

    document.getElementById('eventId').value = eventId;

    // Récupérer les données de l'événement via API
    fetchEventData(eventId);

    document.getElementById('eventModal').classList.remove('hidden');
}

async function fetchEventData(eventId) {
    try {
        console.log('Récupération des données pour l\'événement ID:', eventId);
        const response = await fetch(`/agenda/events/${eventId}`);
        console.log('Réponse reçue:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Données reçues:', result);

        if (result.success && result.event) {
            const event = result.event;

            // Pré-remplir le formulaire avec les données existantes
            document.getElementById('titre').value = event.titre || '';
            document.getElementById('description').value = event.description || '';
            document.getElementById('dateDebut').value = event.dateDebut || '';
            document.getElementById('dateFin').value = event.dateFin || '';
            document.getElementById('heureDebut').value = event.heureDebut || '';
            document.getElementById('heureFin').value = event.heureFin || '';
            document.getElementById('lieu').value = event.lieu || '';
            document.getElementById('couleur').value = event.couleur || '#3b82f6';
            document.getElementById('important').checked = event.important || false;
            document.getElementById('visible').checked = event.visible !== false;

            console.log('Formulaire pré-rempli avec succès');

        } else {
            console.error('Erreur dans la réponse:', result);
            showNotification('Erreur lors du chargement des données de l\'événement: ' + (result.message || 'Réponse invalide'), 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        showNotification('Erreur lors du chargement des données: ' + error.message, 'error');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        return;
    }

    try {
        const response = await fetch(`/agenda/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Événement supprimé avec succès', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showNotification(result.message || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression de l\'événement', 'error');
    }
}

async function toggleVisibility(eventId) {
    try {
        const response = await fetch(`/agenda/events/${eventId}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showNotification(result.message || 'Erreur lors du changement de visibilité', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du changement de visibilité', 'error');
    }
}

function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    // Créer la nouvelle notification
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
        type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
            'bg-blue-100 border border-blue-400 text-blue-700'
        }`;

    notification.innerHTML = `
        <div class="flex justify-between items-center">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Gestion du formulaire
document.getElementById('eventForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const eventData = {
        titre: formData.get('titre'),
        description: formData.get('description'),
        dateDebut: formData.get('dateDebut'),
        dateFin: formData.get('dateFin'),
        heureDebut: formData.get('heureDebut'),
        heureFin: formData.get('heureFin'),
        lieu: formData.get('lieu'),
        couleur: formData.get('couleur'),
        important: formData.has('important'),
        visible: formData.has('visible')
    };

    try {
        const url = isEditMode ? `/agenda/events/${currentEventId}` : '/agenda/events';
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
            closeModal();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showNotification(result.message || 'Erreur lors de l\'opération', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de l\'opération', 'error');
    }
});

// Fermer la modal en cliquant à l'extérieur
document.getElementById('eventModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});

// Validation des dates
document.getElementById('dateDebut').addEventListener('change', function () {
    const dateDebut = this.value;
    const dateFin = document.getElementById('dateFin');

    if (dateDebut && dateFin.value && dateFin.value < dateDebut) {
        dateFin.value = dateDebut;
    }

    dateFin.min = dateDebut;
});

document.getElementById('dateFin').addEventListener('change', function () {
    const dateDebut = document.getElementById('dateDebut').value;
    const dateFin = this.value;

    if (dateDebut && dateFin && dateFin < dateDebut) {
        this.value = dateDebut;
        showNotification('La date de fin ne peut pas être antérieure à la date de début', 'error');
    }
});

// Validation des heures
document.getElementById('heureDebut').addEventListener('change', function () {
    validateTimeRange();
});

document.getElementById('heureFin').addEventListener('change', function () {
    validateTimeRange();
});

function validateTimeRange() {
    const heureDebut = document.getElementById('heureDebut').value;
    const heureFin = document.getElementById('heureFin').value;
    const dateDebut = document.getElementById('dateDebut').value;
    const dateFin = document.getElementById('dateFin').value;

    // Si c'est le même jour et que les heures sont renseignées
    if (heureDebut && heureFin && dateDebut && (!dateFin || dateFin === dateDebut)) {
        if (heureFin <= heureDebut) {
            document.getElementById('heureFin').value = '';
            showNotification('L\'heure de fin doit être postérieure à l\'heure de début', 'error');
        }
    }
}

// Supprimer les messages après quelques secondes
document.addEventListener('DOMContentLoaded', function () {
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');

    if (successMsg) {
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);
    }

    if (errorMsg) {
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 5000);
    }
});
