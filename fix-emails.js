const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetUsers() {
    console.log('🔄 Suppression des anciens utilisateurs...');

    // Supprimer les anciens utilisateurs avec les anciens emails
    await prisma.user.deleteMany({
        where: {
            email: {
                in: [
                    'lionel.camboulives@ecole-saint-mathieu.fr',
                    'frank@ecole-saint-mathieu.fr'
                ]
            }
        }
    });

    console.log('✅ Anciens utilisateurs supprimés');

    // Créer Lionel avec le bon email
    console.log('👑 Création de Lionel avec le bon email...');
    const hashedPasswordLionel = await bcrypt.hash('Directeur2025!', 10);
    await prisma.user.create({
        data: {
            firstName: 'Lionel',
            lastName: 'Camboulives',
            email: 'l.camboulives@stmathieu.org',
            password: hashedPasswordLionel,
            phone: '04.91.12.34.56',
            adress: 'École Saint-Mathieu',
            role: 'DIRECTION'
        }
    });
    console.log('✅ Lionel créé');

    // Créer Frank avec le bon email
    console.log('🔧 Création de Frank avec le bon email...');
    const hashedPasswordFrank = await bcrypt.hash('Frank2025!', 10);
    await prisma.user.create({
        data: {
            firstName: 'Frank',
            lastName: 'Gestionnaire Site',
            email: 'frank@stmathieu.org',
            password: hashedPasswordFrank,
            phone: '04.91.23.45.67',
            adress: 'École Saint-Mathieu',
            role: 'GESTIONNAIRE_SITE'
        }
    });
    console.log('✅ Frank créé');

    console.log('\n🎉 === Comptes avec les bons emails ===');
    console.log('👑 Lionel: l.camboulives@stmathieu.org / Directeur2025!');
    console.log('🔧 Frank: frank@stmathieu.org / Frank2025!');

    await prisma.$disconnect();
}

resetUsers().catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
});
