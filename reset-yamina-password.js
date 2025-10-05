const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetYaminaPassword() {
    console.log('🔧 === RÉINITIALISATION MOT DE PASSE YAMINA ===\n');

    try {
        const newPassword = 'Secretaire123!';
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const updatedUser = await prisma.user.update({
            where: {
                email: 'ecole-saint-mathieu@wanadoo.fr'
            },
            data: {
                password: hashedPassword
            }
        });

        console.log('✅ Mot de passe de Yamina réinitialisé !');
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Nouveau mot de passe: ${newPassword}`);
        console.log(`   Rôle: ${updatedUser.role}`);

        console.log('\n🔑 Informations de connexion:');
        console.log('   URL: http://localhost:3007/auth/login');
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Mot de passe: ${newPassword}`);

        console.log('\n📍 Après connexion, accédez à:');
        console.log('   http://localhost:3007/secretaire/dashboard');

    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetYaminaPassword().catch(console.error);