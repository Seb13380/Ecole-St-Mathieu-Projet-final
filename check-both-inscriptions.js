const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPreInscriptions() {
    try {
        console.log('=== VÉRIFICATION preInscriptionRequest ===');

        // Vérifier preInscriptionRequest
        const preInscriptions = await prisma.preInscriptionRequest.findMany({
            select: {
                id: true,
                status: true,
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true,
                submittedAt: true
            }
        });

        console.log('Demandes preInscriptionRequest:');
        preInscriptions.forEach((req, index) => {
            console.log(`${index + 1}. ID: ${req.id}, Status: ${req.status}, Parent: ${req.parentFirstName} ${req.parentLastName}`);
        });

        // Compter par statut
        const preInscriptionsGrouped = await prisma.preInscriptionRequest.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        console.log('\n=== STATUTS preInscriptionRequest ===');
        preInscriptionsGrouped.forEach(group => {
            console.log(`${group.status}: ${group._count.status} demandes`);
        });

        console.log('\n=== VÉRIFICATION inscriptionRequest ===');

        // Vérifier inscriptionRequest
        const inscriptions = await prisma.inscriptionRequest.findMany({
            select: {
                id: true,
                status: true,
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true,
                createdAt: true
            }
        });

        console.log('Demandes inscriptionRequest:');
        inscriptions.forEach((req, index) => {
            console.log(`${index + 1}. ID: ${req.id}, Status: ${req.status}, Parent: ${req.parentFirstName} ${req.parentLastName}`);
        });

        // Compter par statut
        const inscriptionsGrouped = await prisma.inscriptionRequest.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        console.log('\n=== STATUTS inscriptionRequest ===');
        inscriptionsGrouped.forEach(group => {
            console.log(`${group.status}: ${group._count.status} demandes`);
        });

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPreInscriptions();
