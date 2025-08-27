const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestActualite() {
    try {
        console.log('🆕 Création d\'une actualité de test...');

        // Récupérer un utilisateur DIRECTION ou ADMIN pour l'auteur
        const auteur = await prisma.user.findFirst({
            where: {
                role: { in: ['DIRECTION', 'ADMIN'] }
            }
        });

        if (!auteur) {
            console.log('❌ Aucun utilisateur DIRECTION ou ADMIN trouvé');
            return;
        }

        const actualite = await prisma.actualite.create({
            data: {
                titre: 'Test Actualité avec Média',
                contenu: 'Ceci est une actualité de test pour vérifier que le système fonctionne correctement. Les médias peuvent maintenant être attachés aux actualités.',
                auteurId: auteur.id,
                important: true,
                visible: true,
                datePublication: new Date(),
                // On ne met pas de média pour l'instant car c'est juste un test
                mediaUrl: null,
                mediaType: null
            }
        });

        console.log('✅ Actualité de test créée:', actualite);

        // Vérifier le compte total d'actualités
        const count = await prisma.actualite.count();
        console.log('📊 Total actualités dans la base:', count);

    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'actualité de test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestActualite();
