const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnostic() {
    try {
        console.log('🔍 DIAGNOSTIC COMPLET POUR DÉPLOIEMENT URGENT\n');
        console.log('=' * 50);

        // 1. Vérifier les documents
        console.log('📄 1. DOCUMENTS:');
        const documents = await prisma.document.findMany();
        const docsActifs = documents.filter(d => d.active);

        console.log(`   - Total documents: ${documents.length}`);
        console.log(`   - Documents actifs: ${docsActifs.length}`);

        if (docsActifs.length === 0) {
            console.log('   ❌ PROBLÈME: Aucun document actif !');
            console.log('   🔧 SOLUTION: Exécuter fix-documents-urgence.js');
        } else {
            console.log('   ✅ Documents disponibles');
        }

        // 2. Vérifier les classes
        console.log('\n🏫 2. CLASSES:');
        const classes = await prisma.classe.findMany({
            include: { _count: { select: { eleves: true } } }
        });

        console.log(`   - Total classes: ${classes.length}`);
        console.log(`   - Total élèves: ${classes.reduce((sum, c) => sum + c._count.eleves, 0)}`);

        if (classes.length === 0) {
            console.log('   ❌ PROBLÈME: Aucune classe !');
        } else {
            console.log('   ✅ Classes disponibles');
        }

        // 3. Vérifier les utilisateurs critiques
        console.log('\n👥 3. UTILISATEURS CRITIQUES:');
        const lionel = await prisma.user.findFirst({ where: { role: 'DIRECTION' } });
        const frank = await prisma.user.findFirst({ where: { role: 'GESTIONNAIRE_SITE' } });
        const yamina = await prisma.user.findFirst({ where: { role: 'SECRETAIRE_DIRECTION' } });

        console.log(`   - Lionel (DIRECTION): ${lionel ? '✅' : '❌'}`);
        console.log(`   - Frank (GESTIONNAIRE): ${frank ? '✅' : '❌'}`);
        console.log(`   - Yamina (SECRÉTAIRE): ${yamina ? '✅' : '❌'}`);

        // 4. Vérifier les routes critiques
        console.log('\n🔗 4. ROUTES À TESTER:');
        console.log('   - http://localhost:3007/documents/ecole');
        console.log('   - http://localhost:3007/directeur/classes (après connexion Lionel)');
        console.log('   - http://localhost:3007/auth/login');

        // 5. Fichiers critiques à vérifier
        console.log('\n📁 5. FICHIERS CRITIQUES:');
        console.log('   - src/controllers/documentController.js');
        console.log('   - src/controllers/directeurController.js');
        console.log('   - src/views/pages/admin/classes.twig');
        console.log('   - prisma/schema.prisma');

        // 6. Recommandations pour le VPS
        console.log('\n🚀 6. POUR LE VPS:');
        console.log('   1. Transférer le dossier /uploads/documents/');
        console.log('   2. Exécuter restore-documents-vps.sql');
        console.log('   3. Vérifier la variable DATABASE_URL');
        console.log('   4. Redémarrer le serveur');
        console.log('   5. Tester /documents/ecole');

        // 7. Checklist finale
        console.log('\n✅ 7. CHECKLIST DÉPLOIEMENT:');
        console.log('   □ Base de données synchronisée');
        console.log('   □ Fichiers PDF transférés');
        console.log('   □ Variables d\'environnement configurées');
        console.log('   □ Serveur redémarré');
        console.log('   □ Pages testées');

        console.log('\n🎯 PRÊT POUR DEMAIN !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnostic();
