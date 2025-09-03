const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testClasseCreation() {
    try {
        console.log('🧪 Test de création de classe...');

        // Simuler les données du formulaire
        const testClasse = {
            nom: 'CP-TEST',
            niveau: 'CP'
        };

        console.log('📝 Données à créer:', testClasse);

        // Créer la classe
        const classe = await prisma.classe.create({
            data: testClasse
        });

        console.log('✅ Classe créée avec succès:', {
            id: classe.id,
            nom: classe.nom,
            niveau: classe.niveau
        });

        // Nettoyer (supprimer la classe de test)
        await prisma.classe.delete({
            where: { id: classe.id }
        });

        console.log('🧹 Classe de test supprimée');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);

        // Vérifier si c'est une erreur de contrainte unique
        if (error.code === 'P2002') {
            console.log('💡 Erreur de contrainte unique - la classe existe probablement déjà');

            // Essayer avec un nom différent
            try {
                const uniqueName = `CP-TEST-${Date.now()}`;
                console.log(`🔄 Nouvelle tentative avec: ${uniqueName}`);

                const classe = await prisma.classe.create({
                    data: {
                        nom: uniqueName,
                        niveau: 'CP'
                    }
                });

                console.log('✅ Classe créée avec nom unique:', classe);

                await prisma.classe.delete({
                    where: { id: classe.id }
                });

                console.log('🧹 Classe de test supprimée');

            } catch (retryError) {
                console.error('❌ Erreur lors de la seconde tentative:', retryError);
            }
        }
    } finally {
        await prisma.$disconnect();
    }
}

testClasseCreation();
