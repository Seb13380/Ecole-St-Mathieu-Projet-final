const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixClassConstraint() {
    console.log('🔧 CORRECTION CONTRAINTE CLASSID\n');

    try {
        // 1. Analyser la situation actuelle
        console.log('📊 Analyse de la situation actuelle...');
        
        const classCount = await prisma.classe.count();
        const studentCount = await prisma.student.count();
        const parentCount = await prisma.user.count({ where: { role: 'PARENT' } });
        
        console.log(`📚 Classes : ${classCount}`);
        console.log(`👶 Étudiants : ${studentCount}`);
        console.log(`👨‍👩‍👧‍👦 Parents : ${parentCount}`);

        // 2. Créer des classes de base si elles n'existent pas
        if (classCount === 0) {
            console.log('\n🏗️  Création des classes de base...');
            
            const classesToCreate = [
                { nom: 'TPS', niveau: 'Toute Petite Section', anneeScolaire: '2025-2026' },
                { nom: 'PS', niveau: 'Petite Section', anneeScolaire: '2025-2026' },
                { nom: 'MS', niveau: 'Moyenne Section', anneeScolaire: '2025-2026' },
                { nom: 'GS', niveau: 'Grande Section', anneeScolaire: '2025-2026' },
                { nom: 'CP', niveau: 'Cours Préparatoire', anneeScolaire: '2025-2026' },
                { nom: 'CE1', niveau: 'Cours Élémentaire 1', anneeScolaire: '2025-2026' },
                { nom: 'CE2', niveau: 'Cours Élémentaire 2', anneeScolaire: '2025-2026' },
                { nom: 'CM1', niveau: 'Cours Moyen 1', anneeScolaire: '2025-2026' },
                { nom: 'CM2', niveau: 'Cours Moyen 2', anneeScolaire: '2025-2026' }
            ];

            for (const classeData of classesToCreate) {
                try {
                    const classe = await prisma.classe.create({
                        data: classeData
                    });
                    console.log(`   ✅ Classe créée : ${classe.nom} (ID: ${classe.id})`);
                } catch (error) {
                    console.log(`   ❌ Erreur création ${classeData.nom} : ${error.message}`);
                }
            }
        }

        // 3. Vérifier les étudiants et leurs classes
        console.log('\n🔍 Vérification des étudiants...');
        
        const allStudents = await prisma.student.findMany({
            include: {
                parent: {
                    select: { firstName: true, lastName: true, email: true }
                },
                classe: {
                    select: { nom: true, niveau: true }
                }
            }
        });

        console.log(`📊 Total étudiants : ${allStudents.length}`);
        
        // Vérifier s'il y a des étudiants avec des classeId invalides
        const studentsWithInvalidClass = [];
        for (const student of allStudents) {
            if (!student.classe) {
                // Vérifier si la classe existe vraiment
                const classExists = await prisma.classe.findUnique({
                    where: { id: student.classeId }
                });
                if (!classExists) {
                    studentsWithInvalidClass.push(student);
                }
            }
        }

        if (studentsWithInvalidClass.length > 0) {
            console.log(`⚠️  ${studentsWithInvalidClass.length} étudiant(s) avec classe invalide trouvé(s)`);
            
            // Assigner une classe par défaut (CP)
            const defaultClass = await prisma.classe.findFirst({
                where: { nom: 'CP' }
            });

            if (defaultClass) {
                for (const student of studentsWithInvalidClass) {
                    try {
                        await prisma.student.update({
                            where: { id: student.id },
                            data: { classeId: defaultClass.id }
                        });
                        console.log(`   ✅ ${student.firstName} ${student.lastName} assigné(e) à ${defaultClass.nom}`);
                    } catch (error) {
                        console.log(`   ❌ Erreur assignation ${student.firstName} : ${error.message}`);
                    }
                }
            }
        } else {
            console.log('✅ Tous les étudiants ont une classe valide assignée');
        }

        // 4. Test de création d'étudiant pour vérifier que tout fonctionne
        console.log('\n🧪 Test de création d\'étudiant...');
        
        try {
            // Trouver un parent de test ou en créer un
            let testParent = await prisma.user.findFirst({
                where: { email: 'test-diagnostic@test.com' }
            });

            if (!testParent) {
                console.log('📝 Création d\'un parent de test...');
                testParent = await prisma.user.create({
                    data: {
                        email: 'test-diagnostic@test.com',
                        password: 'test123',
                        firstName: 'Test',
                        lastName: 'Parent',
                        phone: '0123456789',
                        adress: '123 rue de test',
                        role: 'PARENT'
                    }
                });
                console.log(`   ✅ Parent de test créé (ID: ${testParent.id})`);
            }

            // Trouver une classe pour le test
            const testClass = await prisma.classe.findFirst({
                where: { nom: 'CP' }
            });

            if (testClass) {
                // Créer un étudiant de test
                const testStudent = await prisma.student.create({
                    data: {
                        firstName: 'Test',
                        lastName: 'Student',
                        dateNaissance: new Date('2015-09-15'),
                        parentId: testParent.id,
                        classeId: testClass.id
                    }
                });

                console.log(`✅ Étudiant de test créé avec succès !`);
                console.log(`   - Nom : ${testStudent.firstName} ${testStudent.lastName}`);
                console.log(`   - Parent ID : ${testStudent.parentId}`);
                console.log(`   - Classe ID : ${testStudent.classeId}`);

                // Nettoyer immédiatement
                await prisma.student.delete({ where: { id: testStudent.id } });
                console.log('🧹 Étudiant de test supprimé');

                // Supprimer le parent de test seulement s'il n'a pas d'autres enfants
                const otherChildren = await prisma.student.count({
                    where: { parentId: testParent.id }
                });
                
                if (otherChildren === 0) {
                    await prisma.user.delete({ where: { id: testParent.id } });
                    console.log('🧹 Parent de test supprimé');
                }

            } else {
                console.log('❌ Aucune classe disponible pour le test');
            }

        } catch (error) {
            console.log('❌ Erreur lors du test de création :', error.message);
            
            if (error.message.includes('Foreign key constraint')) {
                console.log('🚨 PROBLÈME PERSISTANT : Contrainte de clé étrangère');
                console.log('💡 Vérifiez que la base de données est correctement migrée');
                console.log('💡 Commande : npx prisma migrate reset --force');
            }
        }

        // 5. Résumé final
        console.log('\n📋 RÉSUMÉ DE LA CORRECTION :');
        console.log('='.repeat(50));
        
        const finalClassCount = await prisma.classe.count();
        const finalStudentCount = await prisma.student.count();
        const studentsWithValidClass = await prisma.student.count({
            where: {
                classe: {
                    id: {
                        not: undefined
                    }
                }
            }
        });

        console.log(`📚 Classes après correction : ${finalClassCount}`);
        console.log(`👶 Étudiants après correction : ${finalStudentCount}`);
        console.log(`✅ Étudiants avec classe valide : ${studentsWithValidClass}`);

        if (finalClassCount > 0 && studentsWithValidClass === finalStudentCount) {
            console.log('✅ CORRECTION RÉUSSIE : Prêt pour les inscriptions !');
        } else {
            console.log('⚠️  ATTENTION : Problèmes subsistants détectés');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la correction :', error);
        
        // Suggestions selon le type d'erreur
        if (error.message.includes('does not exist')) {
            console.log('💡 SOLUTION : Exécuter les migrations Prisma');
            console.log('   npx prisma migrate reset --force');
            console.log('   npx prisma migrate deploy');
        } else if (error.message.includes('duplicate key')) {
            console.log('💡 SOLUTION : Certaines données existent déjà, c\'est normal');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter la correction
if (require.main === module) {
    fixClassConstraint().catch(console.error);
}

module.exports = { fixClassConstraint };