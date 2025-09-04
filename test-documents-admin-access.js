#!/usr/bin/env node

const axios = require('axios');

async function testDocumentsAdmin() {
    try {
        console.log('🧪 === TEST ACCÈS DOCUMENTS/ADMIN ===');
        console.log('====================================\n');

        // Créer une session avec axios
        const client = axios.create({
            baseURL: 'http://localhost:3007',
            withCredentials: true,
            timeout: 10000
        });

        console.log('1️⃣ Tentative de connexion avec Lionel...');

        // Se connecter avec Lionel
        const loginResponse = await client.post('/auth/login', {
            username: 'lionel',
            password: 'admin123'
        });

        console.log('   Status:', loginResponse.status);

        if (loginResponse.status === 200) {
            console.log('   ✅ Connexion réussie');

            // Extraire les cookies de session
            const cookies = loginResponse.headers['set-cookie'];
            if (cookies) {
                client.defaults.headers.Cookie = cookies.join('; ');
            }

            console.log('\n2️⃣ Test accès /documents/admin...');

            try {
                const adminResponse = await client.get('/documents/admin');
                console.log('   Status:', adminResponse.status);
                console.log('   ✅ Accès autorisé à documents/admin');

                // Vérifier si la page contient du contenu
                if (adminResponse.data.includes('Gestion des documents')) {
                    console.log('   ✅ Page documents admin chargée correctement');
                } else {
                    console.log('   ⚠️ Page chargée mais contenu inattendu');
                    console.log('   Début de la réponse:', adminResponse.data.substring(0, 200));
                }

            } catch (adminError) {
                console.log('   ❌ Erreur accès documents/admin:', adminError.response?.status);
                console.log('   Message:', adminError.response?.data || adminError.message);
            }

        } else {
            console.log('   ❌ Échec connexion');
        }

    } catch (error) {
        console.error('❌ Erreur test:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

testDocumentsAdmin();
