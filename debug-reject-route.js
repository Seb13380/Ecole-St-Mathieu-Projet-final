const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugRejectRoute() {
    try {
        console.log('=== DEBUG ROUTE REJECT ===');

        // Vérifier l'utilisateur connecté (simuler)
        console.log('🔍 Test des demandes disponibles pour refus:');

        // Chercher toutes les demandes PENDING
        const pendingInscriptions = await prisma.inscriptionRequest.findMany({
            where: {
                status: {
                    in: ['PENDING', 'EN_ATTENTE', 'EMAIL_PENDING']
                }
            },
            select: {
                id: true,
                status: true,
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true
            },
            take: 10
        });

        const pendingPreInscriptions = await prisma.preInscriptionRequest.findMany({
            where: {
                status: {
                    in: ['PENDING', 'EN_ATTENTE', 'EMAIL_PENDING']
                }
            },
            select: {
                id: true,
                status: true,
                parentFirstName: true,
                parentLastName: true,
                parentEmail: true,
                type: true
            },
            take: 10
        });

        console.log(`\n📊 inscriptionRequest PENDING: ${pendingInscriptions.length}`);
        pendingInscriptions.forEach(req => {
            console.log(`- ID: ${req.id} | ${req.parentFirstName} ${req.parentLastName} | Status: ${req.status}`);
        });

        console.log(`\n📊 preInscriptionRequest PENDING: ${pendingPreInscriptions.length}`);
        pendingPreInscriptions.forEach(req => {
            console.log(`- ID: ${req.id} | ${req.parentFirstName} ${req.parentLastName} | Status: ${req.status} | Type: ${req.type}`);
        });

        // Test de la logique de rejectRequest
        console.log('\n🧪 Test logique rejectRequest:');
        if (pendingInscriptions.length > 0) {
            const testId = pendingInscriptions[0].id;
            console.log(`Test avec ID ${testId} (inscriptionRequest)`);

            const testRequest = await prisma.inscriptionRequest.findUnique({
                where: { id: testId }
            });
            console.log(`✅ Trouvé dans inscriptionRequest: ${testRequest ? 'OUI' : 'NON'}`);
        }

        if (pendingPreInscriptions.length > 0) {
            const testId = pendingPreInscriptions[0].id;
            console.log(`Test avec ID ${testId} (preInscriptionRequest)`);

            const testRequest = await prisma.preInscriptionRequest.findUnique({
                where: { id: testId }
            });
            console.log(`✅ Trouvé dans preInscriptionRequest: ${testRequest ? 'OUI' : 'NON'}`);
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugRejectRoute();