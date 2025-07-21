const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function changeUserPassword() {
    try {
        console.log('🔐 === Changement de mot de passe ===\n');

        // Afficher tous les utilisateurs
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });

        console.log('👥 Utilisateurs disponibles :');
        console.log('--------------------------------');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });
        console.log('');

        // Demander quel utilisateur modifier
        const userChoice = await askQuestion('🔢 Choisissez le numéro de l\'utilisateur (ou tapez son email) : ');

        let selectedUser;

        // Vérifier si c'est un numéro ou un email
        if (!isNaN(userChoice) && userChoice >= 1 && userChoice <= users.length) {
            selectedUser = users[parseInt(userChoice) - 1];
        } else {
            selectedUser = users.find(user => user.email.toLowerCase() === userChoice.toLowerCase());
        }

        if (!selectedUser) {
            console.log('❌ Utilisateur non trouvé !');
            return;
        }

        console.log(`\n✅ Utilisateur sélectionné : ${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})`);

        // Demander le nouveau mot de passe
        const newPassword = await askQuestion('\n🔑 Entrez le nouveau mot de passe : ');

        if (newPassword.length < 6) {
            console.log('❌ Le mot de passe doit contenir au moins 6 caractères !');
            return;
        }

        // Confirmation
        const confirm = await askQuestion(`\n⚠️  Confirmez-vous le changement de mot de passe pour ${selectedUser.email} ? (oui/non) : `);

        if (confirm.toLowerCase() !== 'oui' && confirm.toLowerCase() !== 'o' && confirm.toLowerCase() !== 'yes') {
            console.log('❌ Annulé par l\'utilisateur.');
            return;
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour en base
        await prisma.user.update({
            where: { id: selectedUser.id },
            data: { password: hashedPassword }
        });

        console.log('\n🎉 Mot de passe changé avec succès !');
        console.log('📋 Nouvelles informations de connexion :');
        console.log(`📧 Email: ${selectedUser.email}`);
        console.log(`🔑 Nouveau mot de passe: ${newPassword}`);
        console.log(`🎭 Rôle: ${selectedUser.role}`);

    } catch (error) {
        console.error('❌ Erreur lors du changement de mot de passe:', error);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

// Fonction pour créer un directeur si besoin
async function createDirector() {
    try {
        console.log('👑 === Création d\'un compte Directeur ===\n');

        const email = await askQuestion('📧 Email du directeur : ');
        const firstName = await askQuestion('👤 Prénom : ');
        const lastName = await askQuestion('👤 Nom : ');
        const password = await askQuestion('🔑 Mot de passe : ');

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            console.log('⚠️  Un utilisateur avec cet email existe déjà.');
            const update = await askQuestion('🔄 Voulez-vous le mettre à jour vers le rôle DIRECTION ? (oui/non) : ');

            if (update.toLowerCase() === 'oui' || update.toLowerCase() === 'o') {
                const hashedPassword = await bcrypt.hash(password, 10);
                await prisma.user.update({
                    where: { email: email },
                    data: {
                        password: hashedPassword,
                        role: 'DIRECTION',
                        firstName: firstName,
                        lastName: lastName
                    }
                });
                console.log('✅ Utilisateur mis à jour vers DIRECTION !');
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hashedPassword,
                    phone: '00.00.00.00.00',
                    adress: 'École Saint-Mathieu',
                    role: 'DIRECTION'
                }
            });
            console.log('🎉 Compte Directeur créé avec succès !');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la création du directeur:', error);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

// Menu principal
async function main() {
    console.log('🏫 === Gestion des comptes École Saint-Mathieu ===\n');
    console.log('1. Changer le mot de passe d\'un utilisateur');
    console.log('2. Créer un compte Directeur');
    console.log('');

    const choice = await askQuestion('🔢 Choisissez une option (1 ou 2) : ');

    switch (choice) {
        case '1':
            await changeUserPassword();
            break;
        case '2':
            await createDirector();
            break;
        default:
            console.log('❌ Choix invalide !');
            rl.close();
            await prisma.$disconnect();
    }
}

main();
