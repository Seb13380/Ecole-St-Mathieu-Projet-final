// Script pour créer tous les utilisateurs principaux de l'école
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAllUsers() {
    try {
        console.log('🏫 === Création de tous les utilisateurs principaux de l\'École Saint-Mathieu ===\n');

        // Définir les utilisateurs avec les vrais identifiants
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

        // Supprimer les comptes existants s'ils existent
        for (const userData of users) {
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            });

            if (existingUser) {
                await prisma.user.delete({ where: { id: existingUser.id } });
                console.log(`🗑️ Compte existant supprimé: ${userData.email}`);
            }
        }

        console.log('');

        // Créer tous les utilisateurs
        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 12);

            const user = await prisma.user.create({
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

            console.log(`✅ ${userData.role}: ${userData.firstName} ${userData.lastName}`);
            console.log(`   📧 Email: ${userData.email}`);
            console.log(`   🔑 Mot de passe: ${userData.password}`);
            console.log('');
        }

        console.log('🎉 Tous les utilisateurs principaux ont été créés avec succès !');
        console.log('');
        console.log('👑 ACCÈS ADMINISTRATEUR COMPLET POUR SÉBASTIEN GIORDANO:');
        console.log('   - Gestion de tous les utilisateurs');
        console.log('   - Réinitialisation des mots de passe');
        console.log('   - Création/suppression de comptes');
        console.log('   - Accès à toutes les fonctionnalités admin');

        // Vérifier que Sébastien a bien le rôle ADMIN
        const sebastien = await prisma.user.findUnique({
            where: { email: 'sgdigitalweb13@gmail.com' }
        });

        if (sebastien && sebastien.role === 'ADMIN') {
            console.log('');
            console.log('✅ Sébastien GIORDANO a bien les droits administrateur complets !');
        }

        console.log('\n📝 Note importante: Paul est le fils de Sébastien, pas l\'administrateur');

    } catch (error) {
        console.error('❌ Erreur lors de la création des utilisateurs:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
createAllUsers()
    .then(() => {
        console.log('\n✅ Script terminé avec succès !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur critique:', error);
        process.exit(1);
    });
