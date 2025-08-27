const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
    try {
        const email = 'sebastien.giordano@ecole-saint-mathieu.fr';
        const newPassword = 'admin123';

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword },
            select: { id: true, email: true, firstName: true, lastName: true, role: true }
        });

        console.log('✅ Mot de passe réinitialisé pour:');
        console.log('- Utilisateur:', updatedUser.firstName, updatedUser.lastName);
        console.log('- Email:', updatedUser.email);
        console.log('- Rôle:', updatedUser.role);
        console.log('- Nouveau mot de passe:', newPassword);

        console.log('\n=== Test maintenant ===');
        console.log('1. Allez sur: http://localhost:3007/login');
        console.log(`2. Email: ${updatedUser.email}`);
        console.log(`3. Mot de passe: ${newPassword}`);
        console.log('4. Puis testez: http://localhost:3007/documents/admin');

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword();
