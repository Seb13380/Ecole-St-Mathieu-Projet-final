const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true
            }
        });

        console.log('👥 Utilisateurs dans la base:');
        users.forEach(user => {
            console.log(`${user.id} - ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
        });

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Erreur:', error);
        await prisma.$disconnect();
    }
}

listUsers();
