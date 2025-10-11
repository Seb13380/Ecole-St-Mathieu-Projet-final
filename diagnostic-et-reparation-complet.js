const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  DIAGNOSTIC COMPLET DES RELATIONS PARENTS-ENFANTS');
        console.log('═══════════════════════════════════════════════════════\n');

        // 1. Statistiques générales
        console.log('📊 STATISTIQUES GÉNÉRALES');
        console.log('─────────────────────────────────────────────────────────');

        const totalUsers = await prisma.user.count();
        const totalParents = await prisma.user.count({ where: { role: 'PARENT' } });
        const totalStudents = await prisma.student.count();
        const totalRelations = await prisma.parentStudent.count();

        console.log(`Total utilisateurs: ${totalUsers}`);
        console.log(`Total parents: ${totalParents}`);
        console.log(`Total élèves: ${totalStudents}`);
        console.log(`Total relations parent-élève: ${totalRelations}\n`);

        // 2. Parents sans enfants
        console.log('👨‍👩‍👧‍👦 PARENTS SANS ENFANTS');
        console.log('─────────────────────────────────────────────────────────');

        const parentsWithoutChildren = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                enfants: {
                    none: {}
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Nombre de parents sans enfants: ${parentsWithoutChildren.length}\n`);

        if (parentsWithoutChildren.length > 0) {
            console.log('Liste détaillée:');
            parentsWithoutChildren.forEach((parent, index) => {
                console.log(`${index + 1}. ${parent.firstName} ${parent.lastName}`);
                console.log(`   ID: ${parent.id}`);
                console.log(`   Email: ${parent.email}`);
                console.log(`   Créé le: ${parent.createdAt.toLocaleDateString('fr-FR')}`);
                console.log('');
            });
        }

        // 3. Élèves sans parents
        console.log('👶 ÉLÈVES SANS PARENTS');
        console.log('─────────────────────────────────────────────────────────');

        const studentsWithoutParents = await prisma.student.findMany({
            where: {
                parents: {
                    none: {}
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dateNaissance: true,
                classe: {
                    select: {
                        nom: true
                    }
                }
            }
        });

        console.log(`Nombre d'élèves sans parents: ${studentsWithoutParents.length}\n`);

        if (studentsWithoutParents.length > 0) {
            console.log('Liste détaillée:');
            studentsWithoutParents.forEach((student, index) => {
                console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
                console.log(`   ID: ${student.id}`);
                console.log(`   Né(e) le: ${student.dateNaissance.toLocaleDateString('fr-FR')}`);
                console.log(`   Classe: ${student.classe ? student.classe.nom : 'Non assignée'}`);
                console.log('');
            });
        }

        // 4. Analyse des relations problématiques
        console.log('🔍 ANALYSE DES RELATIONS PROBLÉMATIQUES');
        console.log('─────────────────────────────────────────────────────────');

        // Vérifier s'il y a des élèves avec l'ancien champ parentId
        const studentsWithOldParentId = await prisma.student.findMany({
            where: {
                parentId: {
                    not: null
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                parentId: true,
                parents: {
                    select: {
                        parent: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        console.log(`Élèves avec ancien parentId renseigné: ${studentsWithOldParentId.length}`);

        if (studentsWithOldParentId.length > 0) {
            let relationsMissing = 0;
            studentsWithOldParentId.forEach(student => {
                const hasRelation = student.parents.length > 0;
                if (!hasRelation) {
                    relationsMissing++;
                }
            });
            console.log(`Dont ${relationsMissing} sans relation dans ParentStudent\n`);
        }

        // 5. Propositions de réparation
        console.log('\n💡 PROPOSITIONS DE RÉPARATION');
        console.log('═══════════════════════════════════════════════════════');

        if (parentsWithoutChildren.length > 0) {
            console.log('\n1. PARENTS SANS ENFANTS:');
            console.log('   Options disponibles:');
            console.log('   a) Supprimer les comptes parents orphelins (si ce sont des comptes de test)');
            console.log('   b) Les garder en attente (si inscriptions en cours)');
            console.log('   c) Créer des relations manuelles avec des élèves existants');
        }

        if (studentsWithoutParents.length > 0) {
            console.log('\n2. ÉLÈVES SANS PARENTS:');
            console.log('   Action requise: Créer des comptes parents ou associer à des parents existants');
        }

        if (studentsWithOldParentId.length > 0) {
            console.log('\n3. MIGRATION DE DONNÉES:');
            console.log('   Certains élèves ont encore l\'ancien champ parentId renseigné.');
            console.log('   Action suggérée: Migrer ces relations vers la table ParentStudent');
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  FIN DU DIAGNOSTIC');
        console.log('═══════════════════════════════════════════════════════\n');

        // Retourner les résultats pour utilisation programmatique
        return {
            totalParents,
            totalStudents,
            totalRelations,
            parentsWithoutChildren: parentsWithoutChildren.length,
            studentsWithoutParents: studentsWithoutParents.length,
            parentsWithoutChildrenList: parentsWithoutChildren,
            studentsWithoutParentsList: studentsWithoutParents,
            studentsWithOldParentId: studentsWithOldParentId.length
        };

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        console.error(error.stack);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécution
main()
    .then(results => {
        console.log('✅ Diagnostic terminé avec succès');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erreur fatale:', error.message);
        process.exit(1);
    });
