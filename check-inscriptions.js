const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInscription() {
    try {
        console.log('=== VÉRIFICATION DEMANDE SEBASTIENO ===');

        // Trouver toutes les demandes d'inscription
        const allInscriptions = await prisma.inscriptionRequest.findMany({
            select: {
                id: true,
                status: true,
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true,
                createdAt: true
            }
        });

        console.log('Toutes les demandes inscription:');
        allInscriptions.forEach((req, index) => {
            console.log(`${index + 1}. ID: ${req.id}, Status: ${req.status}, Parent: ${req.parentFirstName} ${req.parentLastName}`);
        });

        // Tester les requêtes exactes du dashboard
        console.log('\n=== TEST REQUÊTES DASHBOARD ===');
        const pendingCount = await prisma.inscriptionRequest.count({
            where: { status: 'PENDING' }
        });
        console.log('Requête dashboard - Count PENDING:', pendingCount);

        const pendingList = await prisma.inscriptionRequest.findMany({
            where: { status: 'PENDING' }
        });
        console.log('Requête dashboard - Liste PENDING:');
        pendingList.forEach(req => {
            console.log(`  - ${req.parentFirstName} ${req.parentLastName} (ID: ${req.id})`);
        });

        // Vérifier aussi les autres statuts
        console.log('\n=== TOUS LES STATUTS ===');
        const allStatuses = await prisma.inscriptionRequest.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        allStatuses.forEach(group => {
            console.log(`${group.status}: ${group._count.status} demandes`);
        });

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkInscription();
