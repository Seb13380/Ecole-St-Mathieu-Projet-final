const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testToggleDocument() {
    try {
        console.log('=== TEST DE PUBLICATION/DÉPUBLICATION ===\n');

        // Récupérer un document pour le test
        const document = await prisma.document.findFirst({
            include: { auteur: { select: { firstName: true, lastName: true } } }
        });

        if (!document) {
            console.log('❌ Aucun document trouvé pour le test');
            return;
        }

        console.log(`📄 Document de test: ${document.titre}`);
        console.log(`📋 Type: ${document.type}`);
        console.log(`👤 Auteur: ${document.auteur.firstName} ${document.auteur.lastName}`);
        console.log(`✅ Statut initial: ${document.active ? 'ACTIF' : 'INACTIF'}\n`);

        // Test 1: Changer le statut
        console.log('🔄 Test 1: Basculer le statut...');
        const updatedDocument = await prisma.document.update({
            where: { id: document.id },
            data: { active: !document.active }
        });
        console.log(`✅ Nouveau statut: ${updatedDocument.active ? 'ACTIF' : 'INACTIF'}\n`);

        // Test 2: Remettre le statut original
        console.log('🔄 Test 2: Remettre le statut original...');
        const restoredDocument = await prisma.document.update({
            where: { id: document.id },
            data: { active: document.active }
        });
        console.log(`✅ Statut restauré: ${restoredDocument.active ? 'ACTIF' : 'INACTIF'}\n`);

        // Afficher l'état final
        console.log('📊 ÉTAT FINAL DES DOCUMENTS:');
        const allDocuments = await prisma.document.findMany({
            include: { auteur: { select: { firstName: true, lastName: true } } },
            orderBy: { type: 'asc' }
        });

        allDocuments.forEach(doc => {
            const status = doc.active ? '✅ ACTIF' : '❌ INACTIF';
            console.log(`  📄 ${doc.type}: ${doc.titre} - ${status}`);
        });

        console.log('\n🎯 Test terminé avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testToggleDocument();
