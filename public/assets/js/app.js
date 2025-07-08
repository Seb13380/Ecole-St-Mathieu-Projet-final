document.addEventListener('DOMContentLoaded', function () {

    // Auto-dismiss seulement pour les alerts de notification (avec classe 'alert-success', 'alert-error', etc.)
    // Exclut les alerts permanentes comme 'alert-info' qui doivent rester affichées
    const dismissibleAlerts = document.querySelectorAll('.alert.alert-success, .alert.alert-error, .alert.alert-warning:not(.permanent)');
    dismissibleAlerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 5000);
    }); const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
        button.dataset.originalText = button.innerHTML;

        const form = button.closest('form');
        if (form) {
            form.addEventListener('submit', function (event) {
                button.disabled = true;
                button.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Traitement...';

                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = button.dataset.originalText || 'Envoyer';
                }, 10000);
            });
        }
    });

});
