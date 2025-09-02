const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestParents() {
    try {
        console.log('🔄 Création de parents de test...');

        // Hash du mot de passe (Test123!)
        const hashedPassword = await bcrypt.hash('Test123!', 10);

        // Parent 1 - Votre email pour les tests
        const parent1 = await prisma.user.create({
            data: {
                firstName: 'Sébastien',
                lastName: 'Parent Test',
                email: 'sebcecg@gmail.com', // Votre email personnel
                phone: '06 12 34 56 78',
                adress: '123 Rue de Test, 13000 Marseille',
                password: hashedPassword,
                role: 'PARENT'
            }
        });

        // Parent 2 - Email alternatif
        const parent2 = await prisma.user.create({
            data: {
                firstName: 'Marie',
                lastName: 'Dupont',
                email: 'sgdigitalweb13+parent2@gmail.com', // Alias de votre email pro
                phone: '06 98 76 54 32',
                adress: '456 Avenue des Tests, 13013 Marseille',
                password: hashedPassword,
                role: 'PARENT'
            }
        });

        // Parent 3 - Autre alias  
        const parent3 = await prisma.user.create({
            data: {
                firstName: 'Pierre',
                lastName: 'Martin',
                email: 'sgdigitalweb13+parent3@gmail.com', // Autre alias
                phone: '06 55 44 33 22',
                adress: '789 Boulevard des Essais, 13014 Marseille',
                password: hashedPassword,
                role: 'PARENT'
            }
        });

        console.log('✅ Parents créés avec succès !');
        console.log(`👨‍👩‍👧‍👦 Parent 1: ${parent1.firstName} ${parent1.lastName} (${parent1.email})`);
        console.log(`👨‍👩‍👧‍👦 Parent 2: ${parent2.firstName} ${parent2.lastName} (${parent2.email})`);
        console.log(`👨‍👩‍👧‍👦 Parent 3: ${parent3.firstName} ${parent3.lastName} (${parent3.email})`);

        console.log(`🔑 Mot de passe pour tous: Test123!`);

        // Vérification du nombre total de parents
        const totalParents = await prisma.user.count({
            where: { role: 'PARENT' }
        });

        console.log(`📊 Total de parents en base: ${totalParents}`);

    } catch (error) {
        console.error('❌ Erreur lors de la création des parents:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestParents();
