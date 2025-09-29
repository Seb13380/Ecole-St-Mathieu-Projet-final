const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 🔧 CORRECTION DES RELATIONS PARENTS-ENFANTS
 * Problème : Relations cassées entre User (parents) et Student (enfants)
 */

async function fixParentChildRelations() {
    try {
        console.log('🔍 DIAGNOSTIC DES RELATIONS PARENTS-ENFANTS\n');

        // 1. Vérifier les parents sans enfants
        const parentsWithoutChildren = await prisma.user.findMany({
            where: {
                role: 'PARENT'
            },
            include: {
                students: true
            }
        });

        const orphanParents = parentsWithoutChildren.filter(parent => parent.students.length === 0);
        console.log(`👥 Parents total: ${parentsWithoutChildren.length}`);
        console.log(`❌ Parents sans enfants: ${orphanParents.length}`);

        // 2. Vérifier les enfants sans parents
        const studentsWithoutParents = await prisma.student.findMany({
            where: {
                parentId: null
            }
        });

        console.log(`👶 Enfants sans parents: ${studentsWithoutParents.length}`);

        // 3. Afficher quelques exemples
        console.log('\n📋 EXEMPLES DE PROBLÈMES:');

        if (orphanParents.length > 0) {
            console.log('\n👥 Parents sans enfants (5 premiers):');
            orphanParents.slice(0, 5).forEach(parent => {
                console.log(`  - ${parent.firstName} ${parent.lastName} (${parent.email})`);
            });
        }

        if (studentsWithoutParents.length > 0) {
            console.log('\n👶 Enfants sans parents (5 premiers):');
            studentsWithoutParents.slice(0, 5).forEach(student => {
                console.log(`  - ${student.firstName} ${student.lastName} (ID: ${student.id})`);
            });
        }

        // 4. Tentative de réconciliation automatique par email/nom
        console.log('\n🔄 TENTATIVE DE RÉCONCILIATION...');

        let fixedRelations = 0;

        for (const student of studentsWithoutParents.slice(0, 10)) { // Limiter pour test
            // Chercher un parent avec un nom similaire
            const potentialParent = await prisma.user.findFirst({
                where: {
                    role: 'PARENT',
                    OR: [
                        {
                            lastName: {
                                contains: student.lastName
                            }
                        },
                        {
                            firstName: {
                                contains: student.firstName
                            }
                        }
                    ]
                }
            });

            if (potentialParent) {
                console.log(`🔗 Tentative liaison: ${student.firstName} ${student.lastName} → ${potentialParent.firstName} ${potentialParent.lastName}`);

                // Demander confirmation avant de lier
                console.log(`   Voulez-vous lier cet enfant à ce parent ? (Vérifiez manuellement)`);

                // Pour l'instant, on affiche juste les correspondances possibles
                // await prisma.student.update({
                //     where: { id: student.id },
                //     data: { parentId: potentialParent.id }
                // });
                // fixedRelations++;
            }
        }

        console.log(`\n✅ Relations analysées. Corrections manuelles nécessaires.`);

        // 5. Vérifier l'intégrité du schéma
        console.log('\n🔍 VÉRIFICATION SCHÉMA:');

        try {
            const sampleUser = await prisma.user.findFirst({
                where: { role: 'PARENT' },
                include: { students: true }
            });

            if (sampleUser) {
                console.log('✅ Relation User -> Student fonctionne');
            }
        } catch (error) {
            console.error('❌ Erreur relation User -> Student:', error.message);
        }

        try {
            const sampleStudent = await prisma.student.findFirst({
                include: { parent: true }
            });

            if (sampleStudent) {
                console.log('✅ Relation Student -> User fonctionne');
            }
        } catch (error) {
            console.error('❌ Erreur relation Student -> User:', error.message);
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixParentChildRelations();