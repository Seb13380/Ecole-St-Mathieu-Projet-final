const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        console.log('🔍 Vérification des comptes Frank et Lionel...');

        const frank = await prisma.user.findFirst({
            where: { firstName: 'Frank' },
            select: { id: true, firstName: true, lastName: true, email: true, role: true }
        });

        const lionel = await prisma.user.findFirst({
            where: { firstName: 'Lionel' },
            select: { id: true, firstName: true, lastName: true, email: true, role: true }
        });

        console.log('👤 Frank:', frank);
        console.log('👤 Lionel:', lionel);

        // Vérifier aussi les routes et permissions
        console.log('\n📋 Analyse des rôles:');
        console.log('Frank role:', frank?.role);
        console.log('Lionel role:', lionel?.role);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
