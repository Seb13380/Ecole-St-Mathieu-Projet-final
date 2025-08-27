const axios = require('axios');

async function testDirecteurInscriptions() {
    try {
        console.log('🔄 Test d\'accès à /directeur/inscriptions...');

        // Test sans authentification d'abord
        try {
            const response = await axios.get('http://localhost:3007/directeur/inscriptions', {
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status < 400; // Accept redirects
                }
            });

            console.log('📄 Réponse reçue:');
            console.log('   Status:', response.status);
            console.log('   Headers:', response.headers);
            console.log('   Data length:', response.data.length);

            if (response.data.includes('<!DOCTYPE html>')) {
                console.log('✅ Page HTML reçue');
                if (response.data.includes('login') || response.data.includes('connexion')) {
                    console.log('🔄 Redirection vers login détectée (normal sans auth)');
                } else if (response.data.includes('inscription')) {
                    console.log('✅ Page d\'inscription détectée');
                } else {
                    console.log('❓ Contenu HTML inconnu');
                }
            } else {
                console.log('❌ Pas de HTML reçu');
            }

        } catch (error) {
            if (error.response) {
                console.log('📄 Erreur HTTP:');
                console.log('   Status:', error.response.status);
                console.log('   Location:', error.response.headers.location);

                if (error.response.status === 302 && error.response.headers.location) {
                    console.log('🔄 Redirection vers:', error.response.headers.location);
                    if (error.response.headers.location.includes('login')) {
                        console.log('✅ Redirection normale vers login (pas connecté)');
                    }
                }
            } else {
                console.log('❌ Erreur réseau:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

testDirecteurInscriptions();
