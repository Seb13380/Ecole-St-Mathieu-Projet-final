const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-poppler');

const prisma = new PrismaClient();

async function convertExistingMenus() {
    try {
        console.log('🔄 Début de la conversion des menus existants...');

        // Récupérer tous les menus qui n'ont pas d'images
        const menusWithoutImages = await prisma.menu.findMany({
            where: {
                pdfUrl: { not: null },
                imageUrls: null
            }
        });

        console.log(`📝 ${menusWithoutImages.length} menu(s) à convertir`);

        const imageDir = path.join(__dirname, 'public/assets/images/menus');

        // Créer le dossier d'images s'il n'existe pas
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
            console.log('📁 Dossier images/menus créé');
        }

        for (const menu of menusWithoutImages) {
            try {
                console.log(`🖼️ Conversion du menu "${menu.semaine}"...`);

                const pdfFilename = path.basename(menu.pdfUrl);
                const pdfPath = path.join(__dirname, 'public/assets/documents/menus', pdfFilename);

                // Vérifier que le fichier PDF existe
                if (!fs.existsSync(pdfPath)) {
                    console.warn(`⚠️ Fichier PDF non trouvé: ${pdfPath}`);
                    continue;
                }

                const options = {
                    format: 'jpeg',
                    out_dir: imageDir,
                    out_prefix: path.parse(pdfFilename).name,
                    page: null // toutes les pages
                };

                const pages = await pdf.convert(pdfPath, options);
                console.log(`📸 ${pages.length} page(s) convertie(s)`);

                // Générer les URLs des images
                const imageUrls = [];
                pages.forEach((page, index) => {
                    const imageName = `${path.parse(pdfFilename).name}-${index + 1}.jpg`;
                    imageUrls.push(`/assets/images/menus/${imageName}`);
                });

                // Mettre à jour le menu avec les URLs des images
                await prisma.menu.update({
                    where: { id: menu.id },
                    data: {
                        imageUrls: JSON.stringify(imageUrls)
                    }
                });

                console.log(`✅ Menu "${menu.semaine}" converti avec succès`);

            } catch (error) {
                console.error(`❌ Erreur lors de la conversion du menu "${menu.semaine}":`, error);
            }
        }

        console.log('🎉 Conversion terminée !');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter la conversion
convertExistingMenus();
