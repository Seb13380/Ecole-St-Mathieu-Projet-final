const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabase() {
    try {
        console.log('🔍 Vérification de la base de données...');

        // Tester la connexion
        await prisma.$connect();
        console.log('✅ Connexion à la base de données établie');

        // Vérifier les tables principales
        const tables = [
            { name: 'User', model: prisma.user },
            { name: 'Student', model: prisma.student },
            { name: 'Classe', model: prisma.classe },
            { name: 'InscriptionRequest', model: prisma.inscriptionRequest },
            { name: 'Actualite', model: prisma.actualite },
            { name: 'Travaux', model: prisma.travaux }
        ];

        for (const table of tables) {
            try {
                const count = await table.model.count();
                console.log(`✅ Table ${table.name}: ${count} enregistrements`);
            } catch (error) {
                console.log(`❌ Erreur table ${table.name}:`, error.message);
            }
        }

        // Vérifier l'utilisateur Lionel
        const lionel = await prisma.user.findUnique({
            where: { email: 'lionel.camboulives@ecole-saint-mathieu.fr' }
        });

        if (lionel) {
            console.log('✅ Compte Lionel trouvé:', lionel.firstName, lionel.lastName, '- Rôle:', lionel.role);
        } else {
            console.log('❌ Compte Lionel non trouvé');
        }

        // Vérifier les demandes d'inscription
        const inscriptions = await prisma.inscriptionRequest.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        console.log(`✅ Demandes d'inscription: ${inscriptions.length} trouvées`);

        console.log('\n🎉 Vérification terminée !');

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    verifyDatabase();
}

module.exports = { verifyDatabase };
