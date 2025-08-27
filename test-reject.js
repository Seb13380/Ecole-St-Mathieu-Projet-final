const axios = require('axios');

async function testRejectRequest() {
    try {
        console.log('🔄 Test de refus d\'une demande...');

        // Simuler une requête de refus
        const response = await axios.post('http://localhost:3007/directeur/inscriptions/6/reject', {
            comment: 'Test de refus automatique'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'connect.sid=s%3AyourSessionId.signature' // Session fictive
            }
        });

        console.log('✅ Réponse reçue:', response.status);
        console.log('📄 Données:', response.data);

    } catch (error) {
        console.log('❌ Erreur capturée:');
        console.log('   Status:', error.response?.status);
        console.log('   Headers:', error.response?.headers);
        console.log('   Data:', error.response?.data);
        console.log('   Message:', error.message);

        if (error.response?.status === 302) {
            console.log('🔄 Redirection vers:', error.response.headers.location);
        }
    }
}

testRejectRequest();
