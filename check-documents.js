const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDocuments() {
    try {
        const documents = await prisma.document.findMany({
            orderBy: { type: 'asc' }
        });

        console.log('📄 Documents dans la base:');
        console.log('=========================');

        documents.forEach(doc => {
            console.log(`ID: ${doc.id} | Type: ${doc.type} | Titre: ${doc.titre} | Actif: ${doc.active ? '✅' : '❌'}`);
        });

        console.log(`\n📊 Total: ${documents.length} documents`);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDocuments();
