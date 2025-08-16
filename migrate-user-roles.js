const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateUserRoles() {
    console.log('🔄 Migration des rôles d\'utilisateurs...\n');

    try {
        // Étape 1: Vérifier s'il y a des utilisateurs avec les anciens rôles
        console.log('1. Vérification des utilisateurs avec anciens rôles...');

        const secretaires = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM User WHERE role = 'SECRETAIRE_DIRECTION'
        `;

        const restauration = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM User WHERE role = 'RESTAURATION'
        `;

        console.log(`   SECRETAIRE_DIRECTION: ${secretaires[0].count} utilisateur(s)`);
        console.log(`   RESTAURATION: ${restauration[0].count} utilisateur(s)`);

        // Étape 2: Migrer les utilisateurs vers les nouveaux rôles
        if (secretaires[0].count > 0) {
            console.log('\n2. Migration SECRETAIRE_DIRECTION → ASSISTANT_DIRECTION...');
            await prisma.$executeRaw`
                UPDATE User 
                SET role = 'ASSISTANT_DIRECTION' 
                WHERE role = 'SECRETAIRE_DIRECTION'
            `;
            console.log('   ✅ Migration terminée');
        }

        if (restauration[0].count > 0) {
            console.log('\n3. Migration RESTAURATION → MAINTENANCE_SITE...');
            await prisma.$executeRaw`
                UPDATE User 
                SET role = 'MAINTENANCE_SITE' 
                WHERE role = 'RESTAURATION'
            `;
            console.log('   ✅ Migration terminée');
        }

        console.log('\n🎉 Migration des rôles terminée avec succès!');
        console.log('\nVous pouvez maintenant exécuter:');
        console.log('npx prisma migrate dev --name "add_carousel_image_model"');

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

migrateUserRoles();
