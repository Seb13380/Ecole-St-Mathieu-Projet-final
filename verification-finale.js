const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificationFinale() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  VÉRIFICATION FINALE DES RELATIONS');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // 1. STATISTIQUES GLOBALES
        console.log('📊 STATISTIQUES GLOBALES');
        console.log('─────────────────────────────────────────────────────────');

        const totalUsers = await prisma.user.count();
        const totalParents = await prisma.user.count({ where: { role: 'PARENT' } });
        const totalStudents = await prisma.student.count();
        const totalRelations = await prisma.parentStudent.count();

        console.log(`✅ Total utilisateurs: ${totalUsers}`);
        console.log(`✅ Total parents: ${totalParents}`);
        console.log(`✅ Total élèves: ${totalStudents}`);
        console.log(`✅ Total relations parent-élève: ${totalRelations}`);

        // Calculer les moyennes
        const moyenneEnfantsParParent = (totalRelations / totalParents).toFixed(2);
        const moyenneParentsParEnfant = (totalRelations / totalStudents).toFixed(2);

        console.log(`\n📈 Moyennes:`);
        console.log(`   Enfants par parent: ${moyenneEnfantsParParent}`);
        console.log(`   Parents par enfant: ${moyenneParentsParEnfant}`);

        // 2. PARENTS SANS ENFANTS
        console.log('\n👨‍👩‍👧‍👦 PARENTS SANS ENFANTS');
        console.log('─────────────────────────────────────────────────────────');

        const parentsWithoutChildren = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                enfants: { none: {} }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        if (parentsWithoutChildren.length === 0) {
            console.log('✅ PARFAIT ! Tous les parents ont au moins un enfant\n');
        } else {
            console.log(`⚠️  ${parentsWithoutChildren.length} parent(s) sans enfant:\n`);
            parentsWithoutChildren.forEach((parent, index) => {
                console.log(`${index + 1}. ${parent.firstName} ${parent.lastName}`);
                console.log(`   Email: ${parent.email}`);
                console.log(`   Créé le: ${parent.createdAt.toLocaleDateString('fr-FR')}`);
                console.log('');
            });
        }

        // 3. ÉLÈVES SANS PARENTS
        console.log('👶 ÉLÈVES SANS PARENTS');
        console.log('─────────────────────────────────────────────────────────');

        const studentsWithoutParents = await prisma.student.findMany({
            where: {
                parents: { none: {} }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                dateNaissance: true,
                classe: {
                    select: { nom: true }
                }
            }
        });

        if (studentsWithoutParents.length === 0) {
            console.log('✅ PARFAIT ! Tous les élèves ont au moins un parent\n');
        } else {
            console.log(`⚠️  ${studentsWithoutParents.length} élève(s) sans parent:\n`);
            studentsWithoutParents.forEach((student, index) => {
                console.log(`${index + 1}. ${student.firstName} ${student.lastName}`);
                console.log(`   Classe: ${student.classe ? student.classe.nom : 'Non assignée'}`);
                console.log(`   Né(e) le: ${student.dateNaissance.toLocaleDateString('fr-FR')}`);
                console.log('');
            });
        }

        // 4. DISTRIBUTION DES FAMILLES
        console.log('👨‍👩‍👧‍👦 DISTRIBUTION DES FAMILLES');
        console.log('─────────────────────────────────────────────────────────');

        const parentsWithChildrenCount = await prisma.user.findMany({
            where: {
                role: 'PARENT',
                enfants: { some: {} }
            },
            include: {
                _count: {
                    select: { enfants: true }
                }
            }
        });

        const distribution = {};
        parentsWithChildrenCount.forEach(parent => {
            const count = parent._count.enfants;
            distribution[count] = (distribution[count] || 0) + 1;
        });

        Object.keys(distribution).sort().forEach(count => {
            console.log(`   ${distribution[count]} parent(s) avec ${count} enfant(s)`);
        });

        // 5. ÉTAT DU SYSTÈME
        console.log('\n🔍 ÉTAT DU SYSTÈME');
        console.log('─────────────────────────────────────────────────────────');

        const pourcentageParentsConnectes = ((totalParents - parentsWithoutChildren.length) / totalParents * 100).toFixed(1);
        const pourcentageElevesConnectes = ((totalStudents - studentsWithoutParents.length) / totalStudents * 100).toFixed(1);

        console.log(`✅ Parents connectés: ${pourcentageParentsConnectes}% (${totalParents - parentsWithoutChildren.length}/${totalParents})`);
        console.log(`✅ Élèves connectés: ${pourcentageElevesConnectes}% (${totalStudents - studentsWithoutParents.length}/${totalStudents})`);

        // 6. ÉVALUATION FINALE
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  ÉVALUATION FINALE');
        console.log('═══════════════════════════════════════════════════════\n');

        let score = 0;
        let maxScore = 4;
        const issues = [];

        // Critère 1: Pas d'élève orphelin
        if (studentsWithoutParents.length === 0) {
            score++;
            console.log('✅ Aucun élève orphelin');
        } else {
            console.log(`❌ ${studentsWithoutParents.length} élève(s) orphelin(s)`);
            issues.push(`Créer les relations pour ${studentsWithoutParents.length} élève(s)`);
        }

        // Critère 2: Moins de 5% de parents sans enfants
        if (parentsWithoutChildren.length / totalParents < 0.05) {
            score++;
            console.log('✅ Moins de 5% de parents sans enfants');
        } else {
            console.log(`⚠️  ${(parentsWithoutChildren.length / totalParents * 100).toFixed(1)}% de parents sans enfants`);
            issues.push(`Vérifier ${parentsWithoutChildren.length} parent(s) sans enfant`);
        }

        // Critère 3: Au moins 1.5 parent par élève en moyenne
        if (moyenneParentsParEnfant >= 1.5) {
            score++;
            console.log('✅ Bonne couverture parentale (moyenne ≥ 1.5)');
        } else {
            console.log('⚠️  Couverture parentale faible (moyenne < 1.5)');
            issues.push('Vérifier que tous les parents sont bien associés');
        }

        // Critère 4: Au moins 300 relations
        if (totalRelations >= 300) {
            score++;
            console.log('✅ Nombre de relations satisfaisant (≥ 300)');
        } else {
            console.log('⚠️  Nombre de relations faible (< 300)');
            issues.push('Créer plus de relations parent-enfant');
        }

        const noteFinale = (score / maxScore * 100).toFixed(0);

        console.log(`\n📊 NOTE FINALE: ${score}/${maxScore} (${noteFinale}%)`);

        if (score === maxScore) {
            console.log('\n🎉 EXCELLENT ! Le système de relations est parfait !');
        } else if (score >= maxScore * 0.75) {
            console.log('\n✅ BIEN ! Le système fonctionne correctement');
            if (issues.length > 0) {
                console.log('\nAméliorations suggérées:');
                issues.forEach((issue, index) => {
                    console.log(`   ${index + 1}. ${issue}`);
                });
            }
        } else {
            console.log('\n⚠️  ATTENTION ! Des améliorations sont nécessaires');
            console.log('\nActions requises:');
            issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }

        console.log('\n═══════════════════════════════════════════════════════\n');

        return {
            totalParents,
            totalStudents,
            totalRelations,
            parentsWithoutChildren: parentsWithoutChildren.length,
            studentsWithoutParents: studentsWithoutParents.length,
            score,
            maxScore,
            noteFinale: parseInt(noteFinale)
        };

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécution
verificationFinale()
    .then(results => {
        if (results.score === results.maxScore) {
            console.log('✅ Vérification terminée - Système parfait !');
            process.exit(0);
        } else if (results.noteFinale >= 75) {
            console.log('✅ Vérification terminée - Système fonctionnel');
            process.exit(0);
        } else {
            console.log('⚠️  Vérification terminée - Actions recommandées');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Échec de la vérification:', error.message);
        process.exit(1);
    });
