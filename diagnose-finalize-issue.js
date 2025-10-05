const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseFinalizeIssue() {
    console.log('🔍 === DIAGNOSTIC PROBLÈME FINALISATION LIONEL ===\n');

    try {
        // 1. Vérifier s'il y a des demandes ACCEPTED (prêtes pour finalisation)
        const acceptedRequests = await prisma.preInscriptionRequest.findMany({
            where: {
                status: 'ACCEPTED'
            },
            orderBy: {
                processedAt: 'desc'
            }
        });

        console.log(`📊 Demandes ACCEPTED (prêtes pour finalisation): ${acceptedRequests.length}`);

        if (acceptedRequests.length === 0) {
            console.log('\n❌ PROBLÈME IDENTIFIÉ: Aucune demande en statut ACCEPTED');
            console.log('   Les demandes doivent d\'abord être acceptées par Lionel depuis la page des demandes d\'inscription');
            console.log('   URL: https://www.stmathieu.org/directeur/inscriptions');
            console.log('\n🔧 SOLUTION:');
            console.log('   1. Lionel doit aller sur /directeur/inscriptions');
            console.log('   2. Cliquer sur "Approuver" pour chaque demande');
            console.log('   3. Ensuite les demandes apparaîtront sur /directeur/rendez-vous-inscriptions');
        } else {
            console.log('\n✅ Demandes prêtes pour finalisation:');
            acceptedRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.parentFirstName} ${req.parentLastName} (${req.parentEmail})`);
                console.log(`   Acceptée le: ${req.processedAt?.toLocaleString('fr-FR') || 'Non renseigné'}`);
                console.log(`   Par: ID ${req.processedBy || 'Non renseigné'}`);
            });
        }

        // 2. Vérifier les demandes PENDING qui attendent d'être acceptées
        const pendingRequests = await prisma.preInscriptionRequest.findMany({
            where: {
                status: 'PENDING'
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        console.log(`\n📋 Demandes PENDING (en attente d'approbation): ${pendingRequests.length}`);

        if (pendingRequests.length > 0) {
            console.log('\n⏳ Demandes en attente d\'approbation par Lionel:');
            pendingRequests.forEach((req, index) => {
                console.log(`${index + 1}. ${req.parentFirstName} ${req.parentLastName} (${req.parentEmail})`);
                console.log(`   Soumise le: ${req.submittedAt.toLocaleString('fr-FR')}`);
                console.log(`   Email validé: ${req.emailValidated ? '✅' : '❌'}`);
            });
        }

        // 3. Vérifier les inscriptions déjà finalisées
        const completedRequests = await prisma.preInscriptionRequest.findMany({
            where: {
                status: 'COMPLETED'
            },
            orderBy: {
                processedAt: 'desc'
            },
            take: 5
        });

        console.log(`\n✅ Inscriptions finalisées récentes: ${completedRequests.length}`);
        completedRequests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.parentFirstName} ${req.parentLastName} (${req.parentEmail})`);
            console.log(`   Finalisée le: ${req.processedAt?.toLocaleString('fr-FR') || 'Non renseigné'}`);
        });

        // 4. Vérifier les permissions de Lionel
        const lionel = await prisma.user.findFirst({
            where: {
                email: 'l.camboulives@stmathieu.org'
            }
        });

        console.log('\n👤 Informations Lionel:');
        if (lionel) {
            console.log(`   Nom: ${lionel.firstName} ${lionel.lastName}`);
            console.log(`   Rôle: ${lionel.role}`);
            console.log(`   Compte créé: ${lionel.createdAt.toLocaleString('fr-FR')}`);
            console.log(`   Mot de passe: ${lionel.password ? 'Défini ✅' : 'Non défini ❌'}`);
        } else {
            console.log('   ❌ Compte Lionel non trouvé');
        }

        // 5. Résumé et recommandations
        console.log('\n🎯 === RÉSUMÉ DIAGNOSTIC ===');

        if (acceptedRequests.length === 0 && pendingRequests.length > 0) {
            console.log('🔧 PROBLÈME: Les demandes sont en PENDING, pas en ACCEPTED');
            console.log('📋 SOLUTION: Lionel doit d\'abord approuver les demandes');
            console.log('   1. Se connecter: https://www.stmathieu.org/auth/login');
            console.log('   2. Aller sur: https://www.stmathieu.org/directeur/inscriptions');
            console.log('   3. Cliquer "Approuver" sur chaque demande');
            console.log('   4. Ensuite aller sur: https://www.stmathieu.org/directeur/rendez-vous-inscriptions');
            console.log('   5. Cliquer "Finaliser l\'inscription" sur chaque demande');
        } else if (acceptedRequests.length > 0) {
            console.log('✅ STATUT: Demandes prêtes pour finalisation');
            console.log('📍 URL: https://www.stmathieu.org/directeur/rendez-vous-inscriptions');
            console.log(`   ${acceptedRequests.length} demande(s) à finaliser`);
        } else {
            console.log('ℹ️ STATUT: Aucune demande en cours de traitement');
        }

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseFinalizeIssue().catch(console.error);