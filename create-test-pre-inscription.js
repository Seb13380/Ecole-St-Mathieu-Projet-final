const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestPreInscription() {
    try {
        console.log('🚀 Création d\'une pré-inscription de test...');

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash('Parent2025!', 10);

        const preInscription = await prisma.preInscription.create({
            data: {
                childFirstName: 'Emma',
                childLastName: 'Durand',
                childDateNaissance: new Date('2017-05-15'),
                parentFirstName: 'Julien',
                parentLastName: 'Durand',
                parentEmail: 'julien.durand@email.fr',
                parentPhone: '06 12 34 56 78',
                parentAdress: '123 Rue de la Paix, 75001 Paris',
                parentPassword: hashedPassword,
                status: 'PENDING'
            }
        });

        console.log('✅ Pré-inscription de test créée avec succès:');
        console.log(`   ID: #${preInscription.id}`);
        console.log(`   Enfant: ${preInscription.childFirstName} ${preInscription.childLastName}`);
        console.log(`   Parent: ${preInscription.parentFirstName} ${preInscription.parentLastName}`);
        console.log(`   Email: ${preInscription.parentEmail}`);
        console.log(`   Statut: ${preInscription.status}`);
        console.log(`   Date: ${preInscription.createdAt.toLocaleDateString('fr-FR')}`);

        console.log('\n📧 Vous pouvez maintenant:');
        console.log('1. Visiter http://localhost:3000/pre-inscription pour voir le formulaire');
        console.log('2. Se connecter en tant que Lionel ou Admin pour voir http://localhost:3000/admin/pre-inscriptions');
        console.log('3. Tester l\'approbation/rejet de cette pré-inscription de test');

    } catch (error) {
        console.error('❌ Erreur lors de la création de la pré-inscription de test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestPreInscription();
