const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDeleteClasse() {
    try {
        console.log('🔍 Test de suppression de classe...');
        
        // 1. Créer une classe de test
        console.log('📚 Création d\'une classe de test...');
        const testClasse = await prisma.classe.create({
            data: {
                nom: 'CLASSE_TEST',
                niveau: 'Test',
                anneeScolaire: '2025-2026'
            }
        });
        console.log('✅ Classe créée:', testClasse.nom, '(ID:', testClasse.id + ')');
        
        // 2. Vérifier s'il y a des élèves dans cette classe
        const studentCount = await prisma.student.count({
            where: { classeId: testClasse.id }
        });
        console.log('👶 Élèves dans la classe:', studentCount);
        
        // 3. Tenter la suppression
        console.log('🗑️ Tentative de suppression...');
        await prisma.classe.delete({
            where: { id: testClasse.id }
        });
        console.log('✅ Classe supprimée avec succès !');
        
        // 4. Vérifier que la classe n'existe plus
        const deletedClasse = await prisma.classe.findUnique({
            where: { id: testClasse.id }
        });
        
        if (deletedClasse) {
            console.log('❌ ERREUR: La classe existe encore après suppression');
        } else {
            console.log('✅ Vérification: La classe a bien été supprimée');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test de suppression:', error.message);
        console.error('Code d\'erreur:', error.code);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testDeleteClasse();
