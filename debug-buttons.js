const { PrismaClient } = require('@prisma/client');

async function debugButtons() {
    const prisma = new PrismaClient();

    try {
        console.log('=== DEBUG BOUTONS DE PUBLICATION ===\n');

        // Récupérer tous les documents
        const documents = await prisma.document.findMany({
            include: { auteur: { select: { firstName: true, lastName: true } } },
            orderBy: { id: 'asc' }
        });

        console.log('📄 Documents disponibles:');
        documents.forEach(doc => {
            console.log(`  ID: ${doc.id} | ${doc.titre} | ${doc.active ? '✅ ACTIF' : '❌ INACTIF'}`);
        });

        if (documents.length > 0) {
            const doc = documents[0];
            console.log(`\n🔍 Test avec le document ID ${doc.id}: "${doc.titre}"`);
            console.log(`📋 Routes disponibles pour ce document:`);
            console.log(`  - POST /documents/admin/${doc.id}/toggle`);
            console.log(`  - PATCH /documents/admin/${doc.id}/toggle`);
            console.log(`  - POST /documents/admin/${doc.id}/delete`);
            console.log(`  - DELETE /documents/admin/${doc.id}`);
        }

        console.log('\n🎯 Pour tester les boutons:');
        console.log('1. Connectez-vous en tant que Lionel ou Frank');
        console.log('2. Allez sur http://localhost:3007/documents/admin');
        console.log('3. Cliquez sur "Activer/Désactiver" ou "Supprimer"');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugButtons();
