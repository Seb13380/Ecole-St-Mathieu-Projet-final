const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  SCRIPT DE RÉPARATION AUTOMATIQUE');
    console.log('═══════════════════════════════════════════════════════\n');

    let repairedCount = 0;
    let errors = [];

    try {
        // ÉTAPE 1: Migrer les anciennes relations (parentId vers ParentStudent)
        console.log('📋 ÉTAPE 1: Migration des anciennes relations parentId');
        console.log('─────────────────────────────────────────────────────────');

        const studentsWithOldParentId = await prisma.student.findMany({
            where: {
                parentId: {
                    not: null
                },
                parents: {
                    none: {}
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                parentId: true
            }
        });

        console.log(`Trouvé ${studentsWithOldParentId.length} élèves avec ancien parentId à migrer\n`);

        for (const student of studentsWithOldParentId) {
            try {
                // Vérifier que le parent existe
                const parentExists = await prisma.user.findUnique({
                    where: { id: student.parentId }
                });

                if (parentExists) {
                    // Créer la relation dans ParentStudent
                    await prisma.parentStudent.create({
                        data: {
                            parentId: student.parentId,
                            studentId: student.id
                        }
                    });
                    console.log(`✅ Relation créée: Parent ${student.parentId} -> Élève ${student.firstName} ${student.lastName} (ID: ${student.id})`);
                    repairedCount++;
                } else {
                    console.log(`⚠️  Parent ID ${student.parentId} n'existe pas pour l'élève ${student.firstName} ${student.lastName}`);
                    errors.push(`Parent ${student.parentId} introuvable pour élève ${student.id}`);
                }
            } catch (error) {
                if (error.code === 'P2002') {
                    console.log(`ℹ️  Relation déjà existante pour ${student.firstName} ${student.lastName}`);
                } else {
                    console.error(`❌ Erreur pour ${student.firstName} ${student.lastName}:`, error.message);
                    errors.push(`Élève ${student.id}: ${error.message}`);
                }
            }
        }

        // ÉTAPE 2: Nettoyer les parents orphelins (optionnel - désactivé par défaut)
        console.log('\n📋 ÉTAPE 2: Analyse des parents sans enfants');
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
            }
        });

        console.log(`Trouvé ${parentsWithoutChildren.length} parents sans enfants`);

        // Identifier les comptes de test (créés récemment, emails de test, etc.)
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7); // Derniers 7 jours

        const testAccounts = parentsWithoutChildren.filter(parent =>
            parent.email.includes('test') ||
            parent.email.includes('temp') ||
            parent.createdAt > recentDate
        );

        if (testAccounts.length > 0) {
            console.log(`\n⚠️  ${testAccounts.length} comptes potentiellement de test détectés:`);
            testAccounts.forEach(parent => {
                console.log(`   - ${parent.firstName} ${parent.lastName} (${parent.email})`);
            });
            console.log('\n⚠️  Pour supprimer ces comptes, décommentez la section NETTOYAGE dans le script');
        }

        /* NETTOYAGE DES COMPTES DE TEST - DÉCOMMENTEZ POUR ACTIVER
        console.log('\n🗑️  Suppression des comptes de test...');
        for (const testAccount of testAccounts) {
            try {
                await prisma.user.delete({
                    where: { id: testAccount.id }
                });
                console.log(`✅ Supprimé: ${testAccount.firstName} ${testAccount.lastName} (${testAccount.email})`);
                repairedCount++;
            } catch (error) {
                console.error(`❌ Erreur suppression ${testAccount.email}:`, error.message);
                errors.push(`Suppression ${testAccount.id}: ${error.message}`);
            }
        }
        */

        // ÉTAPE 3: Résumé
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  RÉSUMÉ DE LA RÉPARATION');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ Relations réparées: ${repairedCount}`);
        console.log(`❌ Erreurs rencontrées: ${errors.length}`);

        if (errors.length > 0) {
            console.log('\nDétail des erreurs:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        // ÉTAPE 4: Vérification finale
        console.log('\n📊 VÉRIFICATION FINALE');
        console.log('─────────────────────────────────────────────────────────');

        const finalParentsWithoutChildren = await prisma.user.count({
            where: {
                role: 'PARENT',
                enfants: {
                    none: {}
                }
            }
        });

        const finalStudentsWithoutParents = await prisma.student.count({
            where: {
                parents: {
                    none: {}
                }
            }
        });

        console.log(`Parents sans enfants restants: ${finalParentsWithoutChildren}`);
        console.log(`Élèves sans parents restants: ${finalStudentsWithoutParents}`);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  FIN DE LA RÉPARATION');
        console.log('═══════════════════════════════════════════════════════\n');

        return {
            success: true,
            repairedCount,
            errors,
            remainingIssues: {
                parentsWithoutChildren: finalParentsWithoutChildren,
                studentsWithoutParents: finalStudentsWithoutParents
            }
        };

    } catch (error) {
        console.error('❌ ERREUR FATALE:', error.message);
        console.error(error.stack);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécution
main()
    .then(results => {
        console.log('✅ Réparation terminée');
        if (results.remainingIssues.parentsWithoutChildren > 0 ||
            results.remainingIssues.studentsWithoutParents > 0) {
            console.log('⚠️  Il reste des problèmes à traiter manuellement');
            process.exit(1);
        } else {
            console.log('✨ Toutes les relations sont correctes !');
            process.exit(0);
        }
    })
    .catch(error => {
        console.error('❌ Échec de la réparation:', error.message);
        process.exit(1);
    });
