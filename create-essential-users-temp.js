const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createEssentialUsers() {
    try {
        console.log('🔄 Création des utilisateurs essentiels...');

        // Vérifier si les utilisateurs existent déjà
        const existingUsers = await prisma.user.findMany({
            where: {
                email: {
                    in: [
                        'lionel.camboulives@ecole-saint-mathieu.fr',
                        'frank.martin@ecole-saint-mathieu.fr',
                        'sebastien.cecchini@ecole-saint-mathieu.fr',
                        'yamina.madjdi@ecole-saint-mathieu.fr'
                    ]
                }
            }
        });

        console.log(`Utilisateurs existants: ${existingUsers.length}`);
        existingUsers.forEach(u => console.log(`- ${u.email}`));

        // Mots de passe par défaut (à changer après première connexion)
        const defaultPassword = await bcrypt.hash('EcoleSaintMathieu2024!', 10);

        const usersToCreate = [];

        // Lionel - Directeur (vérifier s'il existe déjà)
        const lionelExists = existingUsers.find(u => u.email === 'lionel.camboulives@ecole-saint-mathieu.fr');
        if (!lionelExists) {
            usersToCreate.push({
                firstName: 'Lionel',
                lastName: 'Camboulives',
                adress: '1 Place du Directeur, 13000 Marseille',
                phone: '04.91.00.00.00',
                email: 'lionel.camboulives@ecole-saint-mathieu.fr',
                password: defaultPassword,
                role: 'DIRECTION'
            });
        } else {
            // Vérifier si Lionel a tous les champs requis
            const lionel = await prisma.user.findFirst({
                where: { email: 'lionel.camboulives@ecole-saint-mathieu.fr' }
            });

            if (!lionel.adress || !lionel.phone) {
                console.log('🔄 Mise à jour de Lionel avec les champs manquants...');
                await prisma.user.update({
                    where: { email: 'lionel.camboulives@ecole-saint-mathieu.fr' },
                    data: {
                        adress: lionel.adress || '1 Place du Directeur, 13000 Marseille',
                        phone: lionel.phone || '04.91.00.00.00'
                    }
                });
                console.log('✅ Lionel mis à jour');
            }
        }

        // Frank - Gestionnaire
        const frankExists = existingUsers.find(u => u.email === 'frank.martin@ecole-saint-mathieu.fr');
        if (!frankExists) {
            usersToCreate.push({
                firstName: 'Frank',
                lastName: 'Martin',
                adress: '123 Avenue de l\'École, 13000 Marseille',
                phone: '04.91.00.00.01',
                email: 'frank.martin@ecole-saint-mathieu.fr',
                password: defaultPassword,
                role: 'GESTIONNAIRE_SITE'
            });
        }

        // Sébastien (Vous) - Admin
        const sebExists = existingUsers.find(u => u.email === 'sebastien.cecchini@ecole-saint-mathieu.fr');
        if (!sebExists) {
            usersToCreate.push({
                firstName: 'Sébastien',
                lastName: 'Cecchini',
                adress: '456 Rue de la Technologie, 13000 Marseille',
                phone: '04.91.00.00.02',
                email: 'sebastien.cecchini@ecole-saint-mathieu.fr',
                password: defaultPassword,
                role: 'ADMIN'
            });
        }

        // Yamina - Secrétaire
        const yaminaExists = existingUsers.find(u => u.email === 'yamina.madjdi@ecole-saint-mathieu.fr');
        if (!yaminaExists) {
            usersToCreate.push({
                firstName: 'Yamina',
                lastName: 'Madjdi',
                adress: '789 Boulevard de l\'Administration, 13000 Marseille',
                phone: '04.91.00.00.03',
                email: 'yamina.madjdi@ecole-saint-mathieu.fr',
                password: defaultPassword,
                role: 'SECRETAIRE'
            });
        }

        // Créer les utilisateurs manquants
        if (usersToCreate.length > 0) {
            console.log(`\n📝 Création de ${usersToCreate.length} utilisateur(s)...`);

            for (const userData of usersToCreate) {
                const user = await prisma.user.create({
                    data: userData
                });
                console.log(`✅ ${userData.firstName} ${userData.lastName} (${userData.role}) créé`);
            }
        } else {
            console.log('\n✅ Tous les utilisateurs essentiels existent déjà');
        }

        // Afficher tous les utilisateurs finaux
        console.log('\n📋 Utilisateurs dans la base de données:');
        const allUsers = await prisma.user.findMany({
            orderBy: { role: 'asc' }
        });

        allUsers.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });

        console.log('\n🔐 Mot de passe par défaut pour tous: EcoleSaintMathieu2024!');
        console.log('⚠️  Pensez à changer les mots de passe après la première connexion');

    } catch (error) {
        console.error('❌ Erreur lors de la création des utilisateurs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createEssentialUsers();
