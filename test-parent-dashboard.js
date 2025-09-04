const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testParentDashboard() {
    try {
        // Test avec l'ID du parent lucas
        const parentId = 24;

        console.log('=== TEST DASHBOARD PARENT ===');
        console.log('Parent ID:', parentId);

        // 1. Test de récupération des enfants (version corrigée)
        const enfants = await prisma.student.findMany({
            where: { parentId },
            include: {
                classe: {
                    select: { nom: true, niveau: true }
                }
            }
        });

        console.log('✅ Enfants trouvés:', enfants.length);
        enfants.forEach(enfant => {
            console.log(`- ${enfant.firstName} ${enfant.lastName} (Classe: ${enfant.classe?.nom || 'Non définie'})`);
        });

        // 2. Test des actualités
        const actualites = await prisma.actualite.findMany({
            where: { visible: true },
            take: 5,
            orderBy: { datePublication: 'desc' },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        console.log('✅ Actualités trouvées:', actualites.length);

        // 3. Test des messages
        const messagesNonLus = await prisma.message.count({
            where: {
                destinataireId: parentId,
                lu: false
            }
        });

        console.log('✅ Messages non lus:', messagesNonLus);

        console.log('\n🎉 TOUS LES TESTS RÉUSSIS - Le dashboard devrait fonctionner');

    } catch (error) {
        console.error('❌ ERREUR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testParentDashboard();
