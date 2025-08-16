const axios = require('axios');
const path = require('path');

async function testAdminAccess() {
    try {
        console.log('🧪 Test d\'accès admin pour Lionel...\n');

        // Test de connexion
        console.log('1️⃣ Test de connexion...');
        const loginResponse = await axios.post('http://localhost:3007/auth/login', {
            email: 'lionel.camboulives@ecole-saint-mathieu.fr',
            password: 'Directeur2025!'
        }, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status < 400; // Accept redirects
            }
        });

        console.log('✅ Connexion OK');

        // Test d'accès à la page de gestion des actualités
        console.log('\n2️⃣ Test accès page gestion actualités...');
        const cookies = loginResponse.headers['set-cookie'];

        const managePage = await axios.get('http://localhost:3007/actualites/manage', {
            headers: {
                'Cookie': cookies ? cookies.join('; ') : ''
            },
            maxRedirects: 5
        });

        console.log('✅ Page de gestion accessible');
        console.log(`📄 Taille de la page: ${managePage.data.length} caractères`);

        // Vérification des boutons dans le HTML
        const html = managePage.data;
        const hasModifyButton = html.includes('editActualite') || html.includes('Modifier');
        const hasDeleteButton = html.includes('confirmDelete') || html.includes('Supprimer');
        const hasVisibilityToggle = html.includes('visible') && html.includes('checkbox');

        console.log('\n3️⃣ Analyse des boutons présents:');
        console.log(`🔧 Bouton Modifier: ${hasModifyButton ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`🗑️ Bouton Supprimer: ${hasDeleteButton ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`👁️ Case Visible: ${hasVisibilityToggle ? '✅ Présent' : '❌ Manquant'}`);

        console.log('\n🎯 URLs à utiliser:');
        console.log('📰 Gestion Actualités: http://localhost:3007/actualites/manage');
        console.log('🏗️ Gestion Travaux: http://localhost:3007/travaux/manage');
        console.log('🏠 Dashboard: http://localhost:3007/directeur/dashboard');
        console.log('🔑 Login: http://localhost:3007/auth/login');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`URL: ${error.config.url}`);
        }
    }
}

testAdminAccess();
