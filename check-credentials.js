// Vérifier les demandes d'identifiants dans la base
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCredentials() {
    try {
        const requests = await prisma.credentialsRequest.findMany();
        console.log('📋 Demandes trouvées:', requests.length);

        requests.forEach(r => {
            console.log(`- ${r.requestedFirstName} ${r.requestedLastName}: ${r.status}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCredentials();
