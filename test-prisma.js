const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('🔍 Test de connexion Prisma...');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true
            }
        });

        console.log(`📊 ${users.length} utilisateurs trouvés :`);
        users.forEach(user => {
            console.log(`  ${user.role} - ${user.firstName} ${user.lastName} (${user.email})`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
