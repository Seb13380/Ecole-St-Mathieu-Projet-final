// Test complet du dashboard
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDashboard() {
    try {
        console.log('🧪 Test des données du dashboard...\n');

        // Test 1: Compter les utilisateurs
        const userCount = await prisma.user.count();
        console.log(`👥 Nombre d'utilisateurs: ${userCount}`);

        // Test 2: Compter les inscriptions
        const inscriptionCount = await prisma.inscriptionRequest.count();
        console.log(`📝 Nombre d'inscriptions: ${inscriptionCount}`);

        // Test 3: Compter les actualités
        const actualiteCount = await prisma.actualite.count();
        console.log(`📰 Nombre d'actualités: ${actualiteCount}`);

        // Test 4: Compter les travaux
        const travauxCount = await prisma.travaux.count();
        console.log(`🏗️ Nombre de travaux: ${travauxCount}`);

        // Test 5: Vérifier les rôles
        const rolesCount = await prisma.user.groupBy({
            by: ['role'],
            _count: { role: true }
        });

        console.log('\n🎭 Répartition des rôles:');
        rolesCount.forEach(r => {
            console.log(`   ${r.role}: ${r._count.role}`);
        });

        // Test 6: Inscriptions par statut
        const inscriptionsByStatus = await prisma.inscriptionRequest.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        console.log('\n📊 Inscriptions par statut:');
        inscriptionsByStatus.forEach(i => {
            console.log(`   ${i.status}: ${i._count.status}`);
        });

        console.log('\n✅ Test des données terminé avec succès');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDashboard();
