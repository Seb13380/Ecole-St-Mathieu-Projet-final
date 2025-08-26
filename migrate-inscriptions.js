const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateInscriptions() {
    try {
        console.log('🔄 Migration des inscriptions...');

        // Vérifier si la table existe
        const tableExists = await prisma.$queryRaw`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'inscriptionrequest'
            );
        `;

        if (!tableExists[0].exists) {
            console.log('📦 Création de la table InscriptionRequest...');

            // Exécuter la migration Prisma
            const { exec } = require('child_process');
            exec('npx prisma migrate dev --name add-inscription-requests', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Erreur migration:', error);
                    return;
                }
                console.log('✅ Table créée avec succès');
                console.log(stdout);
            });
        } else {
            console.log('✅ Table InscriptionRequest existe déjà');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateInscriptions();
