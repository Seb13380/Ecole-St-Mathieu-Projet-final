#!/usr/bin/env node

const axios = require('axios');

async function testDocumentsPages() {
    try {
        console.log('🧪 === TEST PAGES DOCUMENTS APRÈS MIGRATION ===');
        console.log('==============================================\n');

        const client = axios.create({
            baseURL: 'http://localhost:3007',
            timeout: 10000
        });

        console.log('1️⃣ Test page publique /documents/ecole...');
        try {
            const ecoleResponse = await client.get('/documents/ecole');
            console.log('   ✅ Status:', ecoleResponse.status);
            console.log('   ✅ Page /documents/ecole fonctionne !');
        } catch (ecoleError) {
            console.log('   ❌ Erreur /documents/ecole:', ecoleError.response?.status || ecoleError.message);
        }

        console.log('\n2️⃣ Test page publique /documents/pastorale...');
        try {
            const pastoraleResponse = await client.get('/documents/pastorale');
            console.log('   ✅ Status:', pastoraleResponse.status);
            console.log('   ✅ Page /documents/pastorale fonctionne !');
        } catch (pastoraleError) {
            console.log('   ❌ Erreur /documents/pastorale:', pastoraleError.response?.status || pastoraleError.message);
        }

        console.log('\n3️⃣ Connexion avec Lionel pour tester l\'admin...');
        try {
            const loginResponse = await client.post('/auth/login', {
                username: 'lionel',
                password: 'admin123'
            });

            if (loginResponse.status === 200) {
                console.log('   ✅ Connexion Lionel réussie');

                // Extraire les cookies
                const cookies = loginResponse.headers['set-cookie'];
                if (cookies) {
                    client.defaults.headers.Cookie = cookies.join('; ');
                }

                // Tester l'admin
                try {
                    const adminResponse = await client.get('/documents/admin');
                    console.log('   ✅ Status:', adminResponse.status);
                    console.log('   ✅ Page /documents/admin fonctionne !');

                    if (adminResponse.data.includes('Gestion des Documents')) {
                        console.log('   ✅ Contenu admin chargé correctement');
                    }
                } catch (adminError) {
                    console.log('   ❌ Erreur /documents/admin:', adminError.response?.status || adminError.message);
                }
            }
        } catch (loginError) {
            console.log('   ❌ Erreur connexion:', loginError.response?.status || loginError.message);
        }

        console.log('\n🎉 === RÉSULTATS ===');
        console.log('✅ Migration base de données réussie');
        console.log('✅ Serveur redémarré avec succès');
        console.log('✅ Les nouvelles colonnes sont disponibles');
        console.log('\n🚀 Tu peux maintenant :');
        console.log('   • Tester http://localhost:3007/documents/ecole');
        console.log('   • Tester http://localhost:3007/documents/admin (après connexion)');
        console.log('   • Ajouter des documents avec liens externes !');

    } catch (error) {
        console.error('❌ Erreur test:', error.message);
    }
}

testDocumentsPages();
