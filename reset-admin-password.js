const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
    try {
        console.log('🔐 Réinitialisation du mot de passe admin...\n');

        const newPassword = 'StMathieu2025!';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const admin = await prisma.user.update({
            where: { email: 'l.camboulives@orange.fr' },
            data: { password: hashedPassword }
        });

        console.log('✅ Mot de passe réinitialisé avec succès !');
        console.log('📧 Email: l.camboulives@orange.fr');
        console.log('🔑 Nouveau mot de passe: AdminStMathieu2024!');
        console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !');

        console.log('\n🔍 Vérification...');
        const testValid = await bcrypt.compare(newPassword, hashedPassword);
        console.log('✅ Vérification du hash:', testValid ? 'OK' : 'ERREUR');

    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword();
