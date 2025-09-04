const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

/**
 * 🔑 CONTRÔLEUR DEMANDES D'IDENTIFIANTS
 * Pour parents existants qui ont oublié leurs codes d'accès
 */

// Afficher le formulaire de demande d'identifiants
const showCredentialsForm = (req, res) => {
    res.render('pages/demande-identifiants', {
        title: 'Demande d\'identifiants de connexion',
        message: req.query.message,
        error: req.query.error
    });
};

// Traiter la demande d'identifiants
const processCredentialsRequest = async (req, res) => {
    try {
        const { email, firstName, lastName, phone } = req.body;

        // Vérifications
        if (!email || !firstName || !lastName) {
            return res.redirect('/demande-identifiants?error=Tous les champs obligatoires doivent être remplis');
        }

        // Chercher si un parent existe avec ces informations
        const existingParent = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase().trim(),
                role: 'PARENT',
                firstName: {
                    contains: firstName.trim(),
                    mode: 'insensitive'
                },
                lastName: {
                    contains: lastName.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (!existingParent) {
            console.log('❌ Aucun parent trouvé pour:', { email, firstName, lastName });
            return res.redirect('/demande-identifiants?error=Aucun compte parent trouvé avec ces informations. Veuillez vérifier vos données ou contacter l\'école.');
        }

        console.log('✅ Parent trouvé:', existingParent.firstName, existingParent.lastName);

        // Générer un nouveau mot de passe temporaire
        const tempPassword = 'Ecole' + Math.floor(Math.random() * 10000) + '!';
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Mettre à jour le mot de passe
        await prisma.user.update({
            where: { id: existingParent.id },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            }
        });

        // Envoyer l'email avec les identifiants
        await emailService.sendCredentialsEmail({
            parentFirstName: existingParent.firstName,
            parentLastName: existingParent.lastName,
            parentEmail: existingParent.email,
            temporaryPassword: tempPassword
        });

        console.log('✅ Identifiants envoyés à:', existingParent.email);

        // Envoyer notification à l'admin
        try {
            await emailService.sendAdminNotification({
                type: 'credentials_request',
                parentName: `${existingParent.firstName} ${existingParent.lastName}`,
                parentEmail: existingParent.email,
                timestamp: new Date()
            });
        } catch (adminError) {
            console.error('⚠️ Erreur notification admin:', adminError);
            // Ne pas faire échouer la demande pour cela
        }

        res.redirect('/demande-identifiants?message=Vos identifiants ont été envoyés par email. Vérifiez votre boîte de réception et vos spams.');

    } catch (error) {
        console.error('❌ Erreur traitement demande identifiants:', error);
        res.redirect('/demande-identifiants?error=Erreur lors du traitement de votre demande. Veuillez réessayer.');
    }
};

module.exports = {
    showCredentialsForm,
    processCredentialsRequest
};
