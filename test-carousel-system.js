const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function testCarouselSystem() {
    console.log('🎠 Test du système de gestion du carrousel...\n');

    try {
        // 1. Vérifier que la table CarouselImage existe
        console.log('1. Vérification de la table CarouselImage...');
        const carouselImages = await prisma.carouselImage.findMany();
        console.log('✅ Table CarouselImage accessible');
        console.log(`   Images existantes: ${carouselImages.length}`);

        // 2. Vérifier le dossier de stockage
        console.log('\n2. Vérification du dossier de stockage...');
        const storageDir = path.join(__dirname, 'public', 'assets', 'images', 'carousel');

        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
            console.log('✅ Dossier de stockage créé:', storageDir);
        } else {
            console.log('✅ Dossier de stockage existe:', storageDir);
        }

        // 3. Lister les fichiers existants
        const files = fs.readdirSync(storageDir);
        console.log(`   Fichiers dans le dossier: ${files.length}`);
        files.forEach(file => console.log(`   - ${file}`));

        // 4. Vérifier les utilisateurs avec les rôles appropriés
        console.log('\n3. Vérification des utilisateurs autorisés...');
        const authorizedUsers = await prisma.user.findMany({
            where: {
                role: {
                    in: ['DIRECTION', 'MAINTENANCE_SITE']
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                email: true
            }
        });

        console.log(`✅ Utilisateurs autorisés trouvés: ${authorizedUsers.length}`);
        authorizedUsers.forEach(user => {
            console.log(`   - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
        });

        // 5. Tester l'API des images actives
        console.log('\n4. Test des images actives...');
        const activeImages = await prisma.carouselImage.findMany({
            where: { active: true },
            orderBy: { ordre: 'asc' },
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        console.log(`✅ Images actives: ${activeImages.length}`);
        activeImages.forEach((image, index) => {
            console.log(`   ${index + 1}. ${image.titre} (ordre: ${image.ordre})`);
            console.log(`      Fichier: ${image.filename}`);
            console.log(`      Auteur: ${image.auteur?.firstName} ${image.auteur?.lastName}`);
        });

        // 6. Statistiques du système
        console.log('\n5. Statistiques du système...');
        const stats = await prisma.carouselImage.groupBy({
            by: ['active'],
            _count: {
                id: true
            }
        });

        stats.forEach(stat => {
            console.log(`   Images ${stat.active ? 'actives' : 'inactives'}: ${stat._count.id}`);
        });

        console.log('\n🎉 Test du système terminé avec succès!');

        // Recommandations
        console.log('\n📋 Prochaines étapes recommandées:');
        console.log('   1. Tester l\'upload d\'images depuis les dashboards');
        console.log('   2. Vérifier les permissions d\'écriture dans le dossier');
        console.log('   3. Tester la modification/suppression d\'images');
        console.log('   4. Intégrer les images dynamiques dans home.twig');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);

        if (error.code === 'P2021') {
            console.log('\n💡 Solution: Exécutez la migration Prisma:');
            console.log('   npx prisma migrate dev');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le test
testCarouselSystem();
