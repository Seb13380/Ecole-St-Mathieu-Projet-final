console.log('🧪 DIAGNOSTIC: Page chargée');
console.log('🧪 DIAGNOSTIC: editActualite fonction =', typeof editActualite);
console.log('🧪 DIAGNOSTIC: confirmDelete fonction =', typeof confirmDelete);

// Test si les éléments existent
const modal1 = document.getElementById('editModal');
const modal2 = document.getElementById('deleteModal');
console.log('🧪 DIAGNOSTIC: editModal existe =', !!modal1);
console.log('🧪 DIAGNOSTIC: deleteModal existe =', !!modal2);

// Compte des boutons
const editButtons = document.querySelectorAll('[onclick*="editActualite"]');
const deleteButtons = document.querySelectorAll('[onclick*="confirmDelete"]');
console.log('🧪 DIAGNOSTIC: Boutons Modifier trouvés =', editButtons.length);
console.log('🧪 DIAGNOSTIC: Boutons Supprimer trouvés =', deleteButtons.length);

if (editButtons.length > 0) {
    console.log('🧪 DIAGNOSTIC: Premier bouton Modifier onclick =', editButtons[0].getAttribute('onclick'));
}
