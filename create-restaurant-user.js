const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createRestaurantUser() {
    try {
        console.log('🔐 Création de l\'utilisateur restauration...');

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: 'restaurant@ecole-saint-mathieu.fr' }
        });

        if (existingUser) {
            console.log('⚠️ Un utilisateur avec cet email existe déjà.');
            console.log('🔄 Mise à jour des informations...');

            // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash('Restaurant123!', 10);

            // Mettre à jour l'utilisateur existant
            const updatedUser = await prisma.user.update({
                where: { email: 'restaurant@ecole-saint-mathieu.fr' },
                data: {
                    firstName: 'Cécile',
                    lastName: 'Restaurant',
                    role: 'ADMIN',
                    password: hashedPassword,
                    phone: '04 91 12 34 56',
                    adress: 'École Saint-Mathieu',
                    createdAt: new Date()
                }
            });

            console.log('✅ Utilisateur mis à jour avec succès !');
        } else {
            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash('Restaurant123!', 10);

            // Créer le nouvel utilisateur
            const newUser = await prisma.user.create({
                data: {
                    email: 'restaurant@ecole-saint-mathieu.fr',
                    password: hashedPassword,
                    firstName: 'Cécile',
                    lastName: 'Restaurant',
                    role: 'ADMIN',
                    phone: '04 91 12 34 56',
                    adress: 'École Saint-Mathieu',
                    createdAt: new Date()
                }
            });

            console.log('🎉 Utilisateur restauration créé avec succès !');
        }

        console.log('📋 Identifiants de connexion :');
        console.log('📧 Email: restaurant@ecole-saint-mathieu.fr');
        console.log('🔑 Mot de passe: Restaurant123!');
        console.log('🔒 Rôle: ADMIN (Restauration)');
        console.log('👩 Prénom: Cécile');

        // Vérification de la connexion
        const user = await prisma.user.findUnique({
            where: { email: 'restaurant@ecole-saint-mathieu.fr' }
        });

        if (user) {
            console.log('✅ Vérification réussie - Utilisateur restauration prêt à se connecter !');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'utilisateur restauration :', error);
    } finally {
        await prisma.$disconnect();
    }
}

createRestaurantUser();
