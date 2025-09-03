const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        console.log('=== RECHERCHE DES UTILISATEURS FRANK ET LIONEL ===');
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { firstName: 'Frank' },
                    { firstName: 'Lionel' },
                    { email: { contains: 'frank' } },
                    { email: { contains: 'lionel' } }
                ]
            }
        });

        console.log('Utilisateurs trouvés:', JSON.stringify(users, null, 2));

        if (users.length > 0) {
            for (const user of users) {
                console.log(`\n=== DÉTAILS ${user.firstName.toUpperCase()} ===`);
                console.log(`ID: ${user.id}`);
                console.log(`Nom: ${user.firstName} ${user.lastName}`);
                console.log(`Email: ${user.email}`);
                console.log(`Rôle: ${user.role}`);
                console.log(`Créé le: ${user.createdAt}`);
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
