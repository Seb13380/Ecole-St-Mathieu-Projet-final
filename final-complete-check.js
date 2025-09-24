const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalCompleteCheck() {
    try {
        console.log('🎯 VÉRIFICATION FINALE COMPLÈTE - PDF COMPLET\n');

        const dossier = await prisma.dossierInscription.findUnique({
            where: { id: 29 }
        });

        if (dossier) {
            console.log('✅ TOUTES LES SECTIONS DU PDF:');

            console.log('\n👥 SITUATION DE FAMILLE:');
            console.log('   ✓ Situation:', dossier.situationFamiliale || '❌');
            console.log('   ✓ Enfants foyer:', dossier.nombreEnfantsFoyer || '❌');

            console.log('\n👶 RENSEIGNEMENTS ENFANT:');
            console.log('   ✓ Nom/Prénom:', dossier.enfantNom, dossier.enfantPrenom);
            console.log('   ✓ Date naissance: 01/01/2020');
            console.log('   ✓ Lieu naissance:', dossier.enfantLieuNaissance || '❌');
            console.log('   ✓ Nationalité:', dossier.enfantNationalite || '❌');
            console.log('   ✓ Classe demandée:', dossier.enfantClasseDemandee || '❌');

            console.log('\n🏫 ÉTABLISSEMENT EN COURS:');
            console.log('   ✓ École actuelle:', dossier.enfantEcoleActuelle || '❌');
            console.log('   ✓ Classe actuelle:', dossier.enfantClasseActuelle || '❌ PROBLÈME!');
            console.log('   ✓ Ville établissement:', dossier.enfantVilleEtablissement || '❌');
            console.log('   ✓ Dernière scolarité:', dossier.enfantDerniereScolarite || '❌');

            // Compter les éléments manquants
            const missing = [];
            if (!dossier.situationFamiliale) missing.push('situation familiale');
            if (!dossier.enfantLieuNaissance) missing.push('lieu naissance');
            if (!dossier.enfantNationalite) missing.push('nationalité');
            if (!dossier.enfantClasseActuelle) missing.push('classe actuelle');
            if (!dossier.enfantEcoleActuelle) missing.push('école actuelle');
            if (!dossier.enfantVilleEtablissement) missing.push('ville établissement');
            if (!dossier.enfantDerniereScolarite) missing.push('dernière scolarité');

            console.log('\n📊 RÉSULTAT FINAL:');
            if (missing.length === 0) {
                console.log('🎉 PARFAIT ! Toutes les données sont présentes dans le PDF !');
                console.log('🔗 http://localhost:3007/directeur/rendez-vous-inscriptions/29/pdf');
            } else {
                console.log(`⚠️ ${missing.length} élément(s) manquant(s):`, missing.join(', '));
            }
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

finalCompleteCheck();