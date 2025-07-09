const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testAdminLogin() {
    try {
        console.log('🔐 Test de connexion admin...');

        const admin = await prisma.user.findUnique({
            where: { email: 'admin@stmathieu.fr' }
        });

        if (!admin) {
            console.log('❌ Admin non trouvé');
            return;
        }

        console.log('✅ Admin trouvé:', admin.email, '| Rôle:', admin.role);

        // Test du mot de passe
        const passwordValid = await bcrypt.compare('admin123', admin.password);
        console.log('🔑 Mot de passe valide:', passwordValid);

        if (passwordValid) {
            console.log('✅ Connexion admin simulée avec succès');
            console.log('👤 Données utilisateur pour session:');
            console.log({
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role
            });
        } else {
            console.log('❌ Mot de passe incorrect');
        }

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminLogin();
