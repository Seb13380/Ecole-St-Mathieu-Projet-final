const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllUsers() {
    try {
        console.log('🔍 Vérification complète des utilisateurs...');

        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        });

        console.log('\n👥 UTILISATEURS TROUVÉS:', users.length);
        console.log('==========================================');
        users.forEach(user => {
            console.log(`📧 ${user.email}`);
            console.log(`👤 ${user.firstName} ${user.lastName}`);
            console.log(`🔐 Rôle: ${user.role}`);
            console.log('------------------------------------------');
        });

        console.log('\n📋 INFORMATIONS DE CONNEXION:');
        console.log('==========================================');
        users.forEach(user => {
            let password = 'Inconnu';
            if (user.firstName === 'Sébastien') password = 'Paul37266';
            if (user.firstName === 'Lionel') password = 'Lionel123!';
            if (user.firstName === 'Frank') password = 'Frank123!';
            if (user.firstName === 'Yamina') password = 'Yamina123!';

            console.log(`Email: ${user.email} | Mot de passe: ${password}`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllUsers();
