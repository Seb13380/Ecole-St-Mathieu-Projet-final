const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestInscriptionRequest() {
    try {
        console.log('🧪 Création d\'une demande d\'inscription test...');

        // Créer une demande d'inscription test
        const testRequest = await prisma.inscriptionRequest.create({
            data: {
                parentFirstName: 'Amélie',
                parentLastName: 'Tester',
                parentEmail: 'amelie.test@email.com',
                parentPhone: '0123456789',
                parentAddress: '123 Rue de Test, 13000 Marseille',
                password: '$2a$12$demopasswordhash', // Hash bidon
                children: [
                    {
                        firstName: 'Emma',
                        lastName: 'Tester',
                        birthDate: '2018-09-15',
                        requestedClass: 'CP-A'
                    },
                    {
                        firstName: 'Noah',
                        lastName: 'Tester', 
                        birthDate: '2020-03-22',
                        requestedClass: 'MS-A'
                    }
                ],
                status: 'PENDING'
            }
        });

        console.log('✅ Demande test créée avec l\'ID:', testRequest.id);
        console.log('👨‍👩‍👧‍👦 Famille: Amélie Tester');
        console.log('👶 Enfants: Emma (CP-A) et Noah (MS-A)');
        console.log('📧 Email: amelie.test@email.com');
        console.log('');
        console.log('🎯 Test à effectuer:');
        console.log('1. Connectez-vous avec Lionel (l.camboulives@stmathieu.org / Lionel123!)');
        console.log('2. Allez sur http://localhost:3007/directeur/inscriptions/manage');
        console.log('3. Approuvez la demande en choisissant les classes pour chaque enfant');
        console.log('4. Vérifiez que les comptes sont créés automatiquement');
        console.log('5. Vérifiez que Yamina reçoit la notification');

        return testRequest;

    } catch (error) {
        console.error('❌ Erreur lors de la création de la demande test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestInscriptionRequest();
