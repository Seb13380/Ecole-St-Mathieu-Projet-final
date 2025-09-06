const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fixUsers() {
    try {
        console.log('🔧 === Correction des utilisateurs en production ===\n');

        // Définir les utilisateurs
        const users = [
            {
                firstName: 'Lionel',
                lastName: 'Camboulives',
                email: 'l.camboulives@stmathieu.org',
                password: 'Lionel123!',
                role: 'DIRECTION',
                adress: 'École Saint-Mathieu',
                phone: '04.91.12.34.56'
            },
            {
                firstName: 'Frank',
                lastName: 'Quaracino',
                email: 'frank.quaracino@orange.fr',
                password: 'Frank123!',
                role: 'GESTIONNAIRE_SITE',
                adress: 'École Saint-Mathieu',
                phone: '04.91.23.45.67'
            },
            {
                firstName: 'Sébastien',
                lastName: 'GIORDANO',
                email: 'sgdigitalweb13@gmail.com',
                password: 'Paul3726&',
                role: 'ADMIN',
                adress: 'Administrateur système',
                phone: '04.91.45.67.89'
            },
            {
                firstName: 'Yamina',
                lastName: 'Secrétaire',
                email: 'ecole-saint-mathieu@wanadoo.fr',
                password: 'Yamina123!',
                role: 'SECRETAIRE_DIRECTION',
                adress: 'École Saint-Mathieu',
                phone: '04.91.34.56.78'
            }
        ];

        // Étape 1: Créer les utilisateurs qui n'existent pas encore
        for (const userData of users) {
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            });

            if (existingUser) {
                console.log(`✅ Utilisateur existant trouvé: ${userData.email} (ID: ${existingUser.id})`);

                // Mettre à jour le mot de passe seulement
                const hashedPassword = await bcrypt.hash(userData.password, 12);
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        password: hashedPassword,
                        role: userData.role
                    }
                });
                console.log(`🔄 Mot de passe mis à jour pour: ${userData.email}`);
            } else {
                // Créer un nouvel utilisateur
                const hashedPassword = await bcrypt.hash(userData.password, 12);
                const newUser = await prisma.user.create({
                    data: {
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                        password: hashedPassword,
                        role: userData.role,
                        adress: userData.adress,
                        phone: userData.phone
                    }
                });
                console.log(`✅ Nouvel utilisateur créé: ${userData.email} (ID: ${newUser.id})`);
            }
        }

        console.log('\n🎉 Correction terminée avec succès !');
        console.log('\n📝 Identifiants de connexion :');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        users.forEach(user => {
            console.log(`👤 ${user.firstName} ${user.lastName}`);
            console.log(`   📧 ${user.email}`);
            console.log(`   🔑 ${user.password}`);
            console.log(`   👔 ${user.role}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixUsers();
