const axios = require('axios');

async function testRoutes() {
    const baseURL = 'http://localhost:3007';

    try {
        // Test d'accès aux demandes d'inscription (sans auth)
        console.log('🧪 Test des routes...');

        // Test route de détails
        try {
            const response = await axios.get(`${baseURL}/inscriptions/2/details`);
            console.log('✅ Route /inscriptions/2/details:', response.status);
        } catch (error) {
            console.log('❌ Route /inscriptions/2/details:', error.response?.status || error.message);
        }

        // Test route admin détails
        try {
            const response = await axios.get(`${baseURL}/admin/inscriptions/2/details`);
            console.log('✅ Route /admin/inscriptions/2/details:', response.status);
        } catch (error) {
            console.log('❌ Route /admin/inscriptions/2/details:', error.response?.status || error.message);
        }

    } catch (error) {
        console.error('Erreur générale:', error.message);
    }
}

testRoutes();
