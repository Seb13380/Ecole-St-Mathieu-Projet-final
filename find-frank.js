const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findFrank() {
    try {
        console.log('🔍 Recherche de Frank...');

        // Chercher tous les utilisateurs avec "frank" dans l'email ou le nom
        const frankUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: 'frank' } },
                    { firstName: { contains: 'Frank' } },
                    { lastName: { contains: 'Frank' } }
                ]
            }
        });

        console.log('👥 Utilisateurs trouvés avec "frank":', frankUsers.length);

        frankUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Rôle: ${user.role}`);
        });

        // Chercher aussi les utilisateurs avec GESTIONNAIRE_SITE
        const gestionnaires = await prisma.user.findMany({
            where: {
                role: 'GESTIONNAIRE_SITE'
            }
        });

        console.log('\n🔧 Utilisateurs avec rôle GESTIONNAIRE_SITE:', gestionnaires.length);
        gestionnaires.forEach((user, index) => {
            console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

findFrank();
