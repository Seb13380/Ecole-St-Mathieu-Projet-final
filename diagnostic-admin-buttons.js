const axios = require('axios');

async function diagnosticAdmin() {
    try {
        console.log('🧪 Diagnostic complet des boutons admin...\n');

        // 1. Test de connexion
        console.log('1️⃣ Test de connexion...');
        const loginResponse = await axios.post('http://localhost:3007/auth/login', {
            email: 'lionel.camboulives@ecole-saint-mathieu.fr',
            password: 'Directeur2025!'
        }, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status < 400;
            }
        });

        const cookies = loginResponse.headers['set-cookie'];
        console.log('✅ Connexion OK');

        // 2. Test d'accès à la page de gestion
        console.log('\n2️⃣ Test accès page gestion...');
        const managePage = await axios.get('http://localhost:3007/actualites/manage', {
            headers: {
                'Cookie': cookies ? cookies.join('; ') : ''
            },
            maxRedirects: 5
        });

        console.log('✅ Page accessible');

        // 3. Test du toggle-visibility avec POST simple
        console.log('\n3️⃣ Test toggle-visibility...');
        try {
            const toggleResponse = await axios.post('http://localhost:3007/actualites/7/toggle-visibility', {}, {
                headers: {
                    'Cookie': cookies ? cookies.join('; ') : '',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                maxRedirects: 5
            });
            console.log('✅ Toggle visibility fonctionne');
        } catch (toggleError) {
            console.log('❌ Erreur toggle:', toggleError.message);
            console.log('Status:', toggleError.response?.status);
        }

        // 4. Analyse du JavaScript dans la page
        const html = managePage.data;
        const hasEditFunction = html.includes('function editActualite');
        const hasDeleteFunction = html.includes('function confirmDelete');
        const hasModals = html.includes('editModal') && html.includes('deleteModal');

        console.log('\n4️⃣ Analyse du JavaScript:');
        console.log(`🔧 Fonction editActualite: ${hasEditFunction ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`🗑️ Fonction confirmDelete: ${hasDeleteFunction ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`📱 Modals présents: ${hasModals ? '✅ Présent' : '❌ Manquant'}`);

        console.log('\n🎯 Solutions si problèmes:');
        console.log('1. Vider cache navigateur: Ctrl+Shift+R');
        console.log('2. Vérifier console développeur (F12)');
        console.log('3. Tester en navigation privée');
        console.log('4. URL à utiliser: http://localhost:3007/actualites/manage');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`URL: ${error.config.url}`);
        }
    }
}

diagnosticAdmin();
