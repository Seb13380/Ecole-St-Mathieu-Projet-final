const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCompleteData() {
    try {
        console.log('=== VÉRIFICATION COMPLÈTE DES DONNÉES ===\n');

        // Vérifier DossierInscription
        const dossier = await prisma.dossierInscription.findUnique({
            where: { id: 29 }
        });

        if (dossier) {
            console.log('✅ DOSSIER DÉTAILLÉ TROUVÉ (ID 29)\n');

            console.log('👥 SITUATION DE FAMILLE:');
            console.log('   - Situation familiale:', dossier.situationFamiliale || 'MANQUANT ❌');
            console.log('   - Nombre d\'enfants foyer:', dossier.nombreEnfantsFoyer || 'MANQUANT ❌');
            console.log('   - Informations famille:', dossier.informationsFamille || 'MANQUANT ❌');

            console.log('\n👶 RENSEIGNEMENTS ENFANT:');
            console.log('   - Nom/Prénom:', dossier.enfantNom, dossier.enfantPrenom);
            console.log('   - Date naissance:', dossier.enfantDateNaissance);
            console.log('   - Lieu naissance:', dossier.enfantLieuNaissance || 'MANQUANT ❌');
            console.log('   - Nationalité:', dossier.enfantNationalite || 'MANQUANT ❌');
            console.log('   - Sexe:', dossier.enfantSexe);
            console.log('   - Classe demandée:', dossier.enfantClasseDemandee);

            console.log('\n🏢 ÉTABLISSEMENT EN COURS:');
            console.log('   - École actuelle:', dossier.enfantEcoleActuelle || 'MANQUANT ❌');
            console.log('   - Ville établissement:', dossier.enfantVilleEtablissement || 'MANQUANT ❌');
            console.log('   - Dernière scolarité:', dossier.enfantDerniereScolarite || 'MANQUANT ❌');

            console.log('\n👨‍👩‍👧 PARENTS:');
            console.log('   - Père:', dossier.perePrenom, dossier.pereNom, '-', dossier.pereEmail);
            console.log('   - Mère:', dossier.merePrenom, dossier.mereNom, '-', dossier.mereEmail);

            // Compter les données manquantes
            let manquant = 0;
            if (!dossier.situationFamiliale) manquant++;
            if (!dossier.enfantLieuNaissance) manquant++;
            if (!dossier.enfantNationalite) manquant++;
            if (!dossier.enfantEcoleActuelle) manquant++;
            if (!dossier.enfantVilleEtablissement) manquant++;
            if (!dossier.enfantDerniereScolarite) manquant++;

            console.log('\n📊 RÉSUMÉ:');
            if (manquant === 0) {
                console.log('🎉 TOUTES LES DONNÉES SONT PRÉSENTES !');
                console.log('🔗 PDF complet disponible: http://localhost:3007/directeur/inscriptions/29/pdf');
            } else {
                console.log(`⚠️  ${manquant} donnée(s) manquante(s) détectée(s)`);
            }

        } else {
            console.log('❌ Aucun dossier détaillé trouvé pour ID 29');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyCompleteData();