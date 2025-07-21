const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function restoreUsers() {
    console.log('🔧 Restauration des utilisateurs corrects...');

    try {
        // 1. Mettre à jour le compte directeur avec les bonnes informations
        console.log('👑 Mise à jour du compte directeur...');

        // Supprimer l'ancien compte direction
        await prisma.user.deleteMany({
            where: {
                email: 'direction@stmathieu.fr'
            }
        });

        // Créer le bon compte directeur
        const hashedDirecteurPassword = await bcrypt.hash('StMathieu2025!', 10);
        const directeur = await prisma.user.create({
            data: {
                firstName: 'Lionel',
                lastName: 'CAMBOULIVES',
                email: 'l.camboulives@orange.fr',
                password: hashedDirecteurPassword,
                role: 'DIRECTEUR',
                phone: '04 42 27 91 16',
                adress: 'École Saint-Mathieu'
            }
        });
        console.log('✅ Compte directeur créé:', directeur.email);

        // 2. Créer le compte Frank pour la maintenance
        console.log('🔧 Création du compte Frank...');
        const hashedFrankPassword = await bcrypt.hash('frank2025', 10);
        const frank = await prisma.user.create({
            data: {
                firstName: 'Frank',
                lastName: 'MAINTENANCE',
                email: 'frank@stmathieu.fr',
                password: hashedFrankPassword,
                role: 'MAINTENANCE_SITE',
                phone: '04 42 27 91 16',
                adress: 'École Saint-Mathieu'
            }
        });
        console.log('✅ Compte Frank créé:', frank.email);

        console.log('\n🎉 Restauration terminée !');
        console.log('📧 Comptes disponibles :');
        console.log('👑 Directeur: l.camboulives@orange.fr / StMathieu2025!');
        console.log('🔧 Frank: frank@stmathieu.fr / frank2025');
        console.log('⚙️ Admin: admin@stmathieu.fr / admin123');

    } catch (error) {
        console.error('❌ Erreur lors de la restauration:', error);
    } finally {
        await prisma.$disconnect();
    }
}

restoreUsers();
