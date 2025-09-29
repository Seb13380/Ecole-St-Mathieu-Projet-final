const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 🔧 CORRECTION FINALE DES RELATIONS PARENTS-ENFANTS
 * Problème : Les contrôleurs utilisent ParentStudent mais les relations directes existent
 */

async function fixParentChildRelationsFinal() {
    try {
        console.log('🔧 CORRECTION FINALE DES RELATIONS PARENTS-ENFANTS\n');

        // 1. Nettoyer les doublons de parents
        console.log('🧹 Nettoyage des doublons...');

        const duplicateParent = await prisma.user.findFirst({
            where: {
                email: 'pierre.martin@test.com',
                role: 'PARENT'
            },
            include: { students: true }
        });

        if (duplicateParent && duplicateParent.students.length > 0) {
            // Transférer l'enfant vers Marie Martin
            const marieMartinParent = await prisma.user.findFirst({
                where: {
                    email: 'marie.martin@test.com',
                    role: 'PARENT'
                }
            });

            if (marieMartinParent && duplicateParent.students[0]) {
                await prisma.student.update({
                    where: { id: duplicateParent.students[0].id },
                    data: { parentId: marieMartinParent.id }
                });
                console.log(`✅ Enfant transféré vers Marie Martin`);
            }

            // Supprimer le doublon Pierre Martin
            await prisma.user.delete({
                where: { id: duplicateParent.id }
            });
            console.log(`✅ Doublon Pierre Martin supprimé`);
        }

        // 2. Vérifier et créer les relations ParentStudent manquantes
        console.log('\n🔗 Synchronisation des relations ParentStudent...');

        const students = await prisma.student.findMany({
            include: {
                parent: true,
                parents: true // Relations ParentStudent
            }
        });

        for (const student of students) {
            if (student.parent && student.parents.length === 0) {
                // Créer la relation ParentStudent manquante
                await prisma.parentStudent.create({
                    data: {
                        parentId: student.parent.id,
                        studentId: student.id
                    }
                });
                console.log(`✅ Relation ParentStudent créée: ${student.parent.firstName} ${student.parent.lastName} → ${student.firstName} ${student.lastName}`);
            }
        }

        // 3. Vérification finale
        console.log('\n📊 VÉRIFICATION FINALE:');

        const parentsWithChildren = await prisma.user.findMany({
            where: { role: 'PARENT' },
            include: {
                students: {
                    include: { classe: true }
                }
            }
        });

        console.log('\n✅ RELATIONS FINALES:');
        parentsWithChildren.forEach(parent => {
            if (parent.students.length > 0) {
                parent.students.forEach(student => {
                    console.log(`👨‍👩‍👧‍👦 ${parent.firstName} ${parent.lastName} → ${student.firstName} ${student.lastName} (${student.classe?.nom || 'Sans classe'})`);
                });
            } else {
                console.log(`❌ ${parent.firstName} ${parent.lastName} → AUCUN ENFANT`);
            }
        });

        // 4. Vérifier les relations ParentStudent
        const parentStudentRelations = await prisma.parentStudent.findMany({
            include: {
                parent: { select: { firstName: true, lastName: true } },
                student: { select: { firstName: true, lastName: true } }
            }
        });

        console.log('\n🔗 RELATIONS PARENTSTUDENT:');
        parentStudentRelations.forEach(rel => {
            console.log(`📋 ${rel.parent.firstName} ${rel.parent.lastName} ↔ ${rel.student.firstName} ${rel.student.lastName}`);
        });

        console.log(`\n🎯 Total relations ParentStudent: ${parentStudentRelations.length}`);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixParentChildRelationsFinal();