const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugHeroCarousel() {
    try {
        console.log('=== DEBUG HERO CAROUSEL ===');

        // Vérifier les images hero carousel
        const heroImages = await prisma.heroCarousel.findMany({
            where: { active: true },
            orderBy: { ordre: 'asc' },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        console.log('Images Hero Carousel trouvées:', heroImages.length);
        heroImages.forEach((img, index) => {
            console.log(`${index + 1}. ${img.filename} - Titre: ${img.titre || 'N/A'} - Ordre: ${img.ordre} - Auteur: ${img.auteur?.firstName || 'N/A'} ${img.auteur?.lastName || ''}`);
        });

        // Vérifier les images carousel normal
        const carouselImages = await prisma.carouselImage.findMany({
            where: { active: true },
            orderBy: { ordre: 'asc' },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        console.log('\nImages Carousel normal trouvées:', carouselImages.length);
        carouselImages.forEach((img, index) => {
            console.log(`${index + 1}. ${img.filename} - Titre: ${img.titre || 'N/A'} - Ordre: ${img.ordre} - Auteur: ${img.auteur?.firstName || 'N/A'} ${img.auteur?.lastName || ''}`);
        });

    } catch (error) {
        console.error('Erreur lors du debug:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugHeroCarousel();
