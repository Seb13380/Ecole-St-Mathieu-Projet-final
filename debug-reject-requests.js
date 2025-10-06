const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugRejectRequests() {
    try {
        console.log('=== DEBUG REFUS DEMANDES ===');
        
        // Compter les demandes dans preInscriptionRequest
        const preInscriptionCount = await prisma.preInscriptionRequest.count();
        console.log(`\n📊 preInscriptionRequest: ${preInscriptionCount} demandes`);
        
        if (preInscriptionCount > 0) {
            const preRequests = await prisma.preInscriptionRequest.findMany({
                select: {
                    id: true,
                    status: true,
                    parentFirstName: true,
                    parentLastName: true,
                    parentEmail: true,
                    type: true
                },
                take: 5
            });
            console.log('Exemples preInscriptionRequest:');
            preRequests.forEach(req => {
                console.log(`- ID: ${req.id}, Status: ${req.status}, Parent: ${req.parentFirstName} ${req.parentLastName}, Type: ${req.type}`);
            });
        }
        
        // Compter les demandes dans inscriptionRequest  
        const inscriptionCount = await prisma.inscriptionRequest.count();
        console.log(`\n📊 inscriptionRequest: ${inscriptionCount} demandes`);
        
        if (inscriptionCount > 0) {
            const requests = await prisma.inscriptionRequest.findMany({
                select: {
                    id: true,
                    status: true,
                    parentFirstName: true,
                    parentLastName: true,
                    parentEmail: true
                },
                take: 5
            });
            console.log('Exemples inscriptionRequest:');
            requests.forEach(req => {
                console.log(`- ID: ${req.id}, Status: ${req.status}, Parent: ${req.parentFirstName} ${req.parentLastName}`);
            });
        }

        // Chercher les demandes en attente
        console.log('\n🔍 DEMANDES EN ATTENTE:');
        
        const pendingPreRequests = await prisma.preInscriptionRequest.findMany({
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
                type: true
            }
        });
        
        const pendingRequests = await prisma.inscriptionRequest.findMany({
            where: {
                status: {
                    in: ['PENDING', 'EN_ATTENTE', 'EMAIL_PENDING']
                }
            },
            select: {
                id: true,
                status: true,
                parentFirstName: true,
                parentLastName: true
            }
        });
        
        console.log(`\n⏳ preInscriptionRequest en attente: ${pendingPreRequests.length}`);
        pendingPreRequests.forEach(req => {
            console.log(`- ID: ${req.id}, Status: ${req.status}, Parent: ${req.parentFirstName} ${req.parentLastName}, Type: ${req.type}`);
        });
        
        console.log(`\n⏳ inscriptionRequest en attente: ${pendingRequests.length}`);
        pendingRequests.forEach(req => {
            console.log(`- ID: ${req.id}, Status: ${req.status}, Parent: ${req.parentFirstName} ${req.parentLastName}`);
        });

    } catch (error) {
        console.error('❌ Erreur lors du debug:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugRejectRequests();