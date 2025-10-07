const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAllTables() {
    try {
        console.log('=== DEBUG TOUTES LES TABLES ===');
        
        // Vérifier toutes les tables possibles
        console.log('\n🔍 Recherche dans toutes les tables...');
        
        try {
            const inscriptions = await prisma.inscriptionRequest.findMany({
                select: {
                    id: true,
                    status: true,
                    parentFirstName: true,
                    parentLastName: true
                },
                take: 5
            });
            console.log(`📊 inscriptionRequest: ${inscriptions.length} demandes`);
            inscriptions.forEach(req => console.log(`- ID: ${req.id} | ${req.parentFirstName} ${req.parentLastName} | Status: ${req.status}`));
        } catch (e) {
            console.log('❌ inscriptionRequest:', e.message);
        }
        
        try {
            const preInscriptions = await prisma.preInscriptionRequest.findMany({
                select: {
                    id: true,
                    status: true,
                    parentFirstName: true,
                    parentLastName: true
                },
                take: 5
            });
            console.log(`📊 preInscriptionRequest: ${preInscriptions.length} demandes`);
            preInscriptions.forEach(req => console.log(`- ID: ${req.id} | ${req.parentFirstName} ${req.parentLastName} | Status: ${req.status}`));
        } catch (e) {
            console.log('❌ preInscriptionRequest:', e.message);
        }
        
        try {
            const dossiers = await prisma.dossierInscription.findMany({
                select: {
                    id: true,
                    status: true,
                    nomEnfant: true,
                    prenomEnfant: true
                },
                take: 5
            });
            console.log(`📊 dossierInscription: ${dossiers.length} dossiers`);
            dossiers.forEach(req => console.log(`- ID: ${req.id} | ${req.prenomEnfant} ${req.nomEnfant} | Status: ${req.status}`));
        } catch (e) {
            console.log('❌ dossierInscription:', e.message);
        }

    } catch (error) {
        console.error('❌ Erreur globale:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugAllTables();