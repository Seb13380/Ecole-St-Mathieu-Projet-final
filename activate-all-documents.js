const { PrismaClient } = require('@prisma/client');

async function activateAllDocuments() {
    const prisma = new PrismaClient();

    try {
        console.log('=== ACTIVATION DE TOUS LES DOCUMENTS ===\n');

        // Récupérer tous les documents
        const documents = await prisma.document.findMany({
            include: { auteur: { select: { firstName: true, lastName: true } } },
            orderBy: { id: 'asc' }
        });

        console.log(`📄 Documents trouvés: ${documents.length}`);

        // Compter actifs/inactifs
        const activeCount = documents.filter(doc => doc.active).length;
        const inactiveCount = documents.filter(doc => !doc.active).length;

        console.log(`✅ Actifs: ${activeCount}`);
        console.log(`❌ Inactifs: ${inactiveCount}\n`);

        if (inactiveCount > 0) {
            console.log('🔄 Activation des documents inactifs...');

            // Activer tous les documents inactifs
            const result = await prisma.document.updateMany({
                where: { active: false },
                data: { active: true }
            });

            console.log(`✅ ${result.count} documents activés avec succès!\n`);
        } else {
            console.log('✅ Tous les documents sont déjà actifs!\n');
        }

        // Afficher l'état final
        console.log('📋 État final des documents:');
        const finalDocuments = await prisma.document.findMany({
            include: { auteur: { select: { firstName: true, lastName: true } } },
            orderBy: [{ type: 'asc' }, { id: 'asc' }]
        });

        finalDocuments.forEach(doc => {
            const status = doc.active ? '✅ PUBLIÉ' : '❌ INACTIF';
            const category = ['PROJET_EDUCATIF', 'PROJET_ETABLISSEMENT', 'REGLEMENT_INTERIEUR', 'ORGANIGRAMME', 'AGENDA', 'CHARTE_LAICITE', 'CHARTE_NUMERIQUE', 'CHARTE_VIE_SCOLAIRE', 'CHARTE_RESTAURATION'].includes(doc.type) ? 'École' : 'Pastorale';
            console.log(`  📄 [${category}] ${doc.type}: ${doc.titre} - ${status}`);
        });

        console.log('\n🎯 Maintenant testez:');
        console.log('   1. http://localhost:3007/documents/ecole');
        console.log('   2. http://localhost:3007/documents/pastorale');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

activateAllDocuments();
