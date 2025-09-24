const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInscriptionManagement() {
    console.log('🔍 Analyse du système de gestion des inscriptions...\n');

    try {
        // 1. Vérifier les données dans les deux tables
        const preInscriptions = await prisma.preInscriptionRequest.findMany({
            select: {
                id: true,
                status: true,
                submittedAt: true,
                parentFirstName: true,
                parentLastName: true,
                children: true
            },
            orderBy: { submittedAt: 'desc' }
        });

        const dossierInscriptions = await prisma.dossierInscription.findMany({
            select: {
                id: true,
                statut: true,
                dateDepot: true,
                pereNom: true,
                perePrenom: true,
                mereNom: true,
                merePrenom: true,
                enfantPrenom: true,
                enfantNom: true
            },
            orderBy: { dateDepot: 'desc' }
        });

        console.log('📊 PRÉ-INSCRIPTIONS dans PreInscriptionRequest:');
        preInscriptions.forEach(req => {
            const children = Array.isArray(req.children) ? req.children : [];
            const childInfo = children.length > 0 ?
                `${children[0].firstName} ${children[0].lastName}` : 'Aucun enfant';
            console.log(`   ID ${req.id}: ${childInfo} (Parent: ${req.parentFirstName} ${req.parentLastName}) - Status: ${req.status}`);
        });

        console.log('\n📊 DOSSIERS dans DossierInscription:');
        dossierInscriptions.forEach(req => {
            const parentName = `${req.perePrenom || ''} ${req.pereNom || ''} / ${req.merePrenom || ''} ${req.mereNom || ''}`.trim();
            console.log(`   ID ${req.id}: ${req.enfantPrenom} ${req.enfantNom} (Parents: ${parentName}) - Status: ${req.statut}`);
        });

        // 2. Analyser le problème ID 28
        console.log('\n🔎 Analyse spécifique de l\'ID 28:');

        const preInscription28 = await prisma.preInscriptionRequest.findUnique({
            where: { id: 28 }
        });

        const dossierInscription28 = await prisma.dossierInscription.findUnique({
            where: { id: 28 }
        });

        console.log(`   Dans PreInscriptionRequest: ${preInscription28 ? 'TROUVÉ' : 'PAS TROUVÉ'}`);
        console.log(`   Dans DossierInscription: ${dossierInscription28 ? 'TROUVÉ' : 'PAS TROUVÉ'}`);

        // 3. Proposer une solution unified
        console.log('\n💡 SOLUTION PROPOSÉE:');
        console.log('   1. Créer une vue unifiée qui combine les deux tables');
        console.log('   2. Mettre à jour le contrôleur pour gérer les deux sources de données');
        console.log('   3. Adapter la logique de suppression selon le type de demande');

        return {
            preInscriptions,
            dossierInscriptions,
            totalInscriptions: preInscriptions.length + dossierInscriptions.length
        };

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        throw error;
    }
}

checkInscriptionManagement()
    .then(result => {
        console.log(`\n✅ Analyse terminée: ${result.totalInscriptions} inscriptions totales`);
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });