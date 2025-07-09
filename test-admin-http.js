const axios = require('axios');

async function testAdminLogin() {
    try {
        console.log('🚀 Test de connexion admin via HTTP...\n');

        const baseURL = 'http://localhost:3000';

        // Créer une instance axios avec gestion des cookies
        const client = axios.create({
            baseURL,
            timeout: 5000,
            validateStatus: function (status) {
                return status < 500; // Accepter tous les codes < 500
            }
        });

        // 1. Vérifier que le serveur répond
        console.log('📡 Test de connexion au serveur...');
        const homeResponse = await client.get('/');
        console.log(`✅ Serveur accessible - Status: ${homeResponse.status}`);

        // 2. Accéder à la page de login
        console.log('\n🔐 Accès à la page de login...');
        const loginPageResponse = await client.get('/auth/login');
        console.log(`✅ Page de login accessible - Status: ${loginPageResponse.status}`);

        // 3. Tenter la connexion admin
        console.log('\n👤 Test de connexion admin...');

        const loginData = {
            email: 'l.camboulives@orange.fr',
            password: 'AdminStMathieu2024!'
        };

        const loginResponse = await client.post('/auth/login', loginData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: new URLSearchParams(loginData).toString(),
            maxRedirects: 0 // Ne pas suivre les redirections automatiquement
        });

        console.log(`📊 Status de login: ${loginResponse.status}`);

        if (loginResponse.status === 302) {
            console.log('✅ Redirection détectée:', loginResponse.headers.location);

            if (loginResponse.headers.location === '/admin/dashboard') {
                console.log('🎉 Connexion admin réussie ! Redirection vers le dashboard.');
            } else {
                console.log('⚠️  Redirection inattendue:', loginResponse.headers.location);
            }
        } else if (loginResponse.status === 200) {
            console.log('⚠️  Pas de redirection - vérifier les logs du serveur');
        } else {
            console.log('❌ Erreur de connexion');
        }

        // 4. Test de la route de secours
        console.log('\n🔧 Test de la route de secours...');
        const testAdminResponse = await client.get('/auth/test-admin');
        console.log(`📊 Status route test-admin: ${testAdminResponse.status}`);

        if (testAdminResponse.status === 302) {
            console.log('✅ Route de secours fonctionnelle:', testAdminResponse.headers.location);
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Impossible de se connecter au serveur. Vérifiez qu\'il est démarré sur le port 3000.');
        } else {
            console.error('❌ Erreur lors du test:', error.message);
        }
    }
}

testAdminLogin();
