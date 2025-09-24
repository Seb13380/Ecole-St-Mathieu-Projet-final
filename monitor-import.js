const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorImport() {
    console.log('📊 MONITEUR D\'IMPORT EN TEMPS RÉEL');
    console.log('='.repeat(60));

    const startTime = Date.now();

    // État initial
    const initialStats = {
        parents: await prisma.user.count({ where: { role: 'PARENT' } }),
        students: await prisma.student.count(),
        relations: await prisma.parentStudent.count(),
        classes: await prisma.classe.count()
    };

    console.log('\n📊 ÉTAT INITIAL:');
    console.log(`👨‍👩‍👧‍👦 Parents: ${initialStats.parents}`);
    console.log(`👶 Étudiants: ${initialStats.students}`);
    console.log(`🔗 Relations: ${initialStats.relations}`);
    console.log(`🏫 Classes: ${initialStats.classes}`);

    console.log('\n🚀 Instructions pour tester:');
    console.log('1. Va sur http://localhost:3007');
    console.log('2. Connecte-toi avec: l.camboulives@stmathieu.org / Lionel123!');
    console.log('3. Va dans "Import Excel" du menu directeur');
    console.log('4. Uploade le fichier: test-import-familles.xlsx');
    console.log('5. Observe ce moniteur en temps réel...\n');

    // Surveiller les changements toutes les 2 secondes
    let previousStats = { ...initialStats };
    let monitoring = true;

    const monitor = setInterval(async () => {
        try {
            const currentStats = {
                parents: await prisma.user.count({ where: { role: 'PARENT' } }),
                students: await prisma.student.count(),
                relations: await prisma.parentStudent.count(),
                classes: await prisma.classe.count()
            };

            // Détecter les changements
            const changes = {
                parents: currentStats.parents - previousStats.parents,
                students: currentStats.students - previousStats.students,
                relations: currentStats.relations - previousStats.relations,
                classes: currentStats.classes - previousStats.classes
            };

            const hasChanges = Object.values(changes).some(change => change !== 0);

            if (hasChanges) {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                console.log(`⏰ [+${elapsed}s] CHANGEMENT DÉTECTÉ!`);
                console.log(`   👨‍👩‍👧‍👦 Parents: ${currentStats.parents} (${changes.parents >= 0 ? '+' : ''}${changes.parents})`);
                console.log(`   👶 Étudiants: ${currentStats.students} (${changes.students >= 0 ? '+' : ''}${changes.students})`);
                console.log(`   🔗 Relations: ${currentStats.relations} (${changes.relations >= 0 ? '+' : ''}${changes.relations})`);
                console.log(`   🏫 Classes: ${currentStats.classes} (${changes.classes >= 0 ? '+' : ''}${changes.classes})\n`);

                previousStats = { ...currentStats };

                // Si on a créé des enfants, afficher les détails
                if (changes.students > 0) {
                    console.log('🎉 ENFANTS CRÉÉS! Affichage des détails...');

                    const newStudents = await prisma.student.findMany({
                        where: {
                            createdAt: {
                                gte: new Date(startTime)
                            }
                        },
                        include: {
                            classe: { select: { nom: true } },
                            parents: {
                                include: {
                                    parent: { select: { firstName: true, lastName: true, email: true } }
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    });

                    newStudents.forEach((student, index) => {
                        console.log(`   ${index + 1}. ${student.firstName} ${student.lastName}`);
                        console.log(`      Classe: ${student.classe?.nom || 'N/A'}`);
                        console.log(`      Parents: ${student.parents.map(p => p.parent.firstName + ' ' + p.parent.lastName).join(', ')}`);
                    });

                    console.log('\n✅ SUCCÈS! L\'import fonctionne correctement!');
                    monitoring = false;
                }
            }

            // Arrêter après 2 minutes
            if (Date.now() - startTime > 120000) {
                monitoring = false;
            }

            if (!monitoring) {
                clearInterval(monitor);
                await prisma.$disconnect();

                if (previousStats.students === initialStats.students) {
                    console.log('❌ Aucun enfant créé après 2 minutes.');
                    console.log('   Vérifie les logs de l\'application pour identifier le problème.');
                }
            }

        } catch (error) {
            console.error('❌ Erreur monitoring:', error);
            clearInterval(monitor);
            await prisma.$disconnect();
        }
    }, 2000);
}

monitorImport();