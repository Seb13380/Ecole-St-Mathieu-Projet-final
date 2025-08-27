const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDbConnection() {
    try {
        console.log('🔄 Test de connexion à la base...');

        // Test inscription requests
        const requests = await prisma.inscriptionRequest.findMany({
            include: {
                reviewer: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('✅ Connexion DB OK - Demandes trouvées:', requests.length);

        if (requests.length > 0) {
            console.log('📋 Première demande:');
            console.log('   ID:', requests[0].id);
            console.log('   Parent:', requests[0].parentFirstName, requests[0].parentLastName);
            console.log('   Status:', requests[0].status);
            console.log('   Date:', requests[0].createdAt);

            // Test parse children
            let children = [];
            try {
                if (typeof requests[0].children === 'string') {
                    children = JSON.parse(requests[0].children);
                } else {
                    children = requests[0].children || [];
                }
                console.log('   Enfants:', children.length);
            } catch (e) {
                console.log('   ❌ Erreur parsing enfants:', e.message);
            }
        }

        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Erreur DB:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testDbConnection();
