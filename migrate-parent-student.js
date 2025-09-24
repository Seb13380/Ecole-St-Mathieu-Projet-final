// Script de migration des données existantes vers la nouvelle relation parent-enfant
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateParentStudentRelations() {
    try {
        console.log('🔄 Début de la migration des relations parent-enfant...\n');

        // 1. D'abord, créer la table ParentStudent manuellement si elle n'existe pas
        console.log('📝 Création de la table ParentStudent...');
        await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS ParentStudent (
                id INT AUTO_INCREMENT PRIMARY KEY,
                parentId INT NOT NULL,
                studentId INT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_parent_student (parentId, studentId),
                FOREIGN KEY (parentId) REFERENCES User(id) ON DELETE CASCADE,
                FOREIGN KEY (studentId) REFERENCES Student(id) ON DELETE CASCADE
            )
        `;
        console.log('✅ Table ParentStudent créée\n');

        // 2. Migrer les relations existantes
        console.log('📊 Migration des relations existantes...');

        const existingStudents = await prisma.$queryRaw`
            SELECT id, parentId, firstName, lastName 
            FROM Student 
            WHERE parentId IS NOT NULL
        `;

        console.log(`📋 ${existingStudents.length} étudiants avec parent à migrer`);

        for (const student of existingStudents) {
            // Créer la relation dans ParentStudent
            await prisma.$executeRaw`
                INSERT IGNORE INTO ParentStudent (parentId, studentId, createdAt)
                VALUES (${student.parentId}, ${student.id}, NOW())
            `;

            console.log(`  ✅ ${student.firstName} ${student.lastName} → Parent ID ${student.parentId}`);
        }

        console.log(`\n🎉 Migration terminée: ${existingStudents.length} relations créées`);

        // 3. Maintenant, chercher les familles avec deux parents pour les lier aussi
        console.log('\n🔍 Recherche des familles avec deux parents...');

        // Grouper les enfants par nom de famille pour identifier les familles
        const families = {};

        for (const student of existingStudents) {
            const parent = await prisma.$queryRaw`
                SELECT firstName, lastName, email 
                FROM User 
                WHERE id = ${student.parentId}
            `;

            const familyKey = student.lastName.toLowerCase();
            if (!families[familyKey]) {
                families[familyKey] = {
                    children: [],
                    parents: []
                };
            }

            families[familyKey].children.push(student);
            if (!families[familyKey].parents.find(p => p.id === student.parentId)) {
                families[familyKey].parents.push({
                    id: student.parentId,
                    firstName: parent[0]?.firstName,
                    lastName: parent[0]?.lastName,
                    email: parent[0]?.email
                });
            }
        }

        // Chercher les deuxièmes parents dans la même famille
        for (const [familyName, family] of Object.entries(families)) {
            if (family.parents.length === 1 && family.children.length > 0) {
                // Chercher un autre parent avec le même nom de famille
                const otherParents = await prisma.$queryRaw`
                    SELECT id, firstName, lastName, email 
                    FROM User 
                    WHERE role = 'PARENT' 
                    AND lastName LIKE ${`%${family.parents[0].lastName}%`}
                    AND id != ${family.parents[0].id}
                `;

                for (const otherParent of otherParents) {
                    console.log(`\n👫 Famille ${familyName} - Ajout du 2ème parent: ${otherParent.firstName} ${otherParent.lastName}`);

                    // Lier tous les enfants de cette famille au deuxième parent
                    for (const child of family.children) {
                        try {
                            await prisma.$executeRaw`
                                INSERT IGNORE INTO ParentStudent (parentId, studentId, createdAt)
                                VALUES (${otherParent.id}, ${child.id}, NOW())
                            `;
                            console.log(`    ✅ ${child.firstName} ${child.lastName} → ${otherParent.firstName} ${otherParent.lastName}`);
                        } catch (error) {
                            if (!error.message.includes('Duplicate')) {
                                console.log(`    ⚠️ Erreur pour ${child.firstName}: ${error.message}`);
                            }
                        }
                    }

                    family.parents.push(otherParent);
                    break; // Ne prendre qu'un seul autre parent pour éviter les confusions
                }
            }
        }

        // 4. Statistiques finales
        const totalRelations = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ParentStudent`;
        console.log(`\n📊 Statistiques finales:`);
        console.log(`   - Relations parent-enfant créées: ${totalRelations[0].count}`);

        const parentsWithChildren = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT parentId) as count FROM ParentStudent
        `;
        console.log(`   - Parents avec enfants: ${parentsWithChildren[0].count}`);

        const childrenWithMultipleParents = await prisma.$queryRaw`
            SELECT studentId, COUNT(*) as parentCount 
            FROM ParentStudent 
            GROUP BY studentId 
            HAVING COUNT(*) > 1
        `;
        console.log(`   - Enfants avec plusieurs parents: ${childrenWithMultipleParents.length}`);

        console.log('\n✅ Migration des relations parent-enfant terminée avec succès!');

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateParentStudentRelations();