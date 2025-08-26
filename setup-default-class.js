const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDefaultClass() {
    try {
        console.log('🔄 Vérification de la classe par défaut...');

        // Vérifier si la classe "Non assigné" existe
        let defaultClasse = await prisma.classe.findFirst({
            where: { nom: 'Non assigné' }
        });

        if (!defaultClasse) {
            // Créer la classe par défaut
            defaultClasse = await prisma.classe.create({
                data: {
                    nom: 'Non assigné',
                    niveau: 'A définir',
                    anneeScolaire: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
                }
            });
            console.log('✅ Classe par défaut créée:', defaultClasse.nom);
        } else {
            console.log('✅ Classe par défaut existe déjà:', defaultClasse.nom);
        }

        console.log('🎉 Configuration terminée !');
    } catch (error) {
        console.error('❌ Erreur lors de la configuration:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    setupDefaultClass();
}

module.exports = { setupDefaultClass };
