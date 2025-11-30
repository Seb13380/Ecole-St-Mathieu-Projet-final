const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 🔍 RECHERCHE RACANELLI VANESSA
 */

async function findRacanelliParent() {
    try {
        console.log('🔍 Recherche du parent Racanelli Vanessa...\n');

        // Chercher le parent
        const parent = await prisma.user.findFirst({
            where: {
                OR: [
                    { firstName: { contains: 'Vanessa' }, lastName: { contains: 'Racanelli' } },
                    { email: { contains: 'dolcevaness@aol.com' } }
                ],
                role: 'PARENT'
            },
            include: {
                enfants: {
                    include: {
                        student: {
                            include: {
                                classe: true
                            }
                        }
                    }
                }
            }
        });

        if (!parent) {
            console.log('❌ Parent Racanelli Vanessa non trouvé');
            return;
        }

        console.log('='.repeat(70));
        console.log(`👤 Parent trouvé: ${parent.firstName} ${parent.lastName} (ID: #${parent.id})`);
        console.log(`   Email: ${parent.email}`);
        console.log(`   Téléphone: ${parent.phone || 'Non renseigné'}`);
        console.log(`   Adresse: ${parent.adress || 'Non renseignée'}`);
        console.log('='.repeat(70));

        // Relations ParentStudent
        console.log(`\n👨‍👩‍👧‍👦 Relations ParentStudent: ${parent.enfants.length}`);
        if (parent.enfants.length > 0) {
            parent.enfants.forEach((rel, index) => {
                const student = rel.student;
                console.log(`\n   ${index + 1}. ${student.firstName} ${student.lastName} (ID: #${student.id})`);
                console.log(`      Classe: ${student.classe ? student.classe.nom : 'Aucune'}`);
                console.log(`      Date de naissance: ${student.dateNaissance ? student.dateNaissance.toLocaleDateString('fr-FR') : 'Non renseignée'}`);
            });
        } else {
            console.log('   ❌ AUCUN ENFANT LIÉ !');
        }

        // Chercher les enfants qui ont ce parentId mais pas de relation
        console.log(`\n🔍 Recherche d'enfants orphelins avec parentId = ${parent.id}...`);
        const orphanStudents = await prisma.student.findMany({
            where: {
                parentId: parent.id,
                parents: {
                    none: {
                        parentId: parent.id
                    }
                }
            },
            include: {
                classe: true
            }
        });

        if (orphanStudents.length > 0) {
            console.log(`\n🚨 ${orphanStudents.length} enfant(s) orphelin(s) trouvé(s) !`);
            for (const student of orphanStudents) {
                console.log(`   → ${student.firstName} ${student.lastName} (ID: #${student.id})`);
                console.log(`      Création de la relation...`);

                await prisma.parentStudent.create({
                    data: {
                        parentId: parent.id,
                        studentId: student.id
                    }
                });

                console.log(`      ✅ Relation créée !`);
            }
        } else {
            console.log('   ✅ Aucun enfant orphelin');
        }

        // Chercher l'enfant "Sacha Racanelli"
        console.log(`\n🔍 Recherche de l'enfant Sacha Racanelli...`);
        const sachaStudent = await prisma.student.findFirst({
            where: {
                firstName: { contains: 'Sacha' },
                lastName: { contains: 'Racanelli' }
            },
            include: {
                parents: {
                    include: {
                        parent: true
                    }
                },
                classe: true
            }
        });

        if (sachaStudent) {
            console.log(`\n👶 Enfant trouvé: ${sachaStudent.firstName} ${sachaStudent.lastName} (ID: #${sachaStudent.id})`);
            console.log(`   ParentId direct: ${sachaStudent.parentId || 'Aucun'}`);
            console.log(`   Classe: ${sachaStudent.classe ? sachaStudent.classe.nom : 'Aucune'}`);
            console.log(`   Relations ParentStudent: ${sachaStudent.parents.length}`);

            if (sachaStudent.parents.length > 0) {
                sachaStudent.parents.forEach(rel => {
                    console.log(`      → Parent #${rel.parentId}: ${rel.parent.firstName} ${rel.parent.lastName}`);
                });
            }

            // Vérifier si Vanessa est liée à Sacha
            const isLinked = sachaStudent.parents.some(p => p.parentId === parent.id);
            if (!isLinked) {
                console.log(`\n🚨 Vanessa n'est PAS liée à Sacha !`);
                console.log(`   Création de la relation...`);

                await prisma.parentStudent.create({
                    data: {
                        parentId: parent.id,
                        studentId: sachaStudent.id
                    }
                });

                console.log(`   ✅ Relation créée !`);
            } else {
                console.log(`\n✅ Vanessa est déjà liée à Sacha`);
            }
        } else {
            console.log('   ❌ Enfant Sacha Racanelli non trouvé');
        }

        console.log('\n' + '='.repeat(70));

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter
findRacanelliParent();
