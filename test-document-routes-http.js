const axios = require('axios');

async function testDocumentRoutes() {
    try {
        console.log('=== TEST DES ROUTES DE DOCUMENTS ===\n');

        const baseUrl = 'http://localhost:3007';

        // Créer une session
        const axiosInstance = axios.create({
            baseURL: baseUrl,
            withCredentials: true,
            jar: true
        });

        console.log('🔐 Test 1: Connexion en tant que Lionel...');

        // Tenter de se connecter
        try {
            const loginResponse = await axiosInstance.post('/login', {
                email: 'lionel.camboulives@ecole-st-mathieu.fr',
                password: 'Lionel2024!'
            });
            console.log('✅ Connexion réussie');
        } catch (error) {
            console.log('❌ Erreur de connexion:', error.response?.status, error.response?.statusText);
            return;
        }

        console.log('\n📋 Test 2: Accès à la gestion des documents...');

        // Tester l'accès à la gestion des documents
        try {
            const manageResponse = await axiosInstance.get('/documents/admin');
            console.log('✅ Accès à /documents/admin réussi');
            console.log('📄 Taille de la réponse:', manageResponse.data.length, 'caractères');
        } catch (error) {
            console.log('❌ Erreur d\'accès:', error.response?.status, error.response?.statusText);
        }

        console.log('\n🔄 Test 3: Test de publication/dépublication...');

        // Tester le toggle d'un document (POST)
        try {
            const toggleResponse = await axiosInstance.post('/documents/admin/1/toggle');
            console.log('✅ Toggle document réussi');
            console.log('🔄 Status:', toggleResponse.status);
        } catch (error) {
            console.log('❌ Erreur de toggle:', error.response?.status, error.response?.statusText);
            if (error.response?.data) {
                console.log('📄 Réponse:', error.response.data.slice(0, 200) + '...');
            }
        }

        console.log('\n🎯 Test terminé!');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

// Vérifier si axios est disponible
try {
    require('axios');
    testDocumentRoutes();
} catch (error) {
    console.log('❌ axios non installé. Installation...');
    console.log('Exécutez: npm install axios');
}
