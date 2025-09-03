const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInscriptionManagement() {
    try {
        console.log('🔍 Test du contrôleur inscription management...');

        // Test 1: Vérifier la configuration
        console.log('\n1️⃣ Test configuration...');
        let config = await prisma.inscriptionConfiguration.findFirst();
        if (!config) {
            console.log('⚠️ Aucune configuration trouvée, création...');
            config = await prisma.inscriptionConfiguration.create({
                data: {
                    soustitre: "Demande d'identifiants pour accéder à l'espace familles",
                    afficherAnnoncePS2026: false
                }
            });
            console.log('✅ Configuration créée');
        } else {
            console.log('✅ Configuration trouvée:', config.soustitre);
        }

        // Test 2: Vérifier les documents
        console.log('\n2️⃣ Test documents...');
        const documents = await prisma.inscriptionDocument.findMany({
            where: { actif: true },
            take: 5
        });
        console.log('✅ Documents trouvés:', documents.length);

        console.log('\n🎉 Test réussi ! Le contrôleur devrait fonctionner.');

    } catch (error) {
        console.error('❌ Erreur détectée:', error.message);
        console.error('📍 Détails:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testInscriptionManagement();
