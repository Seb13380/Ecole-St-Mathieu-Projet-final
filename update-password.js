const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updateUserPassword() {
    try {
        // ⚠️ MODIFIEZ CES VALEURS SELON VOS BESOINS
        const EMAIL_TO_UPDATE = 'l.camboulives@orange.fr'; // Email de l'utilisateur à modifier
        const NEW_PASSWORD = 'StMathieu2025!'; // Nouveau mot de passe

        console.log(`🔐 Recherche de l'utilisateur avec l'email: ${EMAIL_TO_UPDATE}`);

        // Vérifier si l'utilisateur existe
        const existingUser = await prisma.user.findUnique({
            where: { email: EMAIL_TO_UPDATE }
        });

        if (!existingUser) {
            console.log('❌ Aucun utilisateur trouvé avec cet email.');
            console.log('📋 Utilisateurs disponibles :');

            // Afficher la liste des utilisateurs
            const allUsers = await prisma.user.findMany({
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true
                }
            });

            allUsers.forEach(user => {
                console.log(`   📧 ${user.email} - ${user.firstName} ${user.lastName} (${user.role})`);
            });

            return;
        }

        console.log(`✅ Utilisateur trouvé: ${existingUser.firstName} ${existingUser.lastName} (${existingUser.role})`);

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

        // Mettre à jour le mot de passe
        const updatedUser = await prisma.user.update({
            where: { email: EMAIL_TO_UPDATE },
            data: {
                password: hashedPassword
            }
        });

        console.log('🎉 Mot de passe mis à jour avec succès !');
        console.log('\n📋 Nouvelles informations de connexion :');
        console.log(`📧 Email: ${EMAIL_TO_UPDATE}`);
        console.log(`🔑 Nouveau mot de passe: ${NEW_PASSWORD}`);
        console.log(`🔒 Rôle: ${existingUser.role}`);
        console.log('\n✅ L\'utilisateur peut maintenant se connecter avec ce nouveau mot de passe !');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du mot de passe:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUserPassword();
