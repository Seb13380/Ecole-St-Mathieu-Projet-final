// Test manuel du toggle de document avec session Lionel
const axios = require('axios');

async function testToggleWithLionel() {
    try {
        console.log('=== TEST TOGGLE AVEC LIONEL ===\n');

        const client = axios.create({
            baseURL: 'http://localhost:3007',
            withCredentials: true,
            maxRedirects: 5,
            validateStatus: () => true
        });

        console.log('🔐 1. Connexion Lionel...');
        const loginResponse = await client.post('/auth/login', {
            email: 'l.camboulives@stmathieu.org',
            password: 'Directeur2025!'
        });

        console.log('📊 Login Status:', loginResponse.status);

        // Extraire le cookie
        const cookies = loginResponse.headers['set-cookie'];
        if (cookies) {
            client.defaults.headers.common['Cookie'] = cookies.join('; ');
        }

        console.log('\n🔄 2. Test toggle document ID 2...');
        const toggleResponse = await client.post('/documents/admin/2/toggle');

        console.log('📊 Toggle Status:', toggleResponse.status);
        console.log('🔄 Redirect URL:', toggleResponse.request?.res?.responseUrl || 'Aucune');

        if (toggleResponse.status === 200 || toggleResponse.status === 302) {
            console.log('✅ Toggle semble avoir fonctionné!');

            // Vérifier l'état du document
            console.log('\n📋 3. Vérification état document...');
            const checkResponse = await client.get('/documents/admin');

            if (checkResponse.data.includes('Projet Éducatif')) {
                console.log('✅ Page admin accessible après toggle');

                // Chercher des indices de succès/erreur
                if (checkResponse.data.includes('success=')) {
                    console.log('🎉 Message de succès détecté!');
                }
                if (checkResponse.data.includes('error=')) {
                    console.log('❌ Message d\'erreur détecté!');
                }
            }
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

testToggleWithLionel();
