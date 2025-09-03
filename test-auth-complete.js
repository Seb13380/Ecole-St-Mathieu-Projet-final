const fetch = require('node-fetch');

async function testAuthAndCreate() {
    try {
        // 1. Test de connexion avec Lionel (DIRECTION)
        console.log('🔐 Test de connexion...');

        const loginResponse = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'email=l.camboulives@stmathieu.org&password=test123'
        });

        console.log('📊 Status connexion:', loginResponse.status);

        // Récupérer les cookies de session
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('🍪 Cookies reçus:', cookies ? 'OUI' : 'NON');

        if (loginResponse.status !== 200 && loginResponse.status !== 302) {
            console.log('❌ Connexion échouée');
            const text = await loginResponse.text();
            console.log('🔍 Réponse:', text.substring(0, 500));
            return;
        }

        // 2. Test de création d'élève avec session
        console.log('\\n👨‍🎓 Test de création d\'élève avec session...');

        const studentData = {
            firstName: 'TestPrenom',
            lastName: 'TestNom',
            birthDate: '2020-09-01',
            parentId: 3,
            classeId: 1
        };

        const createResponse = await fetch('http://localhost:3000/user-management/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': cookies || ''
            },
            body: JSON.stringify(studentData)
        });

        console.log('📊 Status création:', createResponse.status);
        const result = await createResponse.text();

        if (createResponse.status === 200 || createResponse.status === 201) {
            console.log('✅ Création réussie!');
            console.log('📋 Réponse:', result.substring(0, 500));
        } else {
            console.log('❌ Création échouée');
            console.log('🔍 Réponse:', result.substring(0, 500));
        }

    } catch (error) {
        console.error('💥 Erreur:', error.message);
    }
}

testAuthAndCreate();
