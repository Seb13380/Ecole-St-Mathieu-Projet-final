const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function interactivePasswordUpdate() {
    try {
        console.log('🔐 Gestionnaire de mots de passe - École Saint-Mathieu\n');

        // Afficher tous les utilisateurs
        console.log('📋 Liste des utilisateurs disponibles :');
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
            },
            orderBy: {
                role: 'asc'
            }
        });

        allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. 📧 ${user.email}`);
            console.log(`      👤 ${user.firstName} ${user.lastName} (${user.role})\n`);
        });

        // Demander quel utilisateur modifier
        const emailChoice = await question('📧 Entrez l\'email de l\'utilisateur à modifier : ');

        const userToUpdate = await prisma.user.findUnique({
            where: { email: emailChoice.trim() }
        });

        if (!userToUpdate) {
            console.log('❌ Utilisateur non trouvé avec cet email.');
            rl.close();
            return;
        }

        console.log(`\n✅ Utilisateur trouvé: ${userToUpdate.firstName} ${userToUpdate.lastName} (${userToUpdate.role})`);

        // Demander le nouveau mot de passe
        const newPassword = await question('🔑 Entrez le nouveau mot de passe : ');

        if (newPassword.length < 6) {
            console.log('❌ Le mot de passe doit contenir au moins 6 caractères.');
            rl.close();
            return;
        }

        // Confirmation
        const confirm = await question(`⚠️  Êtes-vous sûr de vouloir changer le mot de passe de ${userToUpdate.firstName} ${userToUpdate.lastName} ? (oui/non) : `);

        if (confirm.toLowerCase() !== 'oui' && confirm.toLowerCase() !== 'o') {
            console.log('❌ Opération annulée.');
            rl.close();
            return;
        }

        // Hasher et mettre à jour
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email: emailChoice.trim() },
            data: {
                password: hashedPassword
            }
        });

        console.log('\n🎉 Mot de passe mis à jour avec succès !');
        console.log('📋 Informations de connexion :');
        console.log(`📧 Email: ${emailChoice.trim()}`);
        console.log(`🔑 Nouveau mot de passe: ${newPassword}`);
        console.log(`🔒 Rôle: ${userToUpdate.role}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

interactivePasswordUpdate();
