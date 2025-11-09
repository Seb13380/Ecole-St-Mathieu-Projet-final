const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Script de conversion massive des images existantes vers WebP
// Optimise toutes les images JPG/PNG avec préservation qualité et backup

console.log('🖼️ Démarrage conversion massive vers WebP...');

const convertImagesInDirectory = async (directory) => {
    try {
        console.log(`📂 Traitement du dossier: ${directory}`);

        // Vérifier si le dossier existe
        try {
            await fs.access(directory);
        } catch (error) {
            console.log(`⚠️ Dossier inexistant: ${directory}`);
            return { converted: 0, errors: 0 };
        }

        const files = await fs.readdir(directory);
        const imageFiles = files.filter(file =>
            /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(file) &&
            !file.includes('.webp')
        );

        console.log(`📋 ${imageFiles.length} images à convertir dans ${directory}`);

        let converted = 0;
        let errors = 0;

        for (const file of imageFiles) {
            try {
                const inputPath = path.join(directory, file);
                const fileName = path.parse(file).name;
                const outputPath = path.join(directory, `${fileName}.webp`);

                // Vérifier si WebP existe déjà
                try {
                    await fs.access(outputPath);
                    console.log(`⏭️ WebP existe déjà: ${fileName}.webp`);
                    continue;
                } catch { }

                // Conversion avec Sharp
                await sharp(inputPath)
                    .rotate() // Auto-rotation selon EXIF
                    .resize({
                        width: 1200,           // Taille max pour web
                        height: 800,
                        fit: 'inside',         // Préserver ratio
                        withoutEnlargement: true
                    })
                    .webp({
                        quality: 85,           // Qualité équilibrée
                        effort: 6,             // Compression optimisée
                        progressive: true      // Chargement progressif
                    })
                    .toFile(outputPath);

                // Vérifier tailles pour statistiques
                const originalStats = await fs.stat(inputPath);
                const webpStats = await fs.stat(outputPath);
                const reduction = Math.round((1 - webpStats.size / originalStats.size) * 100);

                console.log(`✅ ${file} → ${fileName}.webp (-${reduction}%)`);
                converted++;

            } catch (error) {
                console.error(`❌ Erreur conversion ${file}:`, error.message);
                errors++;
            }
        }

        return { converted, errors, total: imageFiles.length };

    } catch (error) {
        console.error(`❌ Erreur traitement dossier ${directory}:`, error);
        return { converted: 0, errors: 1 };
    }
};

const convertAllImages = async () => {
    const directories = [
        'public/uploads/actualites',
        'public/uploads/carousel',
        'public/uploads/documents',
        'public/uploads/gallery',
        'public/uploads/inscription-documents',
        'public/assets/images'
    ];

    let totalConverted = 0;
    let totalErrors = 0;
    let totalImages = 0;

    console.log(`🚀 Conversion dans ${directories.length} dossiers...\n`);

    for (const dir of directories) {
        const result = await convertImagesInDirectory(dir);
        totalConverted += result.converted;
        totalErrors += result.errors;
        totalImages += result.total || 0;

        console.log(`📊 ${dir}: ${result.converted} converties, ${result.errors} erreurs\n`);
    }

    console.log('🎉 CONVERSION TERMINÉE !');
    console.log(`📈 Statistiques globales:`);
    console.log(`   • Total images traitées: ${totalImages}`);
    console.log(`   • Conversions réussies: ${totalConverted}`);
    console.log(`   • Erreurs: ${totalErrors}`);
    console.log(`   • Taux de réussite: ${totalImages > 0 ? Math.round((totalConverted / totalImages) * 100) : 0}%`);

    if (totalConverted > 0) {
        console.log('\n🎯 PROCHAINES ÉTAPES:');
        console.log('   1. Vérifiez les images WebP générées');
        console.log('   2. Mettez à jour vos templates pour utiliser WebP');
        console.log('   3. Testez l\'affichage sur votre site');
        console.log('   4. Supprimez les anciennes images si tout fonctionne');
    }
};

// Fonction pour nettoyer les anciens formats (à utiliser après tests)
const cleanupOldImages = async () => {
    console.log('🧹 ATTENTION: Cette fonction supprime les images originales !');
    console.log('   Utilisez-la seulement après avoir vérifié que WebP fonctionne');
    // Code de nettoyage si nécessaire
};

// Démarrer la conversion
convertAllImages().catch(error => {
    console.error('💥 Erreur critique:', error);
    process.exit(1);
});