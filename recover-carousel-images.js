const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function cleanAndRecoverCarousel() {
    try {
        console.log('🧹 NETTOYAGE ET RÉCUPÉRATION DU CAROUSEL');
        console.log('=========================================\n');

        const uploadsPath = path.join(__dirname, 'public', 'uploads', 'carousel');

        // 1. Lister tous les fichiers orphelins
        const files = await fs.readdir(uploadsPath);
        console.log(`📁 ${files.length} fichiers trouvés dans uploads/carousel\n`);

        // 2. Récupérer un utilisateur admin pour les images
        const adminUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { role: 'ADMIN' },
                    { role: 'DIRECTION' },
                    { role: 'GESTIONNAIRE_SITE' }
                ]
            }
        });

        if (!adminUser) {
            console.log('❌ Aucun utilisateur admin trouvé !');
            return;
        }

        console.log(`👤 Utilisateur admin trouvé: ${adminUser.firstName} ${adminUser.lastName}\n`);

        // 3. Traiter chaque fichier orphelin
        let recovered = 0;
        let deleted = 0;
        let errors = 0;

        for (const filename of files) {
            try {
                // Ignorer le fichier test créé précédemment
                if (filename === 'test-carousel-image.jpg') {
                    console.log(`⏭️  Ignorer fichier test: ${filename}`);
                    continue;
                }

                const filePath = path.join(uploadsPath, filename);
                const stats = await fs.stat(filePath);

                // Vérifier si l'image n'existe pas déjà en DB
                const existingImage = await prisma.carouselImage.findFirst({
                    where: { filename: filename }
                });

                if (existingImage) {
                    console.log(`✅ Image déjà en DB: ${filename}`);
                    continue;
                }

                // Générer un titre basé sur le nom du fichier
                const titre = filename
                    .replace(/\.[^/.]+$/, '') // Enlever extension
                    .replace(/carousel-\d+-\d+/, 'Image carousel')
                    .replace(/[_-]/g, ' ')
                    .replace(/^\w/, c => c.toUpperCase());

                // Créer l'entrée en base de données
                const newImage = await prisma.carouselImage.create({
                    data: {
                        filename: filename,
                        originalUrl: `/uploads/carousel/${filename}`,
                        titre: titre.length > 3 ? titre : `Image carousel ${recovered + 1}`,
                        description: `Image récupérée automatiquement le ${new Date().toLocaleDateString('fr-FR')}`,
                        ordre: recovered, // Ordre séquentiel
                        active: false, // Inactif par défaut pour permettre la vérification manuelle
                        auteurId: adminUser.id
                    }
                });

                console.log(`🔄 Récupéré: ${filename} → ID ${newImage.id} (${newImage.titre})`);
                recovered++;

            } catch (error) {
                console.log(`❌ Erreur avec ${filename}: ${error.message}`);
                errors++;
            }
        }

        console.log('\n📊 RÉSULTATS:');
        console.log(`✅ Images récupérées: ${recovered}`);
        console.log(`❌ Erreurs: ${errors}\n`);

        // 4. Vérification finale
        const allImages = await prisma.carouselImage.findMany({
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { ordre: 'asc' }
        });

        console.log('📋 IMAGES DANS LA BASE:');
        allImages.forEach((img, index) => {
            const status = img.active ? '🟢 ACTIVE' : '🔴 INACTIVE';
            console.log(`   ${index + 1}. ${img.titre} ${status} (ordre: ${img.ordre})`);
            console.log(`      📁 ${img.filename}`);
            console.log(`      👤 Par: ${img.auteur.firstName} ${img.auteur.lastName}\n`);
        });

        console.log('🎯 PROCHAINES ÉTAPES:');
        console.log('1. Connectez-vous à l\'interface admin: http://localhost:3007/carousel/manage');
        console.log('2. Vérifiez chaque image récupérée');
        console.log('3. Modifiez les titres et descriptions selon vos besoins');
        console.log('4. Activez les images que vous souhaitez afficher');
        console.log('5. Ajustez l\'ordre d\'affichage si nécessaire');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter la récupération
cleanAndRecoverCarousel().catch(console.error);
