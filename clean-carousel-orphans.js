const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanOrphanImages() {
    try {
        console.log('🧹 Nettoyage des images orphelines...');

        // Récupérer toutes les images du carousel
        const carouselImages = await prisma.carouselImage.findMany();

        console.log(`📸 ${carouselImages.length} images trouvées dans la base`);

        for (const image of carouselImages) {
            const imagePath = path.join(__dirname, 'public/uploads/carousel', image.filename);

            if (!fs.existsSync(imagePath)) {
                console.log(`❌ Fichier manquant: ${image.filename} - Suppression de la base...`);

                await prisma.carouselImage.delete({
                    where: { id: image.id }
                });

                console.log(`🗑️ Image supprimée de la base: ${image.filename}`);
            } else {
                console.log(`✅ Fichier OK: ${image.filename}`);
            }
        }

        console.log('✨ Nettoyage terminé !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanOrphanImages();
