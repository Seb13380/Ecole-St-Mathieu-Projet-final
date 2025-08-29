const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestDocuments() {
    try {
        // Trouver Frank
        const frank = await prisma.user.findUnique({
            where: { email: 'frank.quaracino@orange.fr' }
        });

        if (!frank) {
            console.log('❌ Frank non trouvé');
            return;
        }

        console.log(`👤 Utilisation de Frank (ID: ${frank.id})`);

        // Document public avec PDF (accessible sans connexion)
        const docPublic = await prisma.document.create({
            data: {
                type: 'REGLEMENT_INTERIEUR',
                titre: 'Règlement intérieur avec PDF public',
                description: 'Ce document est accessible à tous',
                contenu: 'Contenu du règlement intérieur...',
                pdfUrl: '/uploads/documents/reglement-public.pdf',
                pdfFilename: 'reglement-public.pdf',
                auteurId: frank.id,
                active: true
            }
        });

        // Document privé avec PDF (nécessite connexion)
        const docPrive = await prisma.document.create({
            data: {
                type: 'ORGANIGRAMME',
                titre: 'Organigramme avec PDF privé',
                description: 'Ce document nécessite une connexion',
                contenu: 'Contenu de l\'organigramme...',
                pdfUrl: '/uploads/documents/organigramme-prive.pdf',
                pdfFilename: 'organigramme-prive.pdf',
                auteurId: frank.id,
                active: true
            }
        });

        console.log('✅ Documents de test créés:');
        console.log(`📄 Document public: ${docPublic.titre} (ID: ${docPublic.id})`);
        console.log(`🔒 Document privé: ${docPrive.titre} (ID: ${docPrive.id})`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestDocuments();
