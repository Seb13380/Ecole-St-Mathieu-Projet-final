const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestInscription() {
    try {
        console.log('🧪 Création d\'une demande de pré-inscription de test...');
        
        // Créer une demande de test
        const testRequest = await prisma.preInscriptionRequest.create({
            data: {
                parentFirstName: 'Test4',
                parentLastName: 'Parent4',
                parentEmail: 'test.parent4@example.com',
                parentPhone: '01.23.45.67.89',
                parentAddress: '123 Rue Test',
                parentPassword: 'password123',
                children: JSON.stringify([
                    {
                        firstName: 'Test4',
                        lastName: 'Enfant4',
                        birthDate: '2015-05-15',
                        schoolLevel: 'CM1'
                    }
                ]),
                status: 'PENDING'
            }
        });
        
        console.log('✅ Demande créée avec l\'ID:', testRequest.id);
        console.log('Enfants:', JSON.parse(testRequest.children));
        
        return testRequest;
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createTestInscription();
