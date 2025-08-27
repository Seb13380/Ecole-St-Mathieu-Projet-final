const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDocuments() {
    try {
        const documents = await prisma.document.findMany({
            select: {
                id: true,
                titre: true,
                type: true,
                active: true
            },
            orderBy: { titre: 'asc' }
        });

        console.log('\n=== État des documents ===');
        documents.forEach(doc => {
            const status = doc.active ? 'ACTIF' : 'INACTIF';
            console.log(`${doc.id}: ${doc.titre} (${doc.type}) - ${status}`);
        });

        console.log(`\nTotal: ${documents.length} documents`);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDocuments();
