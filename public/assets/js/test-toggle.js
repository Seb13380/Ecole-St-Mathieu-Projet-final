// Test simple des boutons de document
async function testDocumentToggle() {
    try {
        console.log('🧪 Test manuel de toggle document...');

        // Test avec document ID 2
        const response = await fetch('/documents/admin/2/toggle', {
            method: 'POST',
            credentials: 'include'
        });

        console.log('📊 Status:', response.status);
        console.log('📄 Response URL:', response.url);

        if (response.redirected) {
            console.log('🔄 Redirected to:', response.url);
        }

        const text = await response.text();
        console.log('📝 Response preview:', text.substring(0, 200) + '...');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// Ajouter un bouton de test
const testButton = document.createElement('button');
testButton.textContent = '🧪 Test Toggle';
testButton.className = 'btn btn-warning btn-sm';
testButton.onclick = testDocumentToggle;

// L'ajouter à la page
document.body.appendChild(testButton);
