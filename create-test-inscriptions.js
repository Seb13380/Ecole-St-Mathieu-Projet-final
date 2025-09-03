const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestInscriptions() {
    try {
        console.log('🎯 Création de demandes d\'inscription test...');

        // Supprimer les anciennes demandes test
        await prisma.preInscriptionRequest.deleteMany({
            where: {
                parentEmail: {
                    contains: 'test'
                }
            }
        });

        // Créer 3 demandes test
        const testRequests = [
            {
                parentFirstName: 'Marie',
                parentLastName: 'Dupont',
                parentEmail: 'marie.dupont.test@email.com',
                parentPhone: '06.12.34.56.78',
                parentAddress: '123 Rue de la Paix, 75001 Paris',
                parentPassword: await bcrypt.hash('password123', 12),
                children: JSON.stringify([
                    {
                        firstName: 'Lucas',
                        lastName: 'Dupont',
                        birthDate: '2015-03-15'
                    }
                ]),
                status: 'PENDING'
            },
            {
                parentFirstName: 'Pierre',
                parentLastName: 'Martin',
                parentEmail: 'pierre.martin.test@email.com',
                parentPhone: '06.87.65.43.21',
                parentAddress: '456 Avenue des Champs, 69000 Lyon',
                parentPassword: await bcrypt.hash('password123', 12),
                children: JSON.stringify([
                    {
                        firstName: 'Emma',
                        lastName: 'Martin',
                        birthDate: '2016-09-22'
                    },
                    {
                        firstName: 'Hugo',
                        lastName: 'Martin',
                        birthDate: '2018-01-10'
                    }
                ]),
                status: 'PENDING'
            },
            {
                parentFirstName: 'Sophie',
                parentLastName: 'Bernard',
                parentEmail: 'sophie.bernard.test@email.com',
                parentPhone: '06.11.22.33.44',
                parentAddress: '789 Boulevard Victor Hugo, 13000 Marseille',
                parentPassword: await bcrypt.hash('password123', 12),
                children: JSON.stringify([
                    {
                        firstName: 'Léa',
                        lastName: 'Bernard',
                        birthDate: '2017-05-08'
                    }
                ]),
                status: 'ACCEPTED',
                processedAt: new Date(),
                adminNotes: 'Demande approuvée - Famille recommandée'
            }
        ];

        // Créer les demandes
        for (const request of testRequests) {
            await prisma.preInscriptionRequest.create({
                data: request
            });
            console.log(`✅ Demande créée pour ${request.parentFirstName} ${request.parentLastName}`);
        }

        console.log('🎉 Demandes d\'inscription test créées avec succès !');
        console.log('📝 Vous pouvez maintenant tester la page /directeur/inscriptions');

    } catch (error) {
        console.error('❌ Erreur lors de la création:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestInscriptions();
