// Script pour créer des données de test en mémoire (simulation)
const bcrypt = require('bcrypt');

async function createTestData() {
    try {
        console.log('🔧 Création des données de test en mémoire...');

        const hashedPassword = await bcrypt.hash('Paul3726&', 10);

        const testData = {
            user: {
                id: 1,
                firstName: 'Sébastien',
                lastName: 'Parent Test',
                email: 'sebcecg@gmail.com',
                password: hashedPassword,
                phone: '06.12.34.56.78',
                adress: '123 Rue de Test, 13000 Marseille',
                role: 'PARENT',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            classe: {
                id: 1,
                nom: 'CP-A',
                niveau: 'CP',
                anneeScolaire: '2024-2025'
            },
            student: {
                id: 1,
                firstName: 'Paul',
                lastName: 'Test',
                dateNaissance: new Date('2018-03-15'),
                parentId: 1,
                classeId: 1
            }
        };

        console.log('✅ Données de test créées:');
        console.log('📧 Email: sebcecg@gmail.com');
        console.log('🔑 Mot de passe: Paul3726&');
        console.log('👨‍👩‍👧‍👦 Enfant: Paul Test (CP-A)');

        // Pour l'instant, modifions le controller pour accepter ces données de test
        console.log('\n🎯 Modification du controller pour les données de test...');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

createTestData();
