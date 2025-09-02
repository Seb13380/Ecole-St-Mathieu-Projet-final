const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActualites() {
    try {
        const actualites = await prisma.actualite.findMany({
            where: { visible: true },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true, role: true }
                }
            },
            orderBy: [
                { important: 'desc' },
                { datePublication: 'desc' }
            ]
        });

        console.log('=== ACTUALITÉS TROUVÉES ===');
        actualites.forEach((actualite, index) => {
            console.log(`\n--- Actualité ${index + 1} ---`);
            console.log(`Titre: ${actualite.titre}`);
            console.log(`Auteur: ${actualite.auteur.firstName} ${actualite.auteur.lastName}`);
            console.log(`Date: ${actualite.datePublication}`);
            console.log(`Contenu (${actualite.contenu.length} caractères):`);
            console.log(actualite.contenu.substring(0, 200) + '...');
            console.log(`Contenu complet: "${actualite.contenu}"`);
        });

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkActualites();
