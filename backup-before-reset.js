const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function backupData() {
    console.log('💾 Sauvegarde des données avant reset...\n');

    try {
        // Sauvegarder les utilisateurs ADMIN et DIRECTION
        const adminUsers = await prisma.user.findMany({
            where: {
                role: { in: ['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'] }
            }
        });

        // Sauvegarder les classes
        const classes = await prisma.classe.findMany();

        // Sauvegarder les parents récents (ceux de l'import)
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            orderBy: { createdAt: 'desc' },
            take: 50 // Garder les 50 derniers parents
        });

        const backup = {
            adminUsers,
            classes,
            parents,
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync('backup-before-reset.json', JSON.stringify(backup, null, 2));

        console.log('✅ Sauvegarde créée:');
        console.log(`   - Admins/Direction: ${adminUsers.length}`);
        console.log(`   - Classes: ${classes.length}`);
        console.log(`   - Parents récents: ${parents.length}`);
        console.log('   - Fichier: backup-before-reset.json');

        console.log('\n🚨 ATTENTION: Le reset va supprimer TOUTES les données!');
        console.log('   Mais on pourra restaurer les admins et classes avec ce backup.');
        console.log('\n🚀 Pour procéder au reset:');
        console.log('   npx prisma migrate reset --force');

    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
    } finally {
        await prisma.$disconnect();
    }
}

backupData();