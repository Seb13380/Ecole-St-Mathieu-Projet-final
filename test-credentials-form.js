/**
 * Test de demande d'identifiants via formulaire web
 */

const axios = require('axios');
const qs = require('querystring');

async function testCredentialsForm() {
    try {
        console.log('🔍 Test demande d\'identifiants via formulaire...\n');

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

        const response = await axios.post('http://localhost:3007/demande-identifiants',
            qs.stringify(testData),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status < 400;
                }
            }
        );

        if (response.status === 302) {
            console.log('🔄 Redirection vers:', response.headers.location);

            if (response.headers.location.includes('message=')) {
                const message = decodeURIComponent(response.headers.location.split('message=')[1]);
                console.log('💬 Message de succès:', message);
            }

            if (response.headers.location.includes('error=')) {
                const error = decodeURIComponent(response.headers.location.split('error=')[1]);
                console.log('❌ Message d\'erreur:', error);
            }
        }

        console.log('\n✅ Test terminé! Vérifiez maintenant le dashboard.');

    } catch (error) {
        if (error.response?.status === 302) {
            console.log('🔄 Redirection vers:', error.response.headers.location);

            if (error.response.headers.location.includes('message=')) {
                const message = decodeURIComponent(error.response.headers.location.split('message=')[1]);
                console.log('💬 Message de succès:', message);
            }

            if (error.response.headers.location.includes('error=')) {
                const errorMsg = decodeURIComponent(error.response.headers.location.split('error=')[1]);
                console.log('❌ Message d\'erreur:', errorMsg);
            }

            console.log('\n✅ Test terminé! Vérifiez maintenant le dashboard.');
        } else {
            console.error('❌ Erreur lors du test:', error.message);
        }
    }
}

testCredentialsForm();
