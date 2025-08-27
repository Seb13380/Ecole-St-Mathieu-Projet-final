const axios = require('axios');

async function testAdminAccess() {
    try {
        console.log('=== TEST ACCÈS ADMIN DOCUMENTS ===\n');

        // Créer un client avec session
        const client = axios.create({
            baseURL: 'http://localhost:3007',
            withCredentials: true,
            maxRedirects: 0, // Disable redirects to see what happens
            validateStatus: () => true // Accept all status codes
        });

        console.log('🔐 1. Test connexion Frank...');
        const loginResponse = await client.post('/auth/login', {
            email: 'frank@stmathieu.org',
            password: 'Frank2025!'
        });

        console.log('📊 Login Status:', loginResponse.status);
        console.log('🍪 Set-Cookie:', loginResponse.headers['set-cookie'] ? 'Oui' : 'Non');

        // Extraire le cookie de session
        const sessionCookie = loginResponse.headers['set-cookie']?.[0];
        if (sessionCookie) {
            console.log('🍪 Session cookie trouvé');
            client.defaults.headers.common['Cookie'] = sessionCookie;
        }

        console.log('\n📋 2. Test accès /documents/admin...');
        const adminResponse = await client.get('/documents/admin');

        console.log('📊 Admin Status:', adminResponse.status);
        console.log('🔄 Location:', adminResponse.headers.location || 'Aucune redirection');

        if (adminResponse.status === 200) {
            console.log('✅ Accès réussi à la page admin!');
            console.log('📄 Taille réponse:', adminResponse.data.length, 'caractères');

            // Vérifier si les boutons sont présents
            const html = adminResponse.data;
            const hasToggleButtons = html.includes('/toggle');
            const hasDeleteButtons = html.includes('confirmDelete');

            console.log('🔧 Boutons toggle présents:', hasToggleButtons ? '✅' : '❌');
            console.log('🗑️ Boutons delete présents:', hasDeleteButtons ? '✅' : '❌');

        } else if (adminResponse.status === 302 || adminResponse.status === 301) {
            console.log('🔄 Redirection vers:', adminResponse.headers.location);
        } else {
            console.log('❌ Erreur:', adminResponse.status, adminResponse.statusText);
        }

        // Test d'un toggle direct
        console.log('\n🔄 3. Test toggle document ID 2...');
        const toggleResponse = await client.post('/documents/admin/2/toggle');

        console.log('📊 Toggle Status:', toggleResponse.status);
        console.log('🔄 Toggle Location:', toggleResponse.headers.location || 'Aucune redirection');

        if (toggleResponse.status === 302) {
            console.log('✅ Toggle fonctionne - redirection OK');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

testAdminAccess();
