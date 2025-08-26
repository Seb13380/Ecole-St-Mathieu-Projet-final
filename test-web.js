// Test de l'interface web avec puppeteer-like simulation
const axios = require('axios');

async function testWebInterface() {
    try {
        console.log('🌐 Test de l\'interface web...\n');

        const baseUrl = 'http://localhost:3007';

        // Test 1: Page de connexion
        console.log('1️⃣ Test de la page de connexion...');
        try {
            const loginResponse = await axios.get(`${baseUrl}/auth/login`);
            console.log(`✅ Page de connexion accessible (${loginResponse.status})`);
        } catch (error) {
            console.log(`❌ Page de connexion inaccessible: ${error.message}`);
        }

        // Test 2: Dashboard directeur (sans connexion)
        console.log('\n2️⃣ Test du dashboard sans connexion...');
        try {
            const dashboardResponse = await axios.get(`${baseUrl}/directeur/dashboard`);
            console.log(`✅ Dashboard accessible sans connexion (${dashboardResponse.status})`);
        } catch (error) {
            console.log(`❌ Dashboard protégé: ${error.response?.status || error.message}`);
        }

        // Test 3: Page d'accueil
        console.log('\n3️⃣ Test de la page d\'accueil...');
        try {
            const homeResponse = await axios.get(`${baseUrl}/`);
            console.log(`✅ Page d'accueil accessible (${homeResponse.status})`);
        } catch (error) {
            console.log(`❌ Page d'accueil inaccessible: ${error.message}`);
        }

        console.log('\n📋 INSTRUCTIONS POUR TESTER MANUELLEMENT:');
        console.log('==========================================');
        console.log('1. Ouvrir un navigateur');
        console.log('2. Aller sur: http://localhost:3007/auth/login');
        console.log('3. Se connecter avec:');
        console.log('   📧 Email: frank@stmathieu.org');
        console.log('   🔐 Mot de passe: Frank2025!');
        console.log('4. Après connexion, aller sur: http://localhost:3007/directeur/dashboard');
        console.log('5. Vérifier que le dashboard s\'affiche correctement');

    } catch (error) {
        console.error('❌ Erreur lors du test web:', error.message);
    }
}

testWebInterface();
