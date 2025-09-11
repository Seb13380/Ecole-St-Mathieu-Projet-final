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
    let credentialsRequest = null; // Initialiser la variable pour être accessible dans le catch

    try {
        const { email, firstName, lastName, phone } = req.body;

        // Vérifications
        if (!email || !firstName || !lastName) {
            return res.redirect('/demande-identifiants?error=Tous les champs obligatoires doivent être remplis');
        }

        // 🔄 NOUVEAU : Créer la demande en base pour traçabilité
        credentialsRequest = await prisma.credentialsRequest.create({
            data: {
                requestedEmail: email.toLowerCase().trim(),
                requestedFirstName: firstName.trim(),
                requestedLastName: lastName.trim(),
                requestedPhone: phone ? phone.trim() : null,
                status: 'PROCESSING'
            }
        });

        console.log('📋 Demande d\'identifiants créée:', credentialsRequest.id);

        // Chercher si un parent existe avec ces informations
        const existingParent = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase().trim(),
                role: 'PARENT',
                AND: [
                    {
                        firstName: {
                            contains: firstName.trim()
                        }
                    },
                    {
                        lastName: {
                            contains: lastName.trim()
                        }
                    }
                ]
            }
        });

        if (!existingParent) {
            console.log('❌ Aucun parent trouvé pour:', { email, firstName, lastName });

            // Mettre à jour la demande avec l'échec
            await prisma.credentialsRequest.update({
                where: { id: credentialsRequest.id },
                data: {
                    status: 'FAILED',
                    errorMessage: 'Aucun compte parent trouvé avec ces informations',
                    processed: true,
                    processedAt: new Date()
                }
            });

            return res.redirect('/demande-identifiants?error=Aucun compte parent trouvé avec ces informations. Veuillez vérifier vos données ou contacter l\'école.');
        }

        console.log('✅ Parent trouvé:', existingParent.firstName, existingParent.lastName);

        // Mettre à jour la demande avec le parent trouvé
        await prisma.credentialsRequest.update({
            where: { id: credentialsRequest.id },
            data: {
                foundParentId: existingParent.id,
                foundParentEmail: existingParent.email
            }
        });

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

        // Mettre à jour la demande comme complétée
        await prisma.credentialsRequest.update({
            where: { id: credentialsRequest.id },
            data: {
                status: 'COMPLETED',
                identifiersSent: true,
                processed: true,
                processedAt: new Date()
            }
        });

        // Envoyer notification à l'admin
        try {
            await emailService.sendCredentialsRequestNotification({
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

        // Mettre à jour la demande en cas d'erreur (si elle existe)
        try {
            if (credentialsRequest) {
                await prisma.credentialsRequest.update({
                    where: { id: credentialsRequest.id },
                    data: {
                        status: 'FAILED',
                        errorMessage: error.message,
                        processed: true,
                        processedAt: new Date()
                    }
                });
            }
        } catch (updateError) {
            console.error('❌ Erreur mise à jour demande:', updateError);
        }

        res.redirect('/demande-identifiants?error=Erreur lors du traitement de votre demande. Veuillez réessayer.');
    }
};

module.exports = {
    showCredentialsForm,
    processCredentialsRequest
};
