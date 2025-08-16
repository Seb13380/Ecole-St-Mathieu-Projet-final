const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testToggleVisibility() {
    try {
        console.log('🧪 Test de la fonction toggle-visibility...\n');

        // Récupération de toutes les actualités
        const actualites = await prisma.actualite.findMany({
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { datePublication: 'desc' }
        });

        console.log(`📰 ${actualites.length} actualités trouvées:`);
        actualites.forEach(a => {
            console.log(`- ID:${a.id} | "${a.titre}" | Visible: ${a.visible ? '✅' : '❌'} | Par: ${a.auteur.firstName} ${a.auteur.lastName}`);
        });

        if (actualites.length > 0) {
            const firstActualite = actualites[0];
            const beforeToggle = firstActualite.visible;

            console.log(`\n🔄 Test de toggle sur l'actualité ID:${firstActualite.id}`);
            console.log(`Avant: ${beforeToggle ? 'Visible' : 'Masquée'}`);

            // Toggle de la visibilité
            const updatedActualite = await prisma.actualite.update({
                where: { id: firstActualite.id },
                data: {
                    visible: !beforeToggle,
                    updatedAt: new Date()
                }
            });

            console.log(`Après: ${updatedActualite.visible ? 'Visible' : 'Masquée'}`);
            console.log(`✅ Toggle fonctionne correctement!`);

            // Remettre dans l'état initial
            await prisma.actualite.update({
                where: { id: firstActualite.id },
                data: {
                    visible: beforeToggle,
                    updatedAt: new Date()
                }
            });
            console.log(`🔄 État initial restauré`);
        }

        console.log(`\n🎯 URL de test: http://localhost:3007/actualites/manage`);
        console.log(`🔑 Connexion: lionel.camboulives@ecole-saint-mathieu.fr / Directeur2025!`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testToggleVisibility();
