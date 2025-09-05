const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log(`Utilisateurs trouvés: ${users.length}`);

        users.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });

    } catch (error) {
        console.error('Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
