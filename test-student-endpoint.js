const axios = require('axios');

async function testStudentEndpoint() {
    try {
        console.log('🔍 Test de l\'endpoint de gestion des étudiants...\n');

        // Test 1: Accès sans session (devrait rediriger vers login)
        console.log('1. Test sans authentification:');
        try {
            const response = await axios.get('http://localhost:3007/user-management/students', {
                maxRedirects: 0 // Empêcher les redirections automatiques
            });
            console.log('   ❌ Aucune redirection détectée - problème d\'auth');
        } catch (error) {
            if (error.response && error.response.status === 302) {
                console.log('   ✅ Redirection détectée (302) - auth fonctionne');
            } else {
                console.log('   ⚠️  Erreur inattendue:', error.message);
            }
        }

        // Test 2: Vérifier que le serveur répond
        console.log('\n2. Test de disponibilité du serveur:');
        try {
            const response = await axios.get('http://localhost:3007/');
            console.log('   ✅ Serveur accessible, status:', response.status);
        } catch (error) {
            console.log('   ❌ Serveur inaccessible:', error.message);
            return;
        }

        console.log('\n✨ Tests terminés. Vérifiez que vous êtes bien connecté dans le navigateur.');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
    }
}

testStudentEndpoint();
