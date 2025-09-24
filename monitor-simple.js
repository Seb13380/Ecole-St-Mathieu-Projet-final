const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImportStatus() {
    console.log('📊 VÉRIFICATION ÉTAT IMPORT\n');

    try {
        const stats = {
            parents: await prisma.user.count({ where: { role: 'PARENT' } }),
            students: await prisma.student.count(),
            relations: await prisma.parentStudent.count(),
            classes: await prisma.classe.count()
        };

        console.log('📊 État actuel:');
        console.log(`👨‍👩‍👧‍👦 Parents: ${stats.parents}`);
        console.log(`👶 Étudiants: ${stats.students}`);
        console.log(`🔗 Relations: ${stats.relations}`);
        console.log(`🏫 Classes: ${stats.classes}`);

        console.log('\n🚀 Prêt pour l\'import!');
        console.log('1. Va sur http://localhost:3007');
        console.log('2. Connecte-toi: l.camboulives@stmathieu.org / Lionel123!');
        console.log('3. Menu "Import Excel"');
        console.log('4. Utilise: test-import-familles.xlsx');
        console.log('\n💡 Les enfants devraient maintenant être créés avec succès!');

        // Surveiller les changements toutes les 3 secondes
        let checkCount = 0;
        const maxChecks = 40; // 2 minutes de surveillance

        const monitor = setInterval(async () => {
            try {
                const newStats = {
                    parents: await prisma.user.count({ where: { role: 'PARENT' } }),
                    students: await prisma.student.count(),
                    relations: await prisma.parentStudent.count()
                };

                if (newStats.students > stats.students) {
                    console.log(`\n🎉 SUCCÈS! ${newStats.students - stats.students} enfant(s) créé(s)!`);

                    // Afficher les nouveaux étudiants
                    const newStudents = await prisma.student.findMany({
                        include: {
                            parent: { select: { firstName: true, lastName: true } },
                            classe: { select: { nom: true } }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    });

                    console.log('\n👶 Nouveaux étudiants:');
                    newStudents.forEach((student, i) => {
                        console.log(`${i + 1}. ${student.firstName} ${student.lastName}`);
                        console.log(`   Parent: ${student.parent?.firstName} ${student.parent?.lastName}`);
                        console.log(`   Classe: ${student.classe?.nom || 'N/A'}`);
                    });

                    clearInterval(monitor);
                    await prisma.$disconnect();
                    return;
                }

                checkCount++;
                if (checkCount >= maxChecks) {
                    console.log('\n⏰ Surveillance terminée après 2 minutes');
                    clearInterval(monitor);
                    await prisma.$disconnect();
                }
            } catch (error) {
                console.error('Erreur surveillance:', error.message);
                clearInterval(monitor);
                await prisma.$disconnect();
            }
        }, 3000);

    } catch (error) {
        console.error('❌ Erreur:', error);
        await prisma.$disconnect();
    }
}

checkImportStatus();