const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
    try {
        console.log('🧹 NETTOYAGE DE LA BASE DE DONNÉES...\n');

        // 1. Supprimer toutes les relations ParentStudent
        const deletedRelations = await prisma.parentStudent.deleteMany({});
        console.log(`✅ ${deletedRelations.count} relations parent-étudiant supprimées`);

        // 2. Supprimer tous les étudiants
        const deletedStudents = await prisma.student.deleteMany({});
        console.log(`✅ ${deletedStudents.count} étudiants supprimés`);

        // 3. Supprimer tous les parents
        const deletedParents = await prisma.user.deleteMany({
            where: { role: 'PARENT' }
        });
        console.log(`✅ ${deletedParents.count} parents supprimés`);

        // 4. Garder les classes mais on peut les nettoyer aussi si nécessaire
        // const deletedClasses = await prisma.classe.deleteMany({});
        // console.log(`✅ ${deletedClasses.count} classes supprimées`);

        console.log('\n🎯 Base de données nettoyée ! Prêt pour un import propre.');
        console.log('📋 Étapes suivantes:');
        console.log('   1. Faire un import Excel complet');
        console.log('   2. La nouvelle logique de parsing va correctement identifier:');
        console.log('      - "GIRAUD CARRIER" comme nom de famille');
        console.log('      - "Romain", "Alexandra", "Elise" comme prénoms');
        console.log('   3. Les relations seront créées correctement');

    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
    } finally {
        await prisma.$disconnect();
    }
}

console.log('🚀 NETTOYAGE AUTOMATIQUE ACTIVÉ !');
console.log('⚠️  Suppression de toutes les données corrompues en cours...');
console.log('');
cleanDatabase();