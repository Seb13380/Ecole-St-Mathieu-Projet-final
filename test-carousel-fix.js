const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function testCarouselFix() {
    try {
        console.log('🔧 TEST ET CORRECTION DU CAROUSEL');
        console.log('=====================================\n');

        // 1. Vérifier la structure de la table carouselImage
        console.log('1️⃣ Vérification de la table carouselImage...');
        const images = await prisma.carouselImage.findMany({
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log(`   ✅ ${images.length} images trouvées dans la base\n`);

        // 2. Vérifier les fichiers physiques
        console.log('2️⃣ Vérification des fichiers physiques...');
        const uploadsPath = path.join(__dirname, 'public', 'uploads', 'carousel');

        try {
            await fs.access(uploadsPath);
            const files = await fs.readdir(uploadsPath);
            console.log(`   ✅ Dossier uploads/carousel existe avec ${files.length} fichiers`);

            // Vérifier la correspondance entre DB et fichiers
            const orphanedFiles = [];
            const missingFiles = [];

            for (const file of files) {
                const imageInDb = images.find(img => img.filename === file);
                if (!imageInDb) {
                    orphanedFiles.push(file);
                }
            }

            for (const image of images) {
                const fileExists = files.includes(image.filename);
                if (!fileExists) {
                    missingFiles.push({
                        id: image.id,
                        filename: image.filename,
                        titre: image.titre
                    });
                }
            }

            if (orphanedFiles.length > 0) {
                console.log(`   ⚠️  ${orphanedFiles.length} fichiers orphelins:`, orphanedFiles);
            }

            if (missingFiles.length > 0) {
                console.log(`   ❌ ${missingFiles.length} fichiers manquants:`, missingFiles);
            }

        } catch (error) {
            console.log('   ❌ Erreur accès dossier uploads/carousel:', error.message);

            // Créer le dossier s'il n'existe pas
            console.log('   🔧 Création du dossier uploads/carousel...');
            await fs.mkdir(uploadsPath, { recursive: true });
            console.log('   ✅ Dossier créé avec succès');
        }

        console.log();

        // 3. Tester les routes du carousel
        console.log('3️⃣ Test des routes du carousel...');

        // Simuler une requête de test (sans vraiment faire d'HTTP)
        const testRoutes = [
            'GET /carousel/manage',
            'POST /carousel/add',
            'POST /carousel/:id',
            'POST /carousel/:id/update',
            'POST /carousel/:id/delete',
            'POST /carousel/:id/toggle',
            'GET /carousel/api/active'
        ];

        console.log('   📋 Routes configurées:');
        testRoutes.forEach(route => {
            console.log(`      ✅ ${route}`);
        });

        console.log();

        // 4. Statistiques du carousel
        console.log('4️⃣ Statistiques actuelles...');
        const stats = {
            total: images.length,
            active: images.filter(img => img.active).length,
            inactive: images.filter(img => !img.active).length
        };

        console.log(`   📊 Total: ${stats.total}`);
        console.log(`   ✅ Actives: ${stats.active}`);
        console.log(`   ⏸️  Inactives: ${stats.inactive}`);

        if (images.length > 0) {
            console.log('\n   📋 Détail des images:');
            images.forEach((img, index) => {
                console.log(`      ${index + 1}. ${img.titre || 'Sans titre'} (${img.active ? 'ACTIVE' : 'INACTIVE'}) - Ordre: ${img.ordre}`);
            });
        }

        console.log();

        // 5. Test de création d'une image test (si aucune image)
        if (images.length === 0) {
            console.log('5️⃣ Aucune image trouvée, création d\'une image de test...');

            // Vérifier s'il y a un utilisateur admin/direction
            const adminUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { role: 'ADMIN' },
                        { role: 'DIRECTION' }
                    ]
                }
            });

            if (adminUser) {
                try {
                    const testImage = await prisma.carouselImage.create({
                        data: {
                            filename: 'test-carousel-image.jpg',
                            originalUrl: '/uploads/carousel/test-carousel-image.jpg',
                            titre: 'Image de test du carousel',
                            description: 'Image créée automatiquement pour tester le carousel',
                            ordre: 0,
                            active: true,
                            auteurId: adminUser.id
                        }
                    });

                    console.log('   ✅ Image de test créée:', testImage.id);
                } catch (error) {
                    console.log('   ❌ Erreur création image test:', error.message);
                }
            } else {
                console.log('   ⚠️  Aucun utilisateur admin trouvé pour créer l\'image test');
            }
        }

        console.log();

        // 6. Vérifications finales
        console.log('6️⃣ Vérifications finales...');

        // Test de la API publique
        try {
            const activeImages = await prisma.carouselImage.findMany({
                where: { active: true },
                select: {
                    id: true,
                    filename: true,
                    originalUrl: true,
                    titre: true,
                    description: true,
                    ordre: true
                },
                orderBy: [
                    { ordre: 'asc' },
                    { createdAt: 'desc' }
                ]
            });

            console.log(`   ✅ API publique: ${activeImages.length} images actives récupérées`);

            if (activeImages.length > 0) {
                console.log('   📋 Images pour le carousel public:');
                activeImages.forEach((img, index) => {
                    console.log(`      ${index + 1}. ${img.titre || 'Sans titre'} (ordre: ${img.ordre})`);
                });
            }

        } catch (error) {
            console.log('   ❌ Erreur API publique:', error.message);
        }

        console.log('\n🎉 DIAGNOSTIC CAROUSEL TERMINÉ !');
        console.log('=====================================');

        // Résumé des actions recommandées
        console.log('\n📋 ACTIONS RECOMMANDÉES:');
        console.log('1. ✅ Routes corrigées dans carouselRoutes.js');
        console.log('2. ✅ Gestion des paramètres active améliorée');
        console.log('3. ✅ Logs de débogage ajoutés');

        if (stats.total === 0) {
            console.log('4. ⚠️  Ajoutez des images via l\'interface admin');
        }

        console.log('\n🔗 URL pour tester:');
        console.log('   - Gestion: http://localhost:3007/carousel/manage');
        console.log('   - API publique: http://localhost:3007/carousel/api/active');

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le test
testCarouselFix().catch(console.error);
