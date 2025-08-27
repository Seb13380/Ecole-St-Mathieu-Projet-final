const express = require('express');
const app = express();

// Test rapide de compilation du template
const { Twig } = require('twig');

async function testTemplate() {
    try {
        console.log('🔄 Test compilation template inscription-requests...');

        // Données de test
        const testData = {
            title: 'Test',
            requests: [
                { id: 1, status: 'PENDING', parentFirstName: 'Test', parentLastName: 'User' },
                { id: 2, status: 'APPROVED', parentFirstName: 'Test2', parentLastName: 'User2' }
            ],
            user: { role: 'DIRECTION' }
        };

        // Charger le template
        const template = Twig.twig({
            path: './src/views/pages/admin/inscription-requests.twig'
        });

        // Compiler le template
        const html = template.render(testData);

        console.log('✅ Template compilé avec succès');
        console.log('📄 Taille HTML:', html.length, 'caractères');

        if (html.includes('Demandes d\'inscription')) {
            console.log('✅ Contenu attendu trouvé');
        } else {
            console.log('❌ Contenu attendu manquant');
        }

    } catch (error) {
        console.error('❌ Erreur compilation template:', error.message);
        console.error('🔍 Détails erreur:', error);
    }
}

testTemplate();
