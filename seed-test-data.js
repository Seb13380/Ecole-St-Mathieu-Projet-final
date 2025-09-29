const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * 🎯 SEED DE TEST POUR VALIDATION
 * Créer des données cohérentes pour tester les relations
 */

async function seedTestData() {
    try {
        console.log('🌱 CRÉATION DE DONNÉES DE TEST\n');

        // 1. Créer des parents de test
        const parent1 = await prisma.user.create({
            data: {
                firstName: 'Sophie',
                lastName: 'Martin',
                email: 'sophie.martin@test.com',
                password: await bcrypt.hash('password123', 10),
                adress: '123 Rue de la Paix',
                phone: '06.11.22.33.44',
                role: 'PARENT'
            }
        });

        const parent2 = await prisma.user.create({
            data: {
                firstName: 'Pierre',
                lastName: 'Dubois',
                email: 'pierre.dubois@test.com',
                password: await bcrypt.hash('password123', 10),
                adress: '456 Avenue des Champs',
                phone: '06.55.66.77.88',
                role: 'PARENT'
            }
        });

        console.log('✅ Parents créés:', parent1.firstName, parent1.lastName, 'et', parent2.firstName, parent2.lastName);

        // 2. Créer des classes
        const classe1 = await prisma.classe.create({
            data: {
                nom: 'CE1-A',
                niveau: 'CE1',
                description: 'Classe de CE1 groupe A'
            }
        });

        const classe2 = await prisma.classe.create({
            data: {
                nom: 'CP-B',
                niveau: 'CP',
                description: 'Classe de CP groupe B'
            }
        });

        console.log('✅ Classes créées:', classe1.nom, 'et', classe2.nom);

        // 3. Créer des enfants AVEC parentId (ancien système)
        const enfant1 = await prisma.student.create({
            data: {
                firstName: 'Lucas',
                lastName: 'Martin',
                dateNaissance: new Date('2018-03-15'),
                parentId: parent1.id, // Lié au parent via l'ancien système
                classeId: classe1.id
            }
        });

        const enfant2 = await prisma.student.create({
            data: {
                firstName: 'Emma',
                lastName: 'Dubois',
                dateNaissance: new Date('2019-07-20'),
                parentId: parent2.id, // Lié au parent via l'ancien système
                classeId: classe2.id
            }
        });

        // 4. Créer un enfant SANS parentId (pour tester)
        const enfant3 = await prisma.student.create({
            data: {
                firstName: 'Marie',
                lastName: 'Orpheline',
                dateNaissance: new Date('2017-12-10'),
                parentId: null, // ORPHELIN pour test
                classeId: classe1.id
            }
        });

        console.log('✅ Enfants créés:', enfant1.firstName, enfant2.firstName, 'et', enfant3.firstName, '(orphelin)');

        // 5. Créer des relations dans la nouvelle table ParentStudent
        await prisma.parentStudent.create({
            data: {
                parentId: parent1.id,
                studentId: enfant1.id
            }
        });

        await prisma.parentStudent.create({
            data: {
                parentId: parent2.id,
                studentId: enfant2.id
            }
        });

        console.log('✅ Relations ParentStudent créées');

        // 6. Créer une demande d'identifiants de test
        await prisma.credentialsRequest.create({
            data: {
                requestedEmail: 'sophie.martin@test.com',
                requestedFirstName: 'Sophie',
                requestedLastName: 'Martin',
                status: 'PENDING'
            }
        });

        console.log('✅ Demande d\'identifiants de test créée');

        console.log('\n🎯 DONNÉES DE TEST CRÉÉES AVEC SUCCÈS !');
        console.log('- 2 parents avec comptes');
        console.log('- 3 enfants (2 avec parents, 1 orphelin)');
        console.log('- 2 classes');
        console.log('- Relations dans les deux systèmes');
        console.log('- 1 demande d\'identifiants');

    } catch (error) {
        console.error('❌ Erreur création données test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedTestData();