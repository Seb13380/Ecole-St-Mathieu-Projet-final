const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreateClasse() {
    try {
        console.log('🧪 Test de création de classe avec le nouveau schéma...');

        // Test de création d'une classe
        const nouvelleClasse = await prisma.classe.create({
            data: {
                nom: 'Test CM1',
                niveau: 'CM1',
                anneeScolaire: '2025-2026',
                enseignantId: null // Optionnel
            }
        });

        console.log('✅ Classe créée avec succès !');
        console.log('📋 Détails de la classe:');
        console.log({
            id: nouvelleClasse.id,
            nom: nouvelleClasse.nom,
            niveau: nouvelleClasse.niveau,
            anneeScolaire: nouvelleClasse.anneeScolaire,
            enseignantId: nouvelleClasse.enseignantId
        });

        // Vérifier que la classe existe
        const classeTrouvee = await prisma.classe.findUnique({
            where: { id: nouvelleClasse.id }
        });

        if (classeTrouvee) {
            console.log('✅ Classe trouvée dans la base : OK');
        } else {
            console.log('❌ Classe non trouvée dans la base');
        }

        // Nettoyer le test
        await prisma.classe.delete({
            where: { id: nouvelleClasse.id }
        });
        console.log('🗑️ Classe de test supprimée');

        console.log('\n🎉 SCHÉMA SIMPLIFIÉ OPÉRATIONNEL !');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateClasse();
