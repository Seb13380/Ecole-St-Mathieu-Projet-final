// Script de test pour le formulaire de pré-inscription
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPreInscriptionForm() {
    try {
        console.log('🧪 === Test du formulaire de pré-inscription ===\n');

        // Test de données
        const testData = {
            parentFirstName: 'Test',
            parentLastName: 'Parent',
            parentEmail: 'test.parent@email.com',
            parentPhone: '0123456789',
            parentAddress: '123 Rue de Test, 13000 Marseille',
            parentPassword: 'TempEcole123!',
            children: [{
                firstName: 'Test',
                lastName: 'Enfant',
                birthDate: '2018-06-15',
                currentClass: 'MS',
                requestedClass: 'GS',
                previousSchool: 'École Test'
            }],
            specialNeeds: 'Aucun besoin particulier',
            message: 'Test de pré-inscription',
            status: 'PENDING'
        };

        console.log('📋 Données de test:', JSON.stringify(testData, null, 2));

        // Tenter la création
        const preInscription = await prisma.preInscriptionRequest.create({
            data: testData
        });

        console.log(`✅ Pré-inscription créée avec succès: ID ${preInscription.id}`);

        // Vérifier la lecture
        const retrieved = await prisma.preInscriptionRequest.findUnique({
            where: { id: preInscription.id }
        });

        console.log('📖 Données récupérées:');
        console.log(`   - Parent: ${retrieved.parentFirstName} ${retrieved.parentLastName}`);
        console.log(`   - Email: ${retrieved.parentEmail}`);
        console.log(`   - Enfants: ${JSON.stringify(retrieved.children)}`);
        console.log(`   - Statut: ${retrieved.status}`);

        // Nettoyer le test
        await prisma.preInscriptionRequest.delete({
            where: { id: preInscription.id }
        });
        console.log('🧹 Données de test supprimées');

        console.log('\n✅ Le modèle de pré-inscription fonctionne correctement !');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        if (error.code) {
            console.error('Code d\'erreur:', error.code);
        }
        if (error.meta) {
            console.error('Métadonnées:', error.meta);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testPreInscriptionForm();
