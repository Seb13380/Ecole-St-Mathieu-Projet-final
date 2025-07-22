const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createParentSeb() {
    try {
        console.log('🔐 Création du parent Seb...');

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: 'sebcecg@gmail.com' }
        });

        if (existingUser) {
            console.log('⚠️ Un utilisateur avec cet email existe déjà.');
            console.log('🔄 Mise à jour des informations...');

            // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash('Paul3726&', 10);

            // Mettre à jour l'utilisateur existant
            const updatedUser = await prisma.user.update({
                where: { email: 'sebcecg@gmail.com' },
                data: {
                    firstName: 'Sébastien',
                    lastName: 'Ceccarelli',
                    role: 'PARENT',
                    password: hashedPassword,
                    phone: '06 12 34 56 78',
                    adress: '123 Rue de l\'École',
                    createdAt: new Date()
                }
            });

            console.log('✅ Utilisateur mis à jour avec succès !');
        } else {
            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash('Paul3726&', 10);

            // Créer le nouvel utilisateur
            const newUser = await prisma.user.create({
                data: {
                    email: 'sebcecg@gmail.com',
                    password: hashedPassword,
                    firstName: 'Sébastien',
                    lastName: 'Ceccarelli',
                    role: 'PARENT',
                    phone: '06 12 34 56 78',
                    adress: '123 Rue de l\'École',
                    createdAt: new Date()
                }
            });

            console.log('🎉 Parent créé avec succès !');
        }

        console.log('📋 Identifiants de connexion :');
        console.log('📧 Email: sebcecg@gmail.com');
        console.log('🔑 Mot de passe: Paul3726&');
        console.log('🔒 Rôle: PARENT');

        // Vérification de la connexion
        const user = await prisma.user.findUnique({
            where: { email: 'sebcecg@gmail.com' }
        });

        if (user) {
            console.log('✅ Vérification réussie - Parent prêt à se connecter !');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la création du parent :', error);
    } finally {
        await prisma.$disconnect();
    }
}

createParentSeb();
