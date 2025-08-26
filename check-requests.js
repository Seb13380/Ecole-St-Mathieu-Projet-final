const { PrismaClient } = require('@prisma/client');

async function checkRequests() {
    const prisma = new PrismaClient();

    try {
        const requests = await prisma.inscriptionRequest.findMany({
            orderBy: { createdAt: 'desc' }
        });

        console.log(`🔍 Demandes trouvées: ${requests.length}`);
        requests.forEach(r => {
            console.log(`- ID: ${r.id}, Status: ${r.status}, Email: ${r.parentEmail}`);
        });
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRequests();
