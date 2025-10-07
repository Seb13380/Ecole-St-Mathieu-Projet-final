const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugStatus() {
    try {
        console.log('=== DEBUG STATUTS ===');
        
        // Récupérer tous les statuts existants
        const inscriptionStatuts = await prisma.inscriptionRequest.findMany({
            select: { status: true },
            distinct: ['status']
        });
        
        console.log('📊 Statuts dans inscriptionRequest:');
        inscriptionStatuts.forEach(req => {
            console.log(`- ${req.status}`);
        });
        
        // Compter par statut
        const statusCounts = await prisma.inscriptionRequest.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        
        console.log('\n📈 Comptage par statut:');
        statusCounts.forEach(item => {
            console.log(`- ${item.status}: ${item._count.status} demandes`);
        });
        
        // Récupérer 5 exemples avec détails
        const exemples = await prisma.inscriptionRequest.findMany({
            select: {
                id: true,
                status: true,
                parentFirstName: true,
                parentLastName: true
            },
            take: 5
        });
        
        console.log('\n📋 Exemples de demandes:');
        exemples.forEach(req => {
            console.log(`- ID: ${req.id} | Status: ${req.status} | Parent: ${req.parentFirstName} ${req.parentLastName}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugStatus();