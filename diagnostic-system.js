// Test de diagnostic pour vérifier le système
const axios = require('axios');

async function testSystemDiagnostics() {
    console.log('🔍 Diagnostic du système...\n');

    const tests = [
        { name: 'Page d\'accueil', url: 'http://localhost:3007' },
        { name: 'Page parents', url: 'http://localhost:3007/user-management/parents' },
        { name: 'Rendez-vous inscriptions', url: 'http://localhost:3007/directeur/rendez-vous-inscriptions' },
        { name: 'Menu API (si existe)', url: 'http://localhost:3007/api/menus' }
    ];

    for (const test of tests) {
        try {
            console.log(`🧪 Test: ${test.name}`);
            const response = await axios.get(test.url, {
                timeout: 5000,
                validateStatus: function (status) {
                    return status < 500; // Accepter tous les codes < 500
                }
            });
            
            if (response.status === 200) {
                console.log(`   ✅ OK (${response.status})`);
            } else {
                console.log(`   ⚠️  Status: ${response.status}`);
            }
        } catch (error) {
            if (error.response) {
                console.log(`   ❌ Erreur ${error.response.status}: ${error.response.statusText}`);
                if (error.response.status === 500) {
                    console.log(`      Erreur serveur détectée sur: ${test.url}`);
                }
            } else {
                console.log(`   ❌ Erreur réseau: ${error.message}`);
            }
        }
    }

    // Test spécifique des routes de directeur
    console.log('\n🎯 Test routes directeur:');
    const directeurRoutes = [
        '/directeur',
        '/directeur/users',
        '/directeur/classes',
        '/directeur/inscriptions'
    ];

    for (const route of directeurRoutes) {
        try {
            const response = await axios.get(`http://localhost:3007${route}`, {
                timeout: 5000,
                validateStatus: function (status) {
                    return status < 500;
                }
            });
            console.log(`   ${route}: ${response.status === 200 ? '✅' : '⚠️'} ${response.status}`);
        } catch (error) {
            if (error.response) {
                console.log(`   ${route}: ❌ ${error.response.status}`);
            } else {
                console.log(`   ${route}: ❌ ${error.message}`);
            }
        }
    }
}

testSystemDiagnostics()
    .then(() => {
        console.log('\n🏁 Diagnostic terminé');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });