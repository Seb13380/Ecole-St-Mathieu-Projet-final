const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLionelRole() {
    try {
        const user = await prisma.user.findFirst({
            where: { firstName: 'Lionel' }
        });

        if (user) {
            console.log('👤 Utilisateur Lionel trouvé:');
            console.log('   Email:', user.email);
            console.log('   Rôle:', user.role);
            console.log('   ID:', user.id);

            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(user.role)) {
                console.log('⚠️  Lionel n\'a pas les droits pour gérer les élèves');
                console.log('💡 Rôles requis: DIRECTION ou GESTIONNAIRE_SITE');
            } else {
                console.log('✅ Lionel a les droits nécessaires');
            }
        } else {
            console.log('❌ Utilisateur Lionel non trouvé');
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLionelRole();
