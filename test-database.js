const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
    try {
        console.log('🔍 Test de connexion à la base de données...');

        // Test de connexion simple
        await prisma.$connect();
        console.log('✅ Connexion à la base de données réussie !');

        // Test d'une requête simple
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Requête test réussie :', result);

        // Vérifier les tables
        const users = await prisma.user.findMany({ take: 1 });
        console.log('✅ Table users accessible, nombre d\'utilisateurs:', await prisma.user.count());

    } catch (error) {
        console.error('❌ Erreur de connexion à la base de données:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);

        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Vérifiez que Laragon/MySQL est démarré');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testDatabaseConnection();
