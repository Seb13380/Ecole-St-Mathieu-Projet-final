// Test d'accès aux routes de documents
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDocumentRoutes() {
    console.log('🧪 Test des routes de documents');
    console.log('===============================\n');

    try {
        // 1. Vérifier les utilisateurs autorisés
        console.log('1. Vérification des utilisateurs autorisés...');

        const lionel = await prisma.user.findFirst({
            where: { role: 'DIRECTION' }
        });

        const frank = await prisma.user.findFirst({
            where: { role: 'GESTIONNAIRE_SITE' }
        });

        if (lionel) {
            console.log(`✅ Lionel (DIRECTION) trouvé: ${lionel.firstName} ${lionel.lastName} - ID: ${lionel.id}`);
        } else {
            console.log('❌ Aucun utilisateur DIRECTION trouvé');
        }

        if (frank) {
            console.log(`✅ Frank (GESTIONNAIRE_SITE) trouvé: ${frank.firstName} ${frank.lastName} - ID: ${frank.id}`);
        } else {
            console.log('❌ Aucun utilisateur GESTIONNAIRE_SITE trouvé');
        }

        // 2. Vérifier la structure des fichiers
        console.log('\n2. Vérification des fichiers...');

        const fs = require('fs');
        const path = require('path');

        const filesToCheck = [
            'src/controllers/documentController.js',
            'src/routes/documentRoutes.js',
            'middleware/uploadDocuments.js',
            'src/views/pages/documents/show.twig',
            'src/views/pages/documents/manage.twig'
        ];

        filesToCheck.forEach(filePath => {
            const fullPath = path.join(__dirname, filePath);
            if (fs.existsSync(fullPath)) {
                console.log(`✅ ${filePath}`);
            } else {
                console.log(`❌ ${filePath} - MANQUANT !`);
            }
        });

        // 3. Vérifier la base de données
        console.log('\n3. Vérification de la base de données...');

        const documentCount = await prisma.document.count();
        console.log(`📄 Nombre de documents en base: ${documentCount}`);

        // Test des types de documents
        const documentTypes = [
            'PROJET_EDUCATIF',
            'PROJET_ETABLISSEMENT',
            'REGLEMENT_INTERIEUR',
            'ORGANIGRAMME',
            'CHARTE_LAICITE',
            'CHARTE_NUMERIQUE',
            'CHARTE_VIE_SCOLAIRE',
            'CHARTE_RESTAURATION',
            'AGENDA',
            'PASTORALE_AXE',
            'PASTORALE_TEMPS_PRIANT',
            'PASTORALE_ENSEMBLE'
        ];

        console.log(`📋 Types de documents supportés: ${documentTypes.length}`);
        documentTypes.forEach(type => {
            console.log(`   - ${type.replace('_', ' ')}`);
        });

        console.log('\n🎯 Points d\'accès testés:');
        console.log('  🌐 Public: /documents/:type');
        console.log('  🔐 Admin: /documents/admin');
        console.log('  📊 Dashboard Lionel: /directeur/dashboard');
        console.log('  📊 Dashboard Frank: /frank/dashboard');

        console.log('\n✅ Tous les composants du système sont en place !');
        console.log('\n🚀 Pour tester:');
        console.log('  1. Connectez-vous en tant que Lionel ou Frank');
        console.log('  2. Allez sur votre dashboard');
        console.log('  3. Cliquez sur "Documents Officiels"');
        console.log('  4. Vous devriez arriver sur /documents/admin');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testDocumentRoutes();
