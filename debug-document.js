const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugDocument() {
    try {
        const document = await prisma.document.findUnique({
            where: {
                id: 7,
                active: true
            }
        });

        console.log('🔍 Document ID 7 trouvé:');
        console.log(JSON.stringify(document, null, 2));

        if (document) {
            console.log('\n📋 Analyse:');
            console.log('- ID:', document.id);
            console.log('- Titre:', document.titre);
            console.log('- Type:', document.type);
            console.log('- PDF URL:', document.pdfUrl);
            console.log('- External URL:', document.externalUrl);
            console.log('- Is External Link:', document.isExternalLink);
            console.log('- Active:', document.active);
        } else {
            console.log('❌ Document non trouvé');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugDocument();