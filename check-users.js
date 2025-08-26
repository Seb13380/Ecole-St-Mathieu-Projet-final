const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: 'frank' } },
                    { firstName: { contains: 'Frank' } },
                    { email: { contains: 'lionel' } },
                    { firstName: { contains: 'Lionel' } },
                    { role: 'DIRECTION' }
                ]
            },
            select: {
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });

        console.log('Utilisateurs avec accès aux actualités:');
        console.table(users);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
