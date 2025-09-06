// Script pour tester le système de demandes d'identifiants
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestCredentialsRequests() {
    try {
        console.log('🔑 Création de demandes d\'identifiants de test...');

        // Rechercher des parents existants
        const parents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            take: 3
        });

        console.log(`📋 Trouvé ${parents.length} parent(s) dans la base de données`);

        // Créer quelques demandes de test
        const testRequests = [
            {
                requestedFirstName: 'Marie',
                requestedLastName: 'Martin',
                requestedEmail: 'marie.martin@email.com',
                requestedPhone: '06.12.34.56.78',
                status: 'PENDING',
                foundParentId: parents[0]?.id || null
            },
            {
                requestedFirstName: 'Pierre',
                requestedLastName: 'Durand',
                requestedEmail: 'pierre.durand@email.com',
                requestedPhone: '06.23.45.67.89',
                status: 'PENDING',
                foundParentId: parents[1]?.id || null
            },
            {
                requestedFirstName: 'Sophie',
                requestedLastName: 'Bernard',
                requestedEmail: 'sophie.bernard@email.com',
                requestedPhone: '06.34.56.78.90',
                status: 'PROCESSING',
                foundParentId: parents[2]?.id || null
            },
            {
                requestedFirstName: 'Thomas',
                requestedLastName: 'Rousseau',
                requestedEmail: 'thomas.rousseau@email.com',
                requestedPhone: '06.45.67.89.01',
                status: 'COMPLETED',
                foundParentId: null, // Pas trouvé dans le système
                processedAt: new Date(),
                processed: true,
                identifiersSent: true
            },
            {
                requestedFirstName: 'Anne',
                requestedLastName: 'Petit',
                requestedEmail: 'anne.petit@email.com',
                requestedPhone: '06.56.78.90.12',
                status: 'REJECTED',
                foundParentId: null,
                processedAt: new Date(),
                processed: true,
                adminNotes: 'Informations non vérifiables'
            }
        ];

        // Supprimer les anciennes demandes de test
        await prisma.credentialsRequest.deleteMany({
            where: {
                requestedEmail: {
                    in: testRequests.map(req => req.requestedEmail)
                }
            }
        });

        // Créer les nouvelles demandes
        for (const request of testRequests) {
            await prisma.credentialsRequest.create({
                data: request
            });
            console.log(`✅ Demande créée pour ${request.requestedFirstName} ${request.requestedLastName}`);
        }

        console.log('\n📊 Résumé des demandes créées:');
        const counts = await Promise.all([
            prisma.credentialsRequest.count({ where: { status: 'PENDING' } }),
            prisma.credentialsRequest.count({ where: { status: 'PROCESSING' } }),
            prisma.credentialsRequest.count({ where: { status: 'COMPLETED' } }),
            prisma.credentialsRequest.count({ where: { status: 'REJECTED' } })
        ]);

        console.log(`- En attente: ${counts[0]}`);
        console.log(`- En traitement: ${counts[1]}`);
        console.log(`- Complétées: ${counts[2]}`);
        console.log(`- Rejetées: ${counts[3]}`);

        console.log('\n🎉 Demandes de test créées avec succès !');
        console.log('Vous pouvez maintenant aller sur http://localhost:3007/directeur/credentials pour les voir');

    } catch (error) {
        console.error('❌ Erreur lors de la création des demandes de test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
createTestCredentialsRequests();
