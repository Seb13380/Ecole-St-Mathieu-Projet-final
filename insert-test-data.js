// Script pour insérer des données de test dans la base Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function insertTestData() {
    console.log('🧪 Insertion de données de test pour les classes demandées...');

    try {
        // Créer des pré-inscriptions de test avec le statut ACCEPTED
        const testPreInscription1 = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Jean',
                parentLastName: 'Dupont',
                parentEmail: 'jean.dupont@test.com',
                parentPhone: '0123456789',
                parentAddress: '123 Rue de la Paix, 75001 Paris',
                parentPassword: 'IDENTIFIANTS_A_DEMANDER', // Placeholder temporaire
                status: 'ACCEPTED',
                emailValidated: true,
                children: JSON.stringify([
                    {
                        firstName: 'Pierre',
                        lastName: 'Dupont',
                        birthDate: '2018-06-15',
                        requestedClass: 'CP'
                    }
                ]),
                message: JSON.stringify({
                    familySituation: 'married',
                    livesWithBothParents: 'true'
                })
            }
        });

        const testPreInscription2 = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Marie',
                parentLastName: 'Martin',
                parentEmail: 'marie.martin@test.com',
                parentPhone: '0987654321',
                parentAddress: '456 Avenue des Tests, 75002 Paris',
                parentPassword: 'IDENTIFIANTS_A_DEMANDER',
                status: 'ACCEPTED',
                emailValidated: true,
                children: JSON.stringify([
                    {
                        firstName: 'Julie',
                        lastName: 'Martin',
                        birthDate: '2017-03-22',
                        requestedClass: 'CE1'
                    }
                ]),
                message: JSON.stringify({
                    familySituation: 'married',
                    livesWithBothParents: 'true'
                })
            }
        });

        const testPreInscription3 = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Sophie',
                parentLastName: 'Dubois',
                parentEmail: 'sophie.dubois@test.com',
                parentPhone: '0555666777',
                parentAddress: '789 Boulevard des Écoles, 75003 Paris',
                parentPassword: 'IDENTIFIANTS_A_DEMANDER',
                status: 'ACCEPTED',
                emailValidated: true,
                children: JSON.stringify([
                    {
                        firstName: 'Lucas',
                        lastName: 'Dubois',
                        birthDate: '2016-09-10',
                        requestedClass: 'CE2'
                    },
                    {
                        firstName: 'Emma',
                        lastName: 'Dubois',
                        birthDate: '2019-12-05',
                        requestedClass: 'PS'
                    }
                ]),
                message: JSON.stringify({
                    familySituation: 'married',
                    livesWithBothParents: 'true'
                })
            }
        });

        console.log('✅ Données de test insérées avec succès !');
        console.log('📊 IDs créés:');
        console.log(`  - ${testPreInscription1.id} (Jean Dupont - CP)`);
        console.log(`  - ${testPreInscription2.id} (Marie Martin - CE1)`);
        console.log(`  - ${testPreInscription3.id} (Sophie Dubois - CE2 + PS)`);

        // Vérifier les données insérées
        const allAccepted = await prisma.preInscriptionRequest.findMany({
            where: { status: 'ACCEPTED' },
            orderBy: { submittedAt: 'desc' }
        });

        console.log(`\n🎯 Total de pré-inscriptions ACCEPTED: ${allAccepted.length}`);

        allAccepted.forEach((req, index) => {
            const children = JSON.parse(req.children);
            console.log(`  ${index + 1}. ${req.parentFirstName} ${req.parentLastName}`);
            children.forEach((child, childIndex) => {
                console.log(`     - Enfant ${childIndex + 1}: ${child.firstName} → ${child.requestedClass}`);
            });
        });

        console.log('\n🎉 Prêt pour tester la page rendez-vous-inscriptions !');

    } catch (error) {
        console.error('❌ Erreur lors de l\'insertion:', error);
    } finally {
        await prisma.$disconnect();
    }
}

insertTestData();