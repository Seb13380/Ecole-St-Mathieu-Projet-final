const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHeroImages() {
    try {
        const heroImages = await prisma.heroCarousel.findMany();
        console.log('Images hero carousel:', heroImages);

        const carouselImages = await prisma.carouselImage.findMany();
        console.log('Images carousel normal:', carouselImages);
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkHeroImages();
