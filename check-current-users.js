// Vérifier les utilisateurs actuels
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log('👥 Utilisateurs actuels dans la base:');

        if (users.length === 0) {
            console.log('Aucun utilisateur trouvé.');
        } else {
            users.forEach(u => {
                console.log(`- ${u.firstName} ${u.lastName} (${u.email}) - ${u.role}`);
            });
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
