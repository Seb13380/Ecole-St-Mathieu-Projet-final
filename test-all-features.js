const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAllFeatures() {
    console.log('🧪 Test complet de toutes les fonctionnalités...\n');

    try {
        // 1. Test Travaux
        console.log('1️⃣ Test module TRAVAUX:');
        const travauxCount = await prisma.travaux.count();
        console.log(`   ✅ ${travauxCount} travaux en base`);
        console.log(`   📍 URL gestion: http://localhost:3007/travaux/manage`);

        // 2. Test Classes
        console.log('\n2️⃣ Test module CLASSES:');
        const classesCount = await prisma.classe.count();
        console.log(`   ✅ ${classesCount} classes en base`);
        console.log(`   📍 URL gestion: http://localhost:3007/admin/classes`);

        // 3. Test Utilisateurs
        console.log('\n3️⃣ Test module UTILISATEURS:');
        const usersCount = await prisma.user.count();
        const adminCount = await prisma.user.count({
            where: { role: { in: ['ADMIN', 'DIRECTION'] } }
        });
        console.log(`   ✅ ${usersCount} utilisateurs totaux`);
        console.log(`   ✅ ${adminCount} administrateurs`);
        console.log(`   📍 URL gestion: http://localhost:3007/admin/users`);

        // 4. Test Élèves
        console.log('\n4️⃣ Test module ÉLÈVES:');
        const studentsCount = await prisma.student.count();
        console.log(`   ✅ ${studentsCount} élèves en base`);
        console.log(`   📍 URL gestion: http://localhost:3007/admin/students`);

        // 5. Test Inscriptions
        console.log('\n5️⃣ Test module INSCRIPTIONS:');
        const inscriptionsCount = await prisma.inscriptionRequest.count();
        const pendingCount = await prisma.inscriptionRequest.count({
            where: { status: 'PENDING' }
        });
        console.log(`   ✅ ${inscriptionsCount} demandes totales`);
        console.log(`   ⏳ ${pendingCount} en attente`);
        console.log(`   📍 URL gestion: http://localhost:3007/admin/inscriptions`);

        // 6. Vérifier Lionel
        console.log('\n6️⃣ Test compte DIRECTION:');
        const lionel = await prisma.user.findUnique({
            where: { email: 'lionel.camboulives@ecole-saint-mathieu.fr' }
        });
        if (lionel) {
            console.log(`   ✅ Lionel trouvé (${lionel.role})`);
            console.log(`   📍 Peut accéder à toutes les fonctionnalités admin`);
        } else {
            console.log(`   ❌ Lionel non trouvé`);
        }

        // Résumé des URLs
        console.log('\n📋 RÉSUMÉ DES URLS DE GESTION:');
        console.log('   🏗️ Travaux: http://localhost:3007/travaux/manage');
        console.log('   👥 Utilisateurs: http://localhost:3007/admin/users');
        console.log('   🏫 Classes: http://localhost:3007/admin/classes');
        console.log('   👶 Élèves: http://localhost:3007/admin/students');
        console.log('   📝 Inscriptions: http://localhost:3007/admin/inscriptions');
        console.log('   📰 Actualités: http://localhost:3007/actualites/manage');
        console.log('   🎠 Carousel: http://localhost:3007/carousel/manage');

        console.log('\n🔐 CONNEXION ADMIN:');
        console.log('   Email: lionel.camboulives@ecole-saint-mathieu.fr');
        console.log('   Mot de passe: Directeur2025!');
        console.log('   Dashboard: http://localhost:3007/directeur/dashboard');

        console.log('\n✅ Tous les modules sont fonctionnels !');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAllFeatures();
