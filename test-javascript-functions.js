const axios = require('axios');

async function testJavaScriptFunctions() {
    try {
        console.log('🧪 Test du JavaScript des modals...\n');

        // 1. Connexion
        console.log('1️⃣ Connexion...');
        const loginResponse = await axios.post('http://localhost:3007/auth/login', {
            email: 'lionel.camboulives@ecole-saint-mathieu.fr',
            password: 'Directeur2025!'
        }, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status < 400;
            }
        });

        const cookies = loginResponse.headers['set-cookie'];
        console.log('✅ Connexion OK');

        // 2. Récupération de la page
        console.log('\n2️⃣ Récupération page admin...');
        const managePage = await axios.get('http://localhost:3007/actualites/manage', {
            headers: {
                'Cookie': cookies ? cookies.join('; ') : ''
            },
            maxRedirects: 5
        });

        const html = managePage.data;
        console.log('✅ Page récupérée');

        // 3. Recherche des fonctions JavaScript
        console.log('\n3️⃣ Analyse JavaScript:');
        const hasEditFunction = html.includes('function editActualite');
        const hasDeleteFunction = html.includes('function confirmDelete');
        const hasConsoleLog = html.includes('JavaScript chargé - Fonctions disponibles');
        const hasModals = html.includes('editModal') && html.includes('deleteModal');

        console.log(`🔧 Fonction editActualite: ${hasEditFunction ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`🗑️ Fonction confirmDelete: ${hasDeleteFunction ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`📱 Modals HTML: ${hasModals ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`💬 Console debug: ${hasConsoleLog ? '✅ Présent' : '❌ Manquant'}`);

        // 4. Recherche des boutons onclick
        const hasEditButtons = html.includes('onclick="editActualite');
        const hasDeleteButtons = html.includes('onclick="confirmDelete');

        console.log('\n4️⃣ Analyse boutons onclick:');
        console.log(`🔧 Boutons Modifier (onclick): ${hasEditButtons ? '✅ Présent' : '❌ Manquant'}`);
        console.log(`🗑️ Boutons Supprimer (onclick): ${hasDeleteButtons ? '✅ Présent' : '❌ Manquant'}`);

        // 5. Instructions pour l'utilisateur
        console.log('\n🎯 Instructions:');
        console.log('1. Allez sur: http://localhost:3007/actualites/manage');
        console.log('2. Ouvrez la console développeur (F12)');
        console.log('3. Cherchez le message: "✅ JavaScript chargé"');
        console.log('4. Testez les boutons Modifier et Supprimer');
        console.log('5. Si erreur, regardez les messages dans la console');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

testJavaScriptFunctions();
