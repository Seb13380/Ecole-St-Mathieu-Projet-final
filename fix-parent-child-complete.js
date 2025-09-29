const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 🔧 CORRECTION COMPLÈTE DES RELATIONS PARENTS-ENFANTS
 * 1. Créer des enfants pour les parents existants
 * 2. Créer des classes
 * 3. Lier tout ensemble
 */

async function fixParentChildRelationsCompletely() {
    try {
        console.log('🔧 CORRECTION COMPLÈTE DES RELATIONS PARENTS-ENFANTS\n');

        // 1. Vérifier les parents existants
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            include: { students: true }
        });

        console.log(`👥 Parents trouvés: ${parents.length}`);

        // 2. Créer des classes si elles n'existent pas
        const existingClasses = await prisma.classe.count();

        if (existingClasses === 0) {
            console.log('📚 Création des classes...');

            const classes = [
                { nom: 'PS-A', niveau: 'PS', anneeScolaire: '2025-2026' },
                { nom: 'MS-A', niveau: 'MS', anneeScolaire: '2025-2026' },
                { nom: 'GS-A', niveau: 'GS', anneeScolaire: '2025-2026' },
                { nom: 'CP-A', niveau: 'CP', anneeScolaire: '2025-2026' },
                { nom: 'CE1-A', niveau: 'CE1', anneeScolaire: '2025-2026' },
                { nom: 'CE2-A', niveau: 'CE2', anneeScolaire: '2025-2026' },
                { nom: 'CM1-A', niveau: 'CM1', anneeScolaire: '2025-2026' },
                { nom: 'CM2-A', niveau: 'CM2', anneeScolaire: '2025-2026' }
            ];

            for (const classeData of classes) {
                await prisma.classe.create({ data: classeData });
            }

            console.log(`✅ ${classes.length} classes créées`);
        }

        // 3. Récupérer les classes créées
        const classes = await prisma.classe.findMany();

        // 4. Créer des enfants pour chaque parent qui n'en a pas
        let studentsCreated = 0;

        for (const parent of parents) {
            if (parent.students.length === 0) {
                console.log(`👶 Création d'un enfant pour ${parent.firstName} ${parent.lastName}...`);

                // Choisir une classe aléatoire
                const randomClass = classes[Math.floor(Math.random() * classes.length)];

                // Créer un enfant avec un nom dérivé du parent
                const childFirstName = parent.firstName === 'Sophie' ? 'Lucas' :
                    parent.firstName === 'Pierre' ? 'Emma' :
                        `Enfant de ${parent.firstName}`;

                const student = await prisma.student.create({
                    data: {
                        firstName: childFirstName,
                        lastName: parent.lastName,
                        dateNaissance: new Date('2018-03-15'),
                        parentId: parent.id, // Relation directe
                        classeId: randomClass.id
                    }
                });

                // Créer aussi la relation dans la table ParentStudent
                await prisma.parentStudent.create({
                    data: {
                        parentId: parent.id,
                        studentId: student.id
                    }
                });

                studentsCreated++;
                console.log(`   ✅ ${childFirstName} ${parent.lastName} créé(e) en ${randomClass.nom}`);
            }
        }

        // 5. Vérification finale
        const parentsWithChildren = await prisma.user.findMany({
            where: { role: 'PARENT' },
            include: {
                students: {
                    include: { classe: true }
                }
            }
        });

        console.log('\n📊 RÉSULTAT FINAL:');
        console.log(`✅ ${studentsCreated} enfants créés`);
        console.log(`👥 Relations Parent → Enfant:`);

        parentsWithChildren.forEach(parent => {
            if (parent.students.length > 0) {
                parent.students.forEach(student => {
                    console.log(`   - ${parent.firstName} ${parent.lastName} → ${student.firstName} ${student.lastName} (${student.classe?.nom || 'Aucune classe'})`);
                });
            } else {
                console.log(`   - ${parent.firstName} ${parent.lastName} → AUCUN ENFANT`);
            }
        });

        // 6. Statistiques globales
        const totalStudents = await prisma.student.count();
        const totalParents = await prisma.user.count({ where: { role: 'PARENT' } });
        const totalClasses = await prisma.classe.count();

        console.log('\n📈 STATISTIQUES FINALES:');
        console.log(`   - Parents: ${totalParents}`);
        console.log(`   - Enfants: ${totalStudents}`);
        console.log(`   - Classes: ${totalClasses}`);

        console.log('\n🎯 Les relations parents-enfants sont maintenant corrigées !');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixParentChildRelationsCompletely();