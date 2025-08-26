const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleActualites() {
    try {
        // Récupérer l'ID de Lionel
        const lionel = await prisma.user.findFirst({
            where: { email: 'lionel.camboulives@ecole-saint-mathieu.fr' }
        });

        if (!lionel) {
            console.log('❌ Lionel non trouvé');
            return;
        }

        // Créer des actualités de test
        const actualites = [
            {
                titre: "Rentrée scolaire 2025",
                contenu: "La rentrée aura lieu le lundi 2 septembre 2025. Les listes de fournitures sont disponibles sur le site.",
                auteurId: lionel.id,
                important: true,
                visible: true,
                datePublication: new Date('2025-07-15')
            },
            {
                titre: "Inscriptions ouvertes",
                contenu: "Les inscriptions pour l'année scolaire 2025-2026 sont ouvertes. Contactez le secrétariat pour plus d'informations.",
                auteurId: lionel.id,
                important: false,
                visible: true,
                datePublication: new Date('2025-07-10')
            },
            {
                titre: "Nouveaux équipements",
                contenu: "L'école s'équipe de nouveaux tableaux numériques interactifs dans toutes les classes.",
                auteurId: lionel.id,
                important: false,
                visible: true,
                datePublication: new Date('2025-08-01')
            },
            {
                titre: "Fête de l'école",
                contenu: "La fête de l'école aura lieu le samedi 15 juin 2025. Venez nombreux !",
                auteurId: lionel.id,
                important: false,
                visible: false, // Masquée pour test
                datePublication: new Date('2025-05-15')
            }
        ];

        for (const actualite of actualites) {
            await prisma.actualite.create({
                data: actualite
            });
            console.log(`✅ Actualité créée: ${actualite.titre}`);
        }

        console.log('🎉 Toutes les actualités de test ont été créées !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createSampleActualites();
