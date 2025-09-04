// Script pour créer une nouvelle demande d'identifiants via HTTP
const fetch = require('node-fetch').default || require('node-fetch');

async function createCredentialsRequest() {
    try {
        console.log('🔑 Test de création d\'une demande d\'identifiants...');

        const formData = new URLSearchParams({
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@email.com',
            phone: '06.11.22.33.44',
            childFirstName: 'Paul',
            childLastName: 'Dupont',
            childBirthDate: '2015-05-20',
            relationship: 'Père'
        });

        const response = await fetch('http://localhost:3007/credentials-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        if (response.ok) {
            console.log('✅ Demande créée avec succès !');
            console.log('Status:', response.status);

            // Vérifier que la demande a été enregistrée
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const newRequest = await prisma.credentialsRequest.findFirst({
                where: { requestedEmail: 'jean.dupont@email.com' },
                orderBy: { createdAt: 'desc' }
            });

            if (newRequest) {
                console.log('✅ Demande trouvée en base:');
                console.log(`- Nom: ${newRequest.requestedFirstName} ${newRequest.requestedLastName}`);
                console.log(`- Email: ${newRequest.requestedEmail}`);
                console.log(`- Statut: ${newRequest.status}`);
                console.log(`- Créée le: ${newRequest.createdAt}`);
            } else {
                console.log('❌ Demande non trouvée en base');
            }

            await prisma.$disconnect();

        } else {
            console.log('❌ Erreur:', response.status, response.statusText);
            const text = await response.text();
            console.log('Réponse:', text);
        }

    } catch (error) {
        console.error('❌ Erreur lors de la création de la demande:', error);
    }
}

createCredentialsRequest();
