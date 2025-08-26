const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testHeroCarouselAccess() {
    try {
        console.log('🎠 Test d\'accès Hero Carousel Management...\n');

        // Test pour Lionel (DIRECTION)
        const lionel = await prisma.user.findUnique({
            where: { email: 'lionel.camboulives@ecole-saint-mathieu.fr' }
        });

        if (lionel) {
            console.log('👤 Lionel Camboulives:');
            console.log(`   Rôle: ${lionel.role}`);
            console.log(`   Accès Hero Carousel: ${['DIRECTION', 'ADMIN'].includes(lionel.role) ? '✅ Autorisé' : '❌ Refusé'}`);
        }

        // Test pour Frank (MAINTENANCE_SITE)
        const frank = await prisma.user.findUnique({
            where: { email: 'frank.maintenance@ecole-saint-mathieu.fr' }
        });

        if (frank) {
            console.log('\n👤 Frank (Maintenance):');
            console.log(`   Rôle: ${frank.role}`);
            console.log(`   Accès Hero Carousel: ${['MAINTENANCE_SITE', 'ADMIN'].includes(frank.role) ? '✅ Autorisé' : '❌ Refusé'}`);
        }

        // Vérifier les tables
        const heroCarouselCount = await prisma.heroCarousel.count();
        const carouselCount = await prisma.carouselImage.count();

        console.log('\n📊 État des tables:');
        console.log(`   Hero Carousel: ${heroCarouselCount} images`);
        console.log(`   Carousel normal: ${carouselCount} images`);

        console.log('\n🌐 URLs à tester:');
        console.log('   Hero Carousel: http://localhost:3007/hero-carousel/management');
        console.log('   Carousel normal: http://localhost:3007/carousel/manage');

        console.log('\n✅ Pour tester l\'accès:');
        console.log('   1. Connexion: http://localhost:3007/auth/login');
        console.log('   2. Email: lionel.camboulives@ecole-saint-mathieu.fr');
        console.log('   3. Mot de passe: Directeur2025!');
        console.log('   4. Puis aller sur: http://localhost:3007/hero-carousel/management');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testHeroCarouselAccess();
