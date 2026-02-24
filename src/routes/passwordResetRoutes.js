const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Page de demande de reset de mot de passe
 */
router.get('/forgot-password', (req, res) => {
    res.render('pages/auth/forgot-password', {
        title: 'Mot de passe oublié - École Saint-Mathieu',
        error: req.query.error,
        success: req.query.success
    });
});

/**
 * Traitement de la demande de reset
 */
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            // Pour la sécurité, on ne révèle pas si l'email existe ou non
            return res.redirect('/auth/forgot-password?success=1');
        }

        // Générer un token de reset unique
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

        // Stocker le token en base
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: resetToken,
                resetTokenExpiry: resetTokenExpiry
            }
        });

        // Envoyer l'email de reset
        await emailService.sendPasswordResetEmail(user, resetToken);

        res.redirect('/auth/forgot-password?success=1');

    } catch (error) {
        console.error('Erreur reset password:', error);
        res.redirect('/auth/forgot-password?error=1');
    }
});

/**
 * Page de reset du mot de passe avec token
 */
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Vérifier que le token est valide et non expiré
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.redirect('/auth/login?error=invalid_token');
        }

        res.render('pages/auth/reset-password', {
            title: 'Nouveau mot de passe - École Saint-Mathieu',
            token: token,
            error: req.query.error
        });

    } catch (error) {
        console.error('Erreur vérification token:', error);
        res.redirect('/auth/login?error=system_error');
    }
});

/**
 * Traitement du nouveau mot de passe
 */
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
        // Validation
        if (!password || password.length < 6) {
            return res.redirect(`/auth/reset-password/${token}?error=password_too_short`);
        }

        if (password !== confirmPassword) {
            return res.redirect(`/auth/reset-password/${token}?error=password_mismatch`);
        }

        // Vérifier le token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.redirect('/auth/login?error=invalid_token');
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Mettre à jour le mot de passe et supprimer le token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        // Envoyer un email de confirmation
        await emailService.sendPasswordChangedConfirmation(user);

        res.redirect('/auth/login?success=password_reset');

    } catch (error) {
        console.error('Erreur update password:', error);
        res.redirect(`/auth/reset-password/${token}?error=system_error`);
    }
});

module.exports = router;
