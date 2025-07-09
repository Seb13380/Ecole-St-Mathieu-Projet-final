const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTempAdmin() {
    try {
        console.log('🔐 Création d\'un administrateur temporaire...');

        // Supprimer l'ancien admin s'il existe
        await prisma.user.deleteMany({
            where: { email: 'admin@stmathieu.fr' }
        });

        const adminPassword = await bcrypt.hash('admin123', 10);

        const admin = await prisma.user.create({
            data: {
                firstName: 'Admin',
                lastName: 'Temporaire',
                email: 'admin@stmathieu.fr',
                password: adminPassword,
                phone: '01.23.45.67.89',
                adress: 'École Saint-Mathieu',
                role: 'ADMIN'
            }
        });

        console.log('🎉 Administrateur temporaire créé !');
        console.log('📧 Email: admin@stmathieu.fr');
        console.log('🔑 Mot de passe: admin123');
        console.log('⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTempAdmin();
