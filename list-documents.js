const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listDocuments() {
    try {
        const documents = await prisma.document.findMany({
            include: { auteur: { select: { firstName: true, lastName: true } } },
            orderBy: { type: 'asc' }
        });

        console.log('=== DOCUMENTS DANS LA BASE ===');
        documents.forEach(doc => {
            console.log('📄 Type: ' + doc.type);
            console.log('   Titre: ' + doc.titre);
            console.log('   Actif: ' + (doc.active ? '✅' : '❌'));
            console.log('   Auteur: ' + doc.auteur.firstName + ' ' + doc.auteur.lastName);
            console.log('   Contenu: ' + (doc.contenu ? 'Oui' : 'Non'));
            console.log('   PDF: ' + (doc.pdfUrl ? 'Oui' : 'Non'));
            console.log('---');
        });

        console.log('\nTotal: ' + documents.length + ' documents');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

listDocuments();
