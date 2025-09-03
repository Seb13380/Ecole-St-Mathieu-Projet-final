const axios = require('axios');

async function testCreateStudent() {
    try {
        console.log('🧪 Test de création d\'élève...');

        // Données de test
        const studentData = {
            firstName: 'TestPrenom',
            lastName: 'TestNom',
            birthDate: '2020-09-01',
            parentId: 3, // ID du parent test test
            classeId: 1
        };

        console.log('📤 Envoi des données:', studentData);

        const response = await axios.post('http://localhost:3007/user-management/students', studentData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        console.log('✅ Réponse reçue:', response.status);
        console.log('📋 Données de réponse:', response.data);

    } catch (error) {
        console.error('❌ Erreur lors du test:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
    }
}

testCreateStudent();
