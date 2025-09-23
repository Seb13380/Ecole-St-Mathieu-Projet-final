// Système de modales global pour remplacer les alerts
class ModalSystem {
    constructor() {
        this.createModalHTML();
    }

    createModalHTML() {
        // Vérifier si la modal existe déjà
        if (document.getElementById('global-modal')) return;

        const modalHTML = `
            <!-- Modal globale réutilisable -->
            <div id="global-modal" class="modal">
                <div class="modal-box relative">
                    <!-- Bouton fermer -->
                    <button id="modal-close" class="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
                    
                    <!-- Icône -->
                    <div id="modal-icon" class="flex justify-center mb-4">
                        <!-- L'icône sera insérée ici dynamiquement -->
                    </div>
                    
                    <!-- Titre -->
                    <h3 id="modal-title" class="font-bold text-lg mb-4 text-center"></h3>
                    
                    <!-- Message -->
                    <p id="modal-message" class="text-sm text-gray-600 mb-6 text-center"></p>
                    
                    <!-- Boutons d'action -->
                    <div id="modal-actions" class="modal-action justify-center">
                        <!-- Les boutons seront insérés ici dynamiquement -->
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Ajouter les événements
        this.setupEventListeners();
    }

    setupEventListeners() {
        const modal = document.getElementById('global-modal');
        const closeBtn = document.getElementById('modal-close');

        closeBtn.addEventListener('click', () => this.hideModal());
        
        // Fermer au clic sur l'overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });

        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('modal-open')) {
                this.hideModal();
            }
        });
    }

    showModal() {
        const modal = document.getElementById('global-modal');
        modal.classList.add('modal-open');
    }

    hideModal() {
        const modal = document.getElementById('global-modal');
        modal.classList.remove('modal-open');
    }

    // Alerte simple (remplace alert())
    alert(message, title = 'Information') {
        this.showAlert(message, title, 'info');
    }

    // Alerte d'erreur
    error(message, title = 'Erreur') {
        this.showAlert(message, title, 'error');
    }

    // Alerte de succès
    success(message, title = 'Succès') {
        this.showAlert(message, title, 'success');
    }

    // Alerte d'avertissement
    warning(message, title = 'Attention') {
        this.showAlert(message, title, 'warning');
    }

    showAlert(message, title, type) {
        const iconContainer = document.getElementById('modal-icon');
        const titleElement = document.getElementById('modal-title');
        const messageElement = document.getElementById('modal-message');
        const actionsContainer = document.getElementById('modal-actions');

        // Définir l'icône et les couleurs selon le type
        let icon, titleClass;
        switch (type) {
            case 'success':
                icon = '<div class="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>';
                titleClass = 'text-green-800';
                break;
            case 'error':
                icon = '<div class="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>';
                titleClass = 'text-red-800';
                break;
            case 'warning':
                icon = '<div class="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg></div>';
                titleClass = 'text-yellow-800';
                break;
            default: // info
                icon = '<div class="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';
                titleClass = 'text-blue-800';
        }

        // Mettre à jour le contenu
        iconContainer.innerHTML = icon;
        titleElement.textContent = title;
        titleElement.className = `font-bold text-lg mb-4 text-center ${titleClass}`;
        messageElement.textContent = message;
        
        // Bouton OK uniquement
        actionsContainer.innerHTML = `
            <button class="btn btn-primary" onclick="modalSystem.hideModal()">OK</button>
        `;

        this.showModal();
    }

    // Confirmation (remplace confirm())
    confirm(message, title = 'Confirmation') {
        return new Promise((resolve) => {
            const iconContainer = document.getElementById('modal-icon');
            const titleElement = document.getElementById('modal-title');
            const messageElement = document.getElementById('modal-message');
            const actionsContainer = document.getElementById('modal-actions');

            // Icône de question
            const icon = '<div class="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';

            iconContainer.innerHTML = icon;
            titleElement.textContent = title;
            titleElement.className = 'font-bold text-lg mb-4 text-center text-blue-800';
            messageElement.textContent = message;
            
            // Boutons Oui/Non
            actionsContainer.innerHTML = `
                <button class="btn btn-outline mr-2" onclick="modalSystem.resolveConfirm(false)">Annuler</button>
                <button class="btn btn-primary" onclick="modalSystem.resolveConfirm(true)">Confirmer</button>
            `;

            this.confirmResolve = resolve;
            this.showModal();
        });
    }

    resolveConfirm(result) {
        this.hideModal();
        if (this.confirmResolve) {
            this.confirmResolve(result);
            this.confirmResolve = null;
        }
    }

    // Prompt (remplace prompt())
    prompt(message, title = 'Saisie', defaultValue = '') {
        return new Promise((resolve) => {
            const iconContainer = document.getElementById('modal-icon');
            const titleElement = document.getElementById('modal-title');
            const messageElement = document.getElementById('modal-message');
            const actionsContainer = document.getElementById('modal-actions');

            // Icône de saisie
            const icon = '<div class="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></div>';

            iconContainer.innerHTML = icon;
            titleElement.textContent = title;
            titleElement.className = 'font-bold text-lg mb-4 text-center text-gray-800';
            messageElement.innerHTML = `
                <p class="text-sm text-gray-600 mb-4">${message}</p>
                <input type="text" id="prompt-input" class="input input-bordered w-full" value="${defaultValue}" placeholder="Votre réponse...">
            `;
            
            actionsContainer.innerHTML = `
                <button class="btn btn-outline mr-2" onclick="modalSystem.resolvePrompt(null)">Annuler</button>
                <button class="btn btn-primary" onclick="modalSystem.resolvePrompt(document.getElementById('prompt-input').value)">Valider</button>
            `;

            this.promptResolve = resolve;
            this.showModal();

            // Focus sur l'input
            setTimeout(() => {
                const input = document.getElementById('prompt-input');
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        });
    }

    resolvePrompt(result) {
        this.hideModal();
        if (this.promptResolve) {
            this.promptResolve(result);
            this.promptResolve = null;
        }
    }
}

// Initialiser le système de modales globalement
const modalSystem = new ModalSystem();

// Remplacer les fonctions natives par nos modales
window.customAlert = modalSystem.alert.bind(modalSystem);
window.customConfirm = modalSystem.confirm.bind(modalSystem);
window.customPrompt = modalSystem.prompt.bind(modalSystem);