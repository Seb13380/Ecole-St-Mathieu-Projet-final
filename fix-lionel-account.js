const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixLionelAccount() {
    console.log('🔧 === CORRECTION DU COMPTE LIONEL ===\n');

    try {
        // Activer le compte de Lionel
        const lionel = await prisma.user.update({
            where: {
                email: 'l.camboulives@stmathieu.org'
            },
            data: {
                active: true
            }
        });

        console.log('✅ Compte Lionel activé avec succès !');
        console.log(`   Nom: ${lionel.firstName} ${lionel.lastName}`);
        console.log(`   Email: ${lionel.email}`);
        console.log(`   Rôle: ${lionel.role}`);
        console.log(`   Actif: ${lionel.active ? '✅' : '❌'}`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'activation du compte Lionel:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixLionelAccount().catch(console.error);