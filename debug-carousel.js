const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCarouselImages() {
    console.log('🔍 Debug des images du carrousel...\n');

    try {
        // Récupérer toutes les images du carrousel
        const allImages = await prisma.carouselImage.findMany({
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { ordre: 'asc' }
        });

        console.log(`📸 Total d'images en base: ${allImages.length}`);
        allImages.forEach((image, index) => {
            console.log(`   ${index + 1}. ${image.filename} - ${image.titre || 'Sans titre'} (${image.active ? 'ACTIVE' : 'INACTIVE'}) - Ordre: ${image.ordre}`);
        });

        // Récupérer seulement les images actives
        const activeImages = await prisma.carouselImage.findMany({
            where: { active: true },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { ordre: 'asc' }
        });

        console.log(`\n✅ Images ACTIVES: ${activeImages.length}`);
        activeImages.forEach((image, index) => {
            console.log(`   ${index + 1}. ${image.filename} - "${image.titre || 'Sans titre'}" par ${image.auteur.firstName} ${image.auteur.lastName}`);
            console.log(`      Description: ${image.description || 'Aucune'}`);
            console.log(`      Chemin: /assets/images/carousel/${image.filename}`);
        });

        // Vérifier les fichiers physiques
        const fs = require('fs');
        const path = require('path');
        const carouselDir = path.join(__dirname, 'public', 'assets', 'images', 'carousel');

        if (fs.existsSync(carouselDir)) {
            const files = fs.readdirSync(carouselDir);
            console.log(`\n📁 Fichiers physiques dans le dossier carousel: ${files.length}`);
            files.forEach(file => {
                console.log(`   - ${file}`);
            });
        } else {
            console.log('\n❌ Le dossier carousel n\'existe pas !');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

debugCarouselImages();
