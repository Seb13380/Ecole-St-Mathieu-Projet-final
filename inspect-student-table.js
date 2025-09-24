const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectStudentTable() {
    console.log('🔍 Inspection de la structure de la table Student...\n');

    try {
        // Examiner la structure de la table Student
        console.log('📋 Structure de la table Student:');
        const studentSchema = await prisma.$queryRaw`
            DESCRIBE Student;
        `;
        console.table(studentSchema);

        // Vérifier les contraintes de clé étrangère
        console.log('\n🔒 Contraintes sur la table Student:');
        const constraints = await prisma.$queryRaw`
            SELECT 
                CONSTRAINT_NAME,
                CONSTRAINT_TYPE,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'Student'
            AND REFERENCED_TABLE_NAME IS NOT NULL;
        `;
        console.table(constraints);

        // Tester une création d'étudiant avec les données minimales
        console.log('\n🧪 Test de création d\'étudiant...');

        // Trouver une classe existante
        const classe = await prisma.classe.findFirst();
        if (!classe) {
            console.log('❌ Aucune classe trouvée');
            return;
        }

        console.log(`📚 Classe de test trouvée: ${classe.nom} (ID: ${classe.id})`);

        // Tester la création avec les données exactes du code
        const testData = {
            firstName: 'Test',
            lastName: 'Student',
            dateNaissance: new Date('2018-05-15'),
            classeId: classe.id
        };

        console.log('\n📋 Données de test:');
        console.log(testData);

        try {
            const testStudent = await prisma.student.create({
                data: testData
            });
            console.log('\n✅ SUCCESS! Étudiant créé avec succès');
            console.log(`   ID: ${testStudent.id}`);
            console.log(`   Nom: ${testStudent.firstName} ${testStudent.lastName}`);

            // Nettoyer immédiatement
            await prisma.student.delete({ where: { id: testStudent.id } });
            console.log('🧹 Étudiant de test supprimé');

        } catch (createError) {
            console.log('\n❌ ERREUR lors de la création:');
            console.log(`   Message: ${createError.message}`);
            console.log(`   Code: ${createError.code}`);

            if (createError.message.includes('parentId')) {
                console.log('\n🚨 PROBLÈME IDENTIFIÉ: Le champ parentId existe encore dans la base');
                console.log('   Solution: Migration nécessaire pour supprimer ce champ');
            }
        }

    } catch (error) {
        console.error('❌ Erreur inspection:', error);
    } finally {
        await prisma.$disconnect();
    }
}

inspectStudentTable();