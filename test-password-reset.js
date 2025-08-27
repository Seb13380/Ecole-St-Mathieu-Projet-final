const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const emailService = require('./src/services/emailService');

const prisma = new PrismaClient();

async function testPasswordResetSystem() {
    console.log('🔐 Test du système de reset de mot de passe');
    console.log('==========================================\n');

    try {
        // 1. Créer un utilisateur de test
        console.log('1️⃣ Création d\'un utilisateur de test...');

        const hashedPassword = await bcrypt.hash('motdepasse123', 10);
        const testUser = await prisma.user.create({
            data: {
                firstName: 'Test',
                lastName: 'Reset',
                email: 'test.reset@example.com',
                password: hashedPassword,
                adress: '123 Rue Test',
                phone: '0123456789',
                role: 'PARENT'
            }
        });

        console.log('   ✅ Utilisateur créé avec ID:', testUser.id);

        // 2. Test de demande de reset
        console.log('2️⃣ Test de génération du token de reset...');

        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

        const updatedUser = await prisma.user.update({
            where: { id: testUser.id },
            data: {
                resetToken: resetToken,
                resetTokenExpiry: resetTokenExpiry
            }
        });

        console.log('   ✅ Token généré:', resetToken.substring(0, 10) + '...');
        console.log('   ✅ Expiration:', resetTokenExpiry.toLocaleString('fr-FR'));

        // 3. Test d'envoi de l'email de reset
        console.log('3️⃣ Test envoi email de reset...');

        const resetEmailResult = await emailService.sendPasswordResetEmail(testUser, resetToken);

        if (resetEmailResult.success) {
            console.log('   ✅ Email de reset envoyé avec succès');
            console.log('   📧 Message ID:', resetEmailResult.messageId);
        } else {
            console.log('   ❌ Erreur envoi email reset:', resetEmailResult.error);
        }

        // 4. Test de vérification du token
        console.log('4️⃣ Test de vérification du token...');

        const userWithToken = await prisma.user.findFirst({
            where: {
                resetToken: resetToken,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (userWithToken) {
            console.log('   ✅ Token valide et non expiré');
        } else {
            console.log('   ❌ Token invalide ou expiré');
        }

        // 5. Test de changement de mot de passe
        console.log('5️⃣ Test de changement de mot de passe...');

        const newPassword = 'nouveaumotdepasse456';
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        const userAfterReset = await prisma.user.update({
            where: { id: testUser.id },
            data: {
                password: newHashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        console.log('   ✅ Mot de passe mis à jour');
        console.log('   ✅ Token supprimé');

        // 6. Test d'envoi de l'email de confirmation
        console.log('6️⃣ Test envoi email de confirmation...');

        const confirmEmailResult = await emailService.sendPasswordChangedConfirmation(testUser);

        if (confirmEmailResult.success) {
            console.log('   ✅ Email de confirmation envoyé avec succès');
            console.log('   📧 Message ID:', confirmEmailResult.messageId);
        } else {
            console.log('   ❌ Erreur envoi email confirmation:', confirmEmailResult.error);
        }

        // 7. Test de connexion avec le nouveau mot de passe
        console.log('7️⃣ Test de connexion avec le nouveau mot de passe...');

        const isPasswordValid = await bcrypt.compare(newPassword, userAfterReset.password);

        if (isPasswordValid) {
            console.log('   ✅ Connexion réussie avec le nouveau mot de passe');
        } else {
            console.log('   ❌ Échec de connexion avec le nouveau mot de passe');
        }

        // 8. Test avec un token expiré
        console.log('8️⃣ Test avec un token expiré...');

        const expiredToken = crypto.randomBytes(32).toString('hex');
        const expiredDate = new Date(Date.now() - 3600000); // 1 heure dans le passé

        await prisma.user.update({
            where: { id: testUser.id },
            data: {
                resetToken: expiredToken,
                resetTokenExpiry: expiredDate
            }
        });

        const userWithExpiredToken = await prisma.user.findFirst({
            where: {
                resetToken: expiredToken,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!userWithExpiredToken) {
            console.log('   ✅ Token expiré correctement rejeté');
        } else {
            console.log('   ❌ Token expiré accepté (problème!)');
        }

        console.log('\n🎉 Test du système de reset de mot de passe terminé avec succès !');
        console.log('\n📧 Vérifiez votre boîte email sgdigitalweb13@gmail.com');
        console.log('   Vous devriez avoir reçu:');
        console.log('   - 1 email de demande de reset de mot de passe');
        console.log('   - 1 email de confirmation de changement');

        // 9. Nettoyage
        console.log('\n🧹 Nettoyage de l\'utilisateur de test...');
        await prisma.user.delete({
            where: { id: testUser.id }
        });
        console.log('   ✅ Utilisateur de test supprimé');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Fonction pour tester les URLs de reset
async function testResetUrls() {
    console.log('🌐 Test des URLs du système de reset');
    console.log('===================================\n');

    const baseUrl = 'http://localhost:3007';

    console.log('📋 URLs disponibles pour le reset:');
    console.log(`   • Page de demande: ${baseUrl}/auth/forgot-password`);
    console.log(`   • Page de reset: ${baseUrl}/auth/reset-password/[TOKEN]`);
    console.log(`   • Page de connexion: ${baseUrl}/auth/login`);

    console.log('\n🔄 Flux complet:');
    console.log('   1. Utilisateur va sur "Mot de passe oublié"');
    console.log('   2. Saisit son email et clique "Envoyer"');
    console.log('   3. Reçoit un email avec un lien de reset');
    console.log('   4. Clique sur le lien (valide 1h)');
    console.log('   5. Saisit son nouveau mot de passe');
    console.log('   6. Peut se connecter avec le nouveau mot de passe');
}

// Fonction pour afficher l'état des tokens de reset actuels
async function showResetTokensStatus() {
    console.log('🔍 État actuel des tokens de reset');
    console.log('==================================\n');

    try {
        const usersWithTokens = await prisma.user.findMany({
            where: {
                resetToken: {
                    not: null
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                resetToken: true,
                resetTokenExpiry: true
            }
        });

        if (usersWithTokens.length === 0) {
            console.log('📊 Aucun token de reset actif');
        } else {
            console.log(`📊 ${usersWithTokens.length} token(s) de reset en cours:`);
            usersWithTokens.forEach(user => {
                const isExpired = new Date() > user.resetTokenExpiry;
                const status = isExpired ? '❌ Expiré' : '✅ Valide';
                const expiry = user.resetTokenExpiry.toLocaleString('fr-FR');
                console.log(`   ${status} ${user.firstName} ${user.lastName} (${user.email}) - Expire: ${expiry}`);
            });
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Gérer les arguments de ligne de commande
const args = process.argv.slice(2);
const command = args[0] || 'test';

switch (command) {
    case 'test':
        testPasswordResetSystem();
        break;
    case 'urls':
        testResetUrls();
        break;
    case 'tokens':
        showResetTokensStatus();
        break;
    default:
        console.log('Usage:');
        console.log('  node test-password-reset.js test    - Test complet du système de reset');
        console.log('  node test-password-reset.js urls    - Afficher les URLs de reset');
        console.log('  node test-password-reset.js tokens  - Afficher l\'état des tokens');
}
