const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDocuments() {
    try {
        // Vérifier tous les documents DOSSIER_INSCRIPTION
        const dossierDocs = await prisma.document.findMany({
            where: { type: 'DOSSIER_INSCRIPTION' },
            select: { id: true, titre: true, type: true, active: true, createdAt: true }
        });

        console.log('=== Documents DOSSIER_INSCRIPTION ===');
        dossierDocs.forEach(d => {
            console.log(`- ID: ${d.id} | Titre: "${d.titre}" | Actif: ${d.active} | Créé: ${d.createdAt.toISOString().split('T')[0]}`);
        });

        // Vérifier aussi tous les documents actifs
        const activeDocs = await prisma.document.findMany({
            where: { active: true },
            select: { id: true, titre: true, type: true, active: true }
        });

        console.log('\n=== Tous les documents ACTIFS ===');
        activeDocs.forEach(d => {
            console.log(`- ID: ${d.id} | Titre: "${d.titre}" | Type: ${d.type} | Actif: ${d.active}`);
        });

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDocuments();
