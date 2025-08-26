const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const inscriptionController = require('./src/controllers/inscriptionController');

const prisma = new PrismaClient();

async function testAccountCreation() {
    console.log('🧪 Test de la création automatique de compte...\n');

    try {
        // 1. Créer une demande d'inscription de test
        console.log('1. Création d\'une demande d\'inscription de test...');

        const hashedPassword = await bcrypt.hash('testpassword123', 12);

        const testInscriptionRequest = await prisma.inscriptionRequest.create({
            data: {
                parentFirstName: 'Jean',
                parentLastName: 'Dupont',
                parentEmail: 'jean.dupont.test@example.com',
                parentPhone: '06 12 34 56 78',
                parentAddress: '123 rue de la Paix, 75001 Paris',
                password: hashedPassword,
                children: [
                    {
                        firstName: 'Marie',
                        lastName: 'Dupont',
                        birthDate: '2015-09-15'
                    },
                    {
                        firstName: 'Pierre',
                        lastName: 'Dupont',
                        birthDate: '2017-03-22'
                    }
                ]
            }
        });

        console.log('✅ Demande d\'inscription créée avec l\'ID:', testInscriptionRequest.id);

        // 2. Tester la création des comptes
        console.log('\n2. Test de la création des comptes...');

        const createdAccounts = await inscriptionController.createParentAndStudentAccounts(testInscriptionRequest);

        console.log('✅ Comptes créés avec succès !');
        console.log('   📧 Parent:', createdAccounts.parentUser.email);
        console.log('   👶 Enfants:', createdAccounts.students.length);

        // 3. Vérifier en base de données
        console.log('\n3. Vérification en base de données...');

        const parentInDb = await prisma.user.findUnique({
            where: { email: 'jean.dupont.test@example.com' },
            include: { enfants: true }
        });

        if (parentInDb) {
            console.log('✅ Parent trouvé en base:', parentInDb.firstName, parentInDb.lastName);
            console.log('✅ Enfants associés:', parentInDb.enfants.length);
        } else {
            console.log('❌ Parent non trouvé en base');
        }

        // 4. Nettoyage (optionnel)
        console.log('\n4. Nettoyage des données de test...');

        // Supprimer les enfants
        await prisma.student.deleteMany({
            where: { parentId: parentInDb.id }
        });

        // Supprimer le parent
        await prisma.user.delete({
            where: { id: parentInDb.id }
        });

        // Supprimer la demande d'inscription
        await prisma.inscriptionRequest.delete({
            where: { id: testInscriptionRequest.id }
        });

        console.log('✅ Données de test nettoyées');

        console.log('\n🎉 Test terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le test
testAccountCreation();
