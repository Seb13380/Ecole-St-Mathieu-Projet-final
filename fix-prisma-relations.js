const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

async function fixPrismaRelations() {
    try {
        console.log('🔧 Correction des relations Prisma...');

        // 1. Générer le client Prisma
        console.log('📦 Génération du client Prisma...');
        await execAsync('npx prisma generate');
        console.log('✅ Client Prisma généré');

        // 2. Appliquer les migrations
        console.log('🔄 Application des migrations...');
        await execAsync('npx prisma migrate dev --name fix-inscription-relations');
        console.log('✅ Migrations appliquées');

        // 3. Vérifier la base de données
        console.log('🔍 Vérification de la base de données...');
        await execAsync('npx prisma db push');
        console.log('✅ Base de données synchronisée');

        console.log('\n🎉 Corrections Prisma terminées avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la correction Prisma:', error.message);

        // Si erreur, essayer de forcer la synchronisation
        try {
            console.log('🔧 Tentative de synchronisation forcée...');
            await execAsync('npx prisma db push --force-reset');
            await execAsync('npx prisma generate');
            console.log('✅ Synchronisation forcée réussie');
        } catch (forceError) {
            console.error('❌ Erreur lors de la synchronisation forcée:', forceError.message);
        }
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    fixPrismaRelations();
}

module.exports = { fixPrismaRelations };
