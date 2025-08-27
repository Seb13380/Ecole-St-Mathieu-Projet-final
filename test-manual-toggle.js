const { PrismaClient } = require('@prisma/client');

async function testToggleDatabase() {
    const prisma = new PrismaClient();

    try {
        console.log('=== TEST MANUEL DE PUBLICATION ===\n');

        // Récupérer le premier document
        const document = await prisma.document.findFirst({
            where: { id: 2 }, // Le projet éducatif de Frank
            include: { auteur: { select: { firstName: true, lastName: true } } }
        });

        if (!document) {
            console.log('❌ Document ID 2 non trouvé');
            return;
        }

        console.log(`📄 Document: ${document.titre}`);
        console.log(`👤 Auteur: ${document.auteur.firstName} ${document.auteur.lastName}`);
        console.log(`✅ État initial: ${document.active ? 'PUBLIÉ' : 'DÉPUBLIÉ'}`);

        // Simuler le toggle
        console.log('\n🔄 Simulation du toggle...');
        const newStatus = !document.active;

        const updatedDocument = await prisma.document.update({
            where: { id: document.id },
            data: { active: newStatus }
        });

        console.log(`✅ Nouvel état: ${updatedDocument.active ? 'PUBLIÉ' : 'DÉPUBLIÉ'}`);

        // Remettre l'état original
        await prisma.document.update({
            where: { id: document.id },
            data: { active: document.active }
        });

        console.log(`🔄 État restauré: ${document.active ? 'PUBLIÉ' : 'DÉPUBLIÉ'}`);

        console.log('\n🎯 Le mécanisme de publication fonctionne en base de données!');
        console.log('💡 Si les boutons ne fonctionnent pas, le problème est:');
        console.log('   1. Les formulaires HTML ne soumettent pas');
        console.log('   2. Les routes ne reçoivent pas les requêtes');
        console.log('   3. Le JavaScript des boutons a un problème');

        console.log('\n🧪 Pour tester manuellement:');
        console.log('   1. Allez sur http://localhost:3007/documents/admin');
        console.log('   2. Cliquez sur un bouton Activer/Désactiver');
        console.log('   3. Regardez les logs du serveur');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testToggleDatabase();
