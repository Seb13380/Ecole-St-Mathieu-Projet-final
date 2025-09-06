// Script pour recréer tous les utilisateurs principaux
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createMainUsers() {
    try {
        console.log('👥 Création des utilisateurs principaux...\n');

        // Supprimer les anciens utilisateurs s'ils existent
        const emails = [
            'l.camboulives@stmathieu.org',
            'frank.quaracino@orange.fr',
            'sebcecg@gmail.com',
            'yamina@ecolestmathieu.fr'
        ];

        console.log('🧹 Nettoyage des anciens comptes...');
        await prisma.user.deleteMany({
            where: {
                email: { in: emails }
            }
        });

        // 1. Lionel - Directeur
        console.log('🎓 Création de Lionel (Directeur)...');
        const lionelPassword = await bcrypt.hash('Lionel123!', 10);

        const lionel = await prisma.user.create({
            data: {
                firstName: 'Lionel',
                lastName: 'Camboulives',
                email: 'l.camboulives@stmathieu.org',
                password: lionelPassword,
                phone: '06.63.78.69.68',
                adress: 'École Saint-Mathieu',
                role: 'DIRECTION'
            }
        });
        console.log('✅ Lionel créé');

        // 2. Frank - Gestionnaire Site
        console.log('🔧 Création de Frank (Gestionnaire Site)...');
        const frankPassword = await bcrypt.hash('Frank123!', 10);

        const frank = await prisma.user.create({
            data: {
                firstName: 'Frank',
                lastName: 'Quaracino',
                email: 'frank.quaracino@orange.fr',
                password: frankPassword,
                phone: '06.12.34.56.79',
                adress: 'École Saint-Mathieu',
                role: 'GESTIONNAIRE_SITE'
            }
        });
        console.log('✅ Frank créé');

        // 3. Sébastien - Parent/Admin
        console.log('👨‍👩‍👧‍👦 Création de Sébastien (Admin)...');
        const sebPassword = await bcrypt.hash('Paul3726&', 10);

        const seb = await prisma.user.create({
            data: {
                firstName: 'Sébastien',
                lastName: 'Ceccarelli',
                email: 'sebcecg@gmail.com',
                password: sebPassword,
                phone: '06.12.34.56.78',
                adress: '123 Rue de l\'École',
                role: 'ADMIN'
            }
        });
        console.log('✅ Sébastien créé');

        // 4. Yamina - Secrétaire
        console.log('👩‍💼 Création de Yamina (Secrétaire)...');
        const yaminaPassword = await bcrypt.hash('Yamina123!', 10);

        const yamina = await prisma.user.create({
            data: {
                firstName: 'Yamina',
                lastName: 'Secrétaire',
                email: 'yamina@ecolestmathieu.fr',
                password: yaminaPassword,
                phone: '04.42.31.75.12',
                adress: 'École Saint-Mathieu',
                role: 'SECRETAIRE_DIRECTION'
            }
        });
        console.log('✅ Yamina créée');

        console.log('\n🎉 UTILISATEURS CRÉÉS AVEC SUCCÈS !');
        console.log('\n📋 IDENTIFIANTS DE CONNEXION :');
        console.log('• Lionel : l.camboulives@stmathieu.org / Lionel123!');
        console.log('• Frank : frank.quaracino@orange.fr / Frank123!');
        console.log('• Sébastien : sebcecg@gmail.com / Paul3726&');
        console.log('• Yamina : yamina@ecolestmathieu.fr / Yamina123!');

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createMainUsers().then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
}).catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
});
