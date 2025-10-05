const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function activateYamina() {
    try {
        await prisma.user.update({
            where: { email: 'ecole-saint-mathieu@wanadoo.fr' },
            data: { isActive: true }
        });
        console.log('✅ Compte Yamina activé');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

activateYamina();