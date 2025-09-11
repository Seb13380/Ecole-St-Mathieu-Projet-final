/**
 * Script de test pour la demande d'identifiants
 */

const axios = require('axios');

async function testCredentialsRequest() {
    try {
        console.log('🔍 Test de demande d\'identifiants...\n');

        // Données de test avec un parent existant
        const testData = {
            email: 'sgdigitalweb13@gmail.com', // Parent existant
            firstName: 'Sébastien',
            lastName: 'GIORDANO',
            phone: '0123456789'
        };

        console.log('📋 Données de test:');
        console.log(`   Email: ${testData.email}`);
        console.log(`   Nom: ${testData.firstName} ${testData.lastName}`);
        console.log(`   Téléphone: ${testData.phone}\n`);

        console.log('📤 Envoi de la demande...');

        const response = await axios.post('http://localhost:3007/demande-identifiants', testData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            maxRedirects: 0,
            validateStatus: function (status) {
                return status < 400; // Accepter les redirections
            }
        });

        console.log(`✅ Réponse: ${response.status}`);
        
        if (response.status === 302) {
            console.log('🔄 Redirection vers:', response.headers.location);
            
            if (response.headers.location.includes('message=')) {
                const message = decodeURIComponent(response.headers.location.split('message=')[1]);
                console.log('💬 Message:', message);
            }
        }

        console.log('\n✅ Test terminé avec succès!');

    } catch (error) {
        if (error.response?.status === 302) {
            console.log('🔄 Redirection vers:', error.response.headers.location);
            
            if (error.response.headers.location.includes('message=')) {
                const message = decodeURIComponent(error.response.headers.location.split('message=')[1]);
                console.log('💬 Message:', message);
            }
            console.log('\n✅ Test terminé avec succès!');
        } else {
            console.error('❌ Erreur lors du test:', error.message);
        }
    }
}

testCredentialsRequest();
