const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createMainUsers() {
    console.log('👥 Création des utilisateurs principaux...\n');

    try {
        // 1. Lionel Camboulives - Directeur
        console.log('🏫 Création de Lionel Camboulives (Directeur)...');
        const hashedPasswordLionel = await bcrypt.hash('mot-de-passe-sécurisé', 10);

        const lionel = await prisma.user.upsert({
            where: { email: 'lionel@ecole-st-mathieu.fr' },
            update: {},
            create: {
                firstName: 'Lionel',
                lastName: 'Camboulives',
                email: 'lionel@ecole-st-mathieu.fr',
                password: hashedPasswordLionel,
                role: 'DIRECTION',
                adress: '1 Rue de l\'École',
                phone: '0123456789'
            }
        });
        console.log(`✅ Lionel créé avec l'ID: ${lionel.id}`);

        // 2. Frank - Gestionnaire du site
        console.log('\n💻 Création de Frank (Gestionnaire Site)...');
        const hashedPasswordFrank = await bcrypt.hash('mot-de-passe-sécurisé', 10);

        const frank = await prisma.user.upsert({
            where: { email: 'frank@ecole-st-mathieu.fr' },
            update: {},
            create: {
                firstName: 'Frank',
                lastName: 'Gestionnaire',
                email: 'frank@ecole-st-mathieu.fr',
                password: hashedPasswordFrank,
                role: 'GESTIONNAIRE_SITE',
                adress: '2 Rue du Web',
                phone: '0123456790'
            }
        });
        console.log(`✅ Frank créé avec l'ID: ${frank.id}`);

        // 3. Seb - Parent test
        console.log('\n👨‍👩‍👧‍👦 Création de Seb (Parent test)...');
        const hashedPasswordSeb = await bcrypt.hash('motdepasse', 10);

        const seb = await prisma.user.upsert({
            where: { email: 'seb@parent.fr' },
            update: {},
            create: {
                firstName: 'Sébastien',
                lastName: 'Parent',
                email: 'seb@parent.fr',
                password: hashedPasswordSeb,
                role: 'PARENT',
                adress: '3 Rue des Parents',
                phone: '0123456791'
            }
        });
        console.log(`✅ Seb créé avec l'ID: ${seb.id}`);

        // 4. Yamina - Secrétaire de direction
        console.log('\n📋 Création de Yamina (Secrétaire Direction)...');
        const hashedPasswordYamina = await bcrypt.hash('mot-de-passe-sécurisé', 10);

        const yamina = await prisma.user.upsert({
            where: { email: 'yamina@ecole-st-mathieu.fr' },
            update: {},
            create: {
                firstName: 'Yamina',
                lastName: 'Secrétaire',
                email: 'yamina@ecole-st-mathieu.fr',
                password: hashedPasswordYamina,
                role: 'SECRETAIRE_DIRECTION',
                adress: '4 Rue du Secrétariat',
                phone: '0123456792'
            }
        });
        console.log(`✅ Yamina créée avec l'ID: ${yamina.id}`);

        console.log('\n🎉 TOUS LES UTILISATEURS PRINCIPAUX CRÉÉS !');
        console.log('\n📱 Accès:');
        console.log('🏫 Directeur: lionel@ecole-st-mathieu.fr / mot-de-passe-sécurisé');
        console.log('💻 Gestionnaire site: frank@ecole-st-mathieu.fr / mot-de-passe-sécurisé');
        console.log('👨‍👩‍👧‍👦 Parent test: seb@parent.fr / motdepasse');
        console.log('📋 Secrétaire: yamina@ecole-st-mathieu.fr / mot-de-passe-sécurisé');

    } catch (error) {
        console.error('❌ Erreur lors de la création des utilisateurs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createMainUsers();
