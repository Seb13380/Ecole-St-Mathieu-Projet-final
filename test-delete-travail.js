const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDeleteTravail() {
    try {
        console.log('🧪 Test de suppression d\'un travail...');

        // Créer un travail temporaire pour tester la suppression
        const tempTravail = await prisma.travaux.create({
            data: {
                titre: 'Test suppression',
                description: 'Travail temporaire pour tester la suppression',
                auteurId: 2, // ID d'un utilisateur existant
                progression: 0,
                statut: 'PLANIFIE',
                important: false,
                visible: false
            }
        });

        console.log(`✅ Travail temporaire créé avec ID: ${tempTravail.id}`);

        // Simuler une suppression
        const deleted = await prisma.travaux.delete({
            where: { id: tempTravail.id }
        });

        console.log(`🗑️ Travail supprimé: "${deleted.titre}"`);
        console.log('✅ Test de suppression réussi!');

    } catch (error) {
        console.error('❌ Erreur lors du test de suppression:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDeleteTravail();
