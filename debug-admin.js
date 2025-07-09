const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAdmin() {
    try {
        console.log('🔍 Diagnostic des utilisateurs admin...');

        // Récupérer tous les utilisateurs
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        console.log('\n📋 Liste des utilisateurs:');
        users.forEach(user => {
            console.log(`- ${user.email} | ${user.role} | ${user.firstName} ${user.lastName}`);
        });

        // Vérifier spécifiquement l'admin
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@stmathieu.fr' }
        });

        if (admin) {
            console.log('\n✅ Admin trouvé:');
            console.log('ID:', admin.id);
            console.log('Email:', admin.email);
            console.log('Rôle:', admin.role);
            console.log('Nom complet:', admin.firstName, admin.lastName);
        } else {
            console.log('\n❌ Aucun admin trouvé avec l\'email admin@stmathieu.fr');
        }

        // Compter les admins
        const adminCount = await prisma.user.count({
            where: {
                role: {
                    in: ['ADMIN', 'DIRECTION']
                }
            }
        });

        console.log(`\n📊 Nombre total d'administrateurs: ${adminCount}`);

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugAdmin();
