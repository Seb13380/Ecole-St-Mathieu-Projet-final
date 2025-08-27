const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log('👥 Utilisateurs existants:');
        users.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName}: ${user.email} (${user.role})`);
        });
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
