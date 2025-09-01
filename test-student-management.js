const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStudentManagement() {
    try {
        console.log('\n🔄 Test de la gestion des étudiants...\n');

        // 1. Test de récupération des étudiants
        console.log('1. Test de récupération des étudiants:');
        const students = await prisma.student.findMany({
            include: {
                parent: {
                    select: { firstName: true, lastName: true, email: true }
                },
                classe: {
                    select: { nom: true, niveau: true }
                }
            }
        });
        console.log(`   ✅ Nombre d'étudiants trouvés: ${students.length}`);

        if (students.length > 0) {
            console.log('   📋 Premiers étudiants:');
            students.slice(0, 3).forEach(student => {
                console.log(`   - ${student.firstName} ${student.lastName} (Classe: ${student.classe?.nom || 'Non assignée'})`);
            });
        }

        // 2. Test de récupération des parents
        console.log('\n2. Test de récupération des parents pour association:');
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            select: { id: true, firstName: true, lastName: true, email: true }
        });
        console.log(`   ✅ Nombre de parents trouvés: ${parents.length}`);

        // 3. Test de récupération des classes
        console.log('\n3. Test de récupération des classes pour association:');
        const classes = await prisma.classe.findMany({
            select: { id: true, nom: true, niveau: true }
        });
        console.log(`   ✅ Nombre de classes trouvées: ${classes.length}`);

        if (classes.length > 0) {
            console.log('   📋 Classes disponibles:');
            classes.forEach(classe => {
                console.log(`   - ${classe.nom} (${classe.niveau})`);
            });
        }

        console.log('\n✅ Tous les tests sont passés ! La gestion des étudiants devrait maintenant fonctionner.\n');

        // 4. Vérification des relations
        console.log('4. Vérification des relations étudiants-parents:');
        const studentsWithParents = await prisma.student.count({
            where: { parentId: { not: null } }
        });
        console.log(`   ✅ Étudiants avec parent assigné: ${studentsWithParents}`);

        const studentsWithClasses = await prisma.student.count({
            where: { classeId: { not: null } }
        });
        console.log(`   ✅ Étudiants avec classe assignée: ${studentsWithClasses}`);

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le test
testStudentManagement();
