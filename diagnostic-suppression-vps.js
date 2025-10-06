// Diagnostic suppression inscriptions VPS
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnosticSuppression() {
    console.log('🗑️ DIAGNOSTIC SUPPRESSION INSCRIPTIONS VPS');
    console.log('='.repeat(50));

    try {
        // 1. Vérifier les demandes d'inscription
        console.log('\n📊 ÉTAT DES DEMANDES:');

        const preInscriptions = await prisma.preInscriptionRequest.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const dossierInscriptions = await prisma.dossierInscription.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log(`📝 PreInscriptionRequest: ${preInscriptions.length} (affichage des 5 dernières)`);
        preInscriptions.forEach(req => {
            console.log(`   ID: ${req.id} - ${req.nom} ${req.prenom} - Statut: ${req.statut}`);
        });

        console.log(`📋 DossierInscription: ${dossierInscriptions.length} (affichage des 5 dernières)`);
        dossierInscriptions.forEach(req => {
            console.log(`   ID: ${req.id} - ${req.nom} ${req.prenom} - Statut: ${req.statut}`);
        });

        // 2. Test de suppression simulé
        console.log('\n🧪 TEST DE SUPPRESSION SIMULÉ:');

        if (preInscriptions.length > 0) {
            const testId = preInscriptions[0].id;
            console.log(`Test avec ID: ${testId} (${preInscriptions[0].nom})`);

            try {
                // Vérifier si l'enregistrement existe
                const exists = await prisma.preInscriptionRequest.findUnique({
                    where: { id: testId }
                });

                console.log(`   Existe dans PreInscriptionRequest: ${exists ? '✅ OUI' : '❌ NON'}`);

                // Test de suppression en mode dry-run
                console.log('   ⚠️  Test en mode lecture seule - aucune suppression réelle');

            } catch (error) {
                console.error('   ❌ Erreur lors du test:', error.message);
            }
        }

        // 3. Vérifier les permissions et middlewares
        console.log('\n🔐 VÉRIFICATION PERMISSIONS:');
        console.log('   Routes de suppression:');
        console.log('   - DELETE /secretaire/inscriptions/:id/delete');
        console.log('   - DELETE /directeur/inscriptions/:id/delete');
        console.log('   ');
        console.log('   Middlewares requis:');
        console.log('   - requireAuth');
        console.log('   - requireAdmin ou requireDirection');
        console.log('   - Role SECRETAIRE_DIRECTION autorisé');

        // 4. Vérifier les logs d'erreur récents
        console.log('\n📋 CONSEILS DE DIAGNOSTIC:');
        console.log('   1. Vérifier les logs PM2: pm2 logs');
        console.log('   2. Vérifier les erreurs console navigateur (F12)');
        console.log('   3. Tester avec curl:');
        console.log('      curl -X DELETE http://votre-domaine/secretaire/inscriptions/[ID]/delete');
        console.log('   4. Vérifier que l\'utilisateur est bien connecté avec le bon rôle');

        // 5. Test de connexion base de données
        console.log('\n🔗 TEST CONNEXION BASE:');
        const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
        console.log(`   Connexion base: ${testQuery ? '✅ OK' : '❌ ERREUR'}`);

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

diagnosticSuppression();