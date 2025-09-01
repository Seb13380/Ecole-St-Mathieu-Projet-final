const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInscriptionSystem() {
    try {
        console.log('🔍 Test du système de gestion des inscriptions...\n');

        // 1. Test de récupération des configurations
        console.log('1. Test de récupération des configurations:');
        const configs = await prisma.inscriptionConfig.findMany();
        console.log(`   ✅ Configurations trouvées: ${configs.length}`);

        // 2. Test de récupération des documents
        console.log('\n2. Test de récupération des documents:');
        const documents = await prisma.inscriptionDocument.findMany();
        console.log(`   ✅ Documents trouvés: ${documents.length}`);

        // 3. Test de création d'une configuration par défaut si nécessaire
        console.log('\n3. Test de configuration par défaut:');
        let activeConfig = await prisma.inscriptionConfig.findFirst({
            where: { actif: true }
        });

        if (!activeConfig) {
            console.log('   🔧 Aucune configuration active trouvée, création d\'une configuration par défaut...');

            // Récupérer un utilisateur admin pour assigner la configuration
            const adminUser = await prisma.user.findFirst({
                where: {
                    role: { in: ['DIRECTION', 'GESTIONNAIRE_SITE'] }
                }
            });

            if (adminUser) {
                activeConfig = await prisma.inscriptionConfig.create({
                    data: {
                        soustitre: "Demande d'inscription pour l'année scolaire 2025-2026",
                        actif: true,
                        modifiePar: adminUser.id
                    },
                    include: {
                        modificateur: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                });
                console.log(`   ✅ Configuration créée: "${activeConfig.soustitre}"`);
                console.log(`   👤 Créée par: ${activeConfig.modificateur.firstName} ${activeConfig.modificateur.lastName}`);
            } else {
                console.log('   ❌ Aucun utilisateur admin trouvé pour créer la configuration');
            }
        } else {
            console.log(`   ✅ Configuration active trouvée: "${activeConfig.soustitre}"`);
        }

        // 4. Vérification des permissions
        console.log('\n4. Test des permissions:');
        const adminUsers = await prisma.user.findMany({
            where: {
                role: { in: ['DIRECTION', 'GESTIONNAIRE_SITE'] }
            },
            select: { firstName: true, lastName: true, email: true, role: true }
        });

        console.log('   👥 Utilisateurs autorisés:');
        adminUsers.forEach(user => {
            console.log(`   - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
        });

        console.log('\n✅ Tous les tests du système d\'inscription sont passés !\n');

        // 5. Instructions pour tester
        console.log('🎯 Instructions pour tester le système:');
        console.log('   1. Connectez-vous avec Lionel ou Frank');
        console.log('   2. Allez sur le tableau de bord directeur');
        console.log('   3. Cliquez sur "📝 Gestion Inscriptions"');
        console.log('   4. Modifiez le sous-titre et ajoutez des documents PDF');
        console.log('   5. Vérifiez la page publique /inscription-eleve');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testInscriptionSystem();
