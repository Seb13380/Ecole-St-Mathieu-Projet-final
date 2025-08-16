const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestActualite() {
    try {
        console.log('📰 Création d\'une actualité de test...');

        // Récupérer un utilisateur avec les droits
        const user = await prisma.user.findFirst({
            where: {
                role: 'DIRECTION'
            }
        });

        if (!user) {
            console.log('❌ Aucun utilisateur DIRECTION trouvé');
            return;
        }

        // Créer une actualité de test
        const actualite = await prisma.actualite.create({
            data: {
                titre: 'Test des boutons de gestion',
                contenu: 'Cette actualité sert à tester les boutons modifier, supprimer et visibilité',
                auteurId: user.id,
                important: true,
                visible: true,
                datePublication: new Date()
            },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true, role: true }
                }
            }
        });

        console.log(`✅ Actualité créée: "${actualite.titre}" par ${actualite.auteur.firstName} ${actualite.auteur.lastName}`);

        // Afficher le nombre total d'actualités
        const total = await prisma.actualite.count();
        console.log(`📊 Total actualités: ${total}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestActualite();
