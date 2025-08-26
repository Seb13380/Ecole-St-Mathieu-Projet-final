// Script pour ajouter quelques images de carrousel de test
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleCarouselImages() {
    try {
        console.log('🎠 Création d\'images de carrousel de test...');

        // Récupérer Lionel comme auteur
        const lionel = await prisma.user.findUnique({
            where: { email: 'lionel.camboulives@ecole-saint-mathieu.fr' }
        });

        if (!lionel) {
            console.log('❌ Lionel non trouvé, impossible de créer les images');
            return;
        }

        // Images du petit carrousel avec les noms d'images existants
        const carouselImages = [
            {
                filename: '20250326_114849.jpg',
                titre: 'École Saint-Mathieu',
                description: 'Vue de notre belle école',
                ordre: 1
            },
            {
                filename: '20250326_114954.jpg',
                titre: 'Activités scolaires',
                description: 'Nos élèves en pleine activité',
                ordre: 2
            },
            {
                filename: '47d2b2f0-69d4-4913-b80c-5da660a12e2e.jpg',
                titre: 'Cour de récréation',
                description: 'Espace de jeu et de détente',
                ordre: 3
            },
            {
                filename: '20250514_114720.jpg',
                titre: 'Environnement scolaire',
                description: 'Cadre propice à l\'apprentissage',
                ordre: 4
            }
        ];

        for (const imageData of carouselImages) {
            const existingImage = await prisma.carouselImage.findFirst({
                where: { filename: imageData.filename }
            });

            if (!existingImage) {
                await prisma.carouselImage.create({
                    data: {
                        ...imageData,
                        originalUrl: imageData.filename,
                        active: true,
                        auteurId: lionel.id
                    }
                });
                console.log(`✅ Image carrousel créée: ${imageData.titre}`);
            } else {
                console.log(`⚠️ Image déjà existante: ${imageData.titre}`);
            }
        }

        // Images du hero carrousel (grand carrousel)
        const heroCarouselImages = [
            {
                filename: '20250710_124427.jpg',
                titre: 'Bienvenue à l\'École Saint-Mathieu',
                description: 'Une école d\'excellence pour vos enfants',
                ordre: 1
            },
            {
                filename: '20250710_123601.jpg',
                titre: 'Vie scolaire enrichissante',
                description: 'Accompagnement personnalisé de chaque élève',
                ordre: 2
            },
            {
                filename: 'entreePrincipale.jpg',
                titre: 'Entrée principale',
                description: 'Accueil chaleureux dans notre établissement',
                ordre: 3
            },
            {
                filename: '20250710_123943.jpg',
                titre: 'Cadre moderne',
                description: 'Équipements récents pour l\'apprentissage',
                ordre: 4
            }
        ];

        for (const imageData of heroCarouselImages) {
            const existingImage = await prisma.heroCarousel.findFirst({
                where: { filename: imageData.filename }
            });

            if (!existingImage) {
                await prisma.heroCarousel.create({
                    data: {
                        ...imageData,
                        originalUrl: imageData.filename,
                        active: true,
                        auteurId: lionel.id
                    }
                });
                console.log(`✅ Image hero carrousel créée: ${imageData.titre}`);
            } else {
                console.log(`⚠️ Image hero déjà existante: ${imageData.titre}`);
            }
        }

        console.log('\n🎉 Images de carrousel créées avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la création des images:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createSampleCarouselImages()
    .then(() => {
        console.log('\n✅ Script terminé avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });
