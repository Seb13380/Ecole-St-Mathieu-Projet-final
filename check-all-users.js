const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllUsers() {
    try {
        console.log('ðŸ” VÃ©rification complÃ¨te des utilisateurs...');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        });

        console.log('\nðŸ‘¥ UTILISATEURS TROUVÃ‰S:', users.length);
        console.log('');
        users.forEach(user => {
            console.log(`ðŸ“§ ${user.email}`);
            console.log(`ðŸ‘¤ ${user.firstName} ${user.lastName}`);
            console.log(`ðŸ” RÃ´le: ${user.role}`);
            console.log('------------------------------------------');
        });

        console.log('\nðŸ“‹ INFORMATIONS DE CONNEXION:');
        console.log('');
        users.forEach(user => {
            let password = 'Inconnu';
            if (user.firstName === 'SÃ©bastien') password = 'Paul37266';
            if (user.firstName === 'Lionel') password = 'Lionel123!';
            if (user.firstName === 'Frank') password = 'Frank123!';
            if (user.firstName === 'Yamina') password = 'Yamina123!';

            console.log(`Email: ${user.email} | Mot de passe: ${password}`);
        });

    } catch (error) {
        console.error('âŒ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllUsers();

