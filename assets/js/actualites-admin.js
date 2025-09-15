// Gestion des actualités - Administration

function editActualite(id, titre, contenu, important, visible, lienUrl, lienTexte, publicActualite = false) {
    // Afficher le modal d'édition
    document.getElementById('editModal').classList.remove('hidden');

    // Remplir le formulaire avec les données
    document.getElementById('editTitre').value = titre;
    document.getElementById('editContenu').value = contenu;
    document.getElementById('editImportant').checked = important == 1;
    document.getElementById('editVisible').checked = visible == 1;
    document.getElementById('editLienUrl').value = lienUrl || '';
    document.getElementById('editLienTexte').value = lienTexte || '';

    // Gérer la visibilité publique/privée
    if (publicActualite) {
        document.getElementById('editPublicTrue').checked = true;
        document.getElementById('editPublicFalse').checked = false;
    } else {
        document.getElementById('editPublicTrue').checked = false;
        document.getElementById('editPublicFalse').checked = true;
    }

    // Définir l'action du formulaire
    document.getElementById('editForm').action = `/actualites/${id}`;
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

function openDeleteModal(id, titre) {
    document.getElementById('deleteModal').classList.remove('hidden');
    document.getElementById('actualiteTitle').textContent = titre;
    document.getElementById('deleteForm').action = `/actualites/${id}`;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

function showErrorModal(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').classList.remove('hidden');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.add('hidden');
}

function showSuccessModal(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').classList.remove('hidden');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
}