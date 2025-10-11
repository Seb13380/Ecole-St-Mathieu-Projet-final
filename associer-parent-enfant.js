const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function associerParentEnfant(parentId, studentId) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ASSOCIATION PARENT-ENFANT');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Validation des arguments
        if (!parentId || !studentId) {
            console.log('❌ Usage: node associer-parent-enfant.js <parentId> <studentId>');
            console.log('\nExemple: node associer-parent-enfant.js 339 123\n');
            process.exit(1);
        }

        const parentIdNum = parseInt(parentId);
        const studentIdNum = parseInt(studentId);

        if (isNaN(parentIdNum) || isNaN(studentIdNum)) {
            console.log('❌ Les IDs doivent être des nombres');
            process.exit(1);
        }

        // 1. Vérifier que le parent existe
        const parent = await prisma.user.findUnique({
            where: { id: parentIdNum },
            include: {
                enfants: {
                    include: {
                        student: true
                    }
                }
            }
        });

        if (!parent) {
            console.log(`❌ Parent avec ID ${parentIdNum} introuvable`);
            process.exit(1);
        }

        console.log('👤 PARENT:');
        console.log(`   ${parent.firstName} ${parent.lastName}`);
        console.log(`   Email: ${parent.email}`);
        console.log(`   Enfants actuels: ${parent.enfants.length}`);
        if (parent.enfants.length > 0) {
            parent.enfants.forEach(rel => {
                console.log(`     - ${rel.student.firstName} ${rel.student.lastName}`);
            });
        }
        console.log('');

        // 2. Vérifier que l'élève existe
        const student = await prisma.student.findUnique({
            where: { id: studentIdNum },
            include: {
                parents: {
                    include: {
                        parent: true
                    }
                },
                classe: true
            }
        });

        if (!student) {
            console.log(`❌ Élève avec ID ${studentIdNum} introuvable`);
            process.exit(1);
        }

        console.log('👶 ÉLÈVE:');
        console.log(`   ${student.firstName} ${student.lastName}`);
        console.log(`   Date naissance: ${student.dateNaissance.toLocaleDateString('fr-FR')}`);
        console.log(`   Classe: ${student.classe ? student.classe.nom : 'Non assignée'}`);
        console.log(`   Parents actuels: ${student.parents.length}`);
        if (student.parents.length > 0) {
            student.parents.forEach(rel => {
                console.log(`     - ${rel.parent.firstName} ${rel.parent.lastName} (${rel.parent.email})`);
            });
        }
        console.log('');

        // 3. Vérifier si la relation existe déjà
        const existingRelation = await prisma.parentStudent.findFirst({
            where: {
                parentId: parentIdNum,
                studentId: studentIdNum
            }
        });

        if (existingRelation) {
            console.log('⚠️  La relation existe déjà !');
            console.log(`   ${parent.firstName} ${parent.lastName} est déjà parent de ${student.firstName} ${student.lastName}`);
            console.log('\n✅ Aucune action nécessaire\n');
            process.exit(0);
        }

        // 4. Créer la relation
        console.log('🔗 CRÉATION DE LA RELATION');
        console.log('─────────────────────────────────────────────────────────');
        console.log(`Association: ${parent.firstName} ${parent.lastName} → ${student.firstName} ${student.lastName}`);
        console.log('');

        const newRelation = await prisma.parentStudent.create({
            data: {
                parentId: parentIdNum,
                studentId: studentIdNum
            }
        });

        console.log('✅ RELATION CRÉÉE AVEC SUCCÈS !');
        console.log(`   ID de la relation: ${newRelation.id}`);
        console.log(`   Créée le: ${newRelation.createdAt.toLocaleString('fr-FR')}`);

        // 5. Vérification finale
        console.log('\n📊 VÉRIFICATION FINALE');
        console.log('─────────────────────────────────────────────────────────');

        const updatedParent = await prisma.user.findUnique({
            where: { id: parentIdNum },
            include: {
                enfants: {
                    include: {
                        student: true
                    }
                }
            }
        });

        console.log(`${updatedParent.firstName} ${updatedParent.lastName} a maintenant ${updatedParent.enfants.length} enfant(s):`);
        updatedParent.enfants.forEach((rel, index) => {
            console.log(`   ${index + 1}. ${rel.student.firstName} ${rel.student.lastName}`);
        });

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  ASSOCIATION TERMINÉE AVEC SUCCÈS');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);
const parentId = args[0];
const studentId = args[1];

// Exécution
associerParentEnfant(parentId, studentId);
