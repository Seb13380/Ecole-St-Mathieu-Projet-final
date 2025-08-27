const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPasswords() {
    try {
        console.log('=== RÉINITIALISATION MOTS DE PASSE VPS ===\n');

        // Mots de passe simples pour les tests
        const lionelPassword = 'lionel123';
        const frankPassword = 'frank123';

        // Hash des mots de passe
        const lionelHash = await bcrypt.hash(lionelPassword, 10);
        const frankHash = await bcrypt.hash(frankPassword, 10);

        // Mise à jour Lionel
        const lionelUpdate = await prisma.user.update({
            where: { email: 'l.camboulives@stmathieu.org' },
            data: { password: lionelHash },
            select: { id: true, email: true, firstName: true, lastName: true, role: true }
        });

        console.log('✅ LIONEL mis à jour:');
        console.log('  - Email:', lionelUpdate.email);
        console.log('  - Nom:', lionelUpdate.firstName, lionelUpdate.lastName);
        console.log('  - Rôle:', lionelUpdate.role);
        console.log('  - Nouveau mot de passe:', lionelPassword);

        // Mise à jour Frank
        const frankUpdate = await prisma.user.update({
            where: { email: 'frank@stmathieu.org' },
            data: { password: frankHash },
            select: { id: true, email: true, firstName: true, lastName: true, role: true }
        });

        console.log('\n✅ FRANK mis à jour:');
        console.log('  - Email:', frankUpdate.email);
        console.log('  - Nom:', frankUpdate.firstName, frankUpdate.lastName);
        console.log('  - Rôle:', frankUpdate.role);
        console.log('  - Nouveau mot de passe:', frankPassword);

        console.log('\n=== INFORMATIONS DE CONNEXION ===');
        console.log('🔐 LIONEL:');
        console.log('   Email: l.camboulives@stmathieu.org');
        console.log('   Mot de passe: lionel123');
        console.log('   Rôle: DIRECTION (accès complet)');

        console.log('\n🔐 FRANK:');
        console.log('   Email: frank@stmathieu.org');
        console.log('   Mot de passe: frank123');
        console.log('   Rôle: GESTIONNAIRE_SITE (accès admin)');

        console.log('\n📝 NOTE: Ces mots de passe sont temporaires pour les tests.');
        console.log('   Pensez à les changer après la première connexion.');

    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPasswords();
