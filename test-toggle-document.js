const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testToggle() {
    try {
        // Prenons le document avec ID 5 (Axe Pastoral)
        const documentId = 5;

        console.log('=== Test de toggle du document ===');

        // État avant
        const avant = await prisma.document.findUnique({
            where: { id: documentId },
            select: { id: true, titre: true, active: true }
        });

        console.log('Avant:', avant);

        // Toggle
        const apres = await prisma.document.update({
            where: { id: documentId },
            data: { active: !avant.active }
        });

        console.log('Après:', apres);

        // Remettre dans l'état initial
        await prisma.document.update({
            where: { id: documentId },
            data: { active: avant.active }
        });

        console.log('Remis à l\'état initial');

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testToggle();
