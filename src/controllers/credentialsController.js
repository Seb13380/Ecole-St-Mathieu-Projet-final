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


        // Chercher si un parent existe avec ces informations
        console.log('🔍 Recherche parent avec email:', email.toLowerCase().trim());

        // 1ère tentative : Email exact avec parents seulement
        let existingParent = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase().trim(),
                role: 'PARENT'
            }
        });

        // Si pas trouvé, essayer avec un matching plus large
        if (!existingParent) {
            console.log('⚠️ Aucun parent trouvé avec l\'email exact, tentative avec nom/prénom...');

            // Recherche plus souple : email ET (prénom OU nom)
            existingParent = await prisma.user.findFirst({
                where: {
                    email: email.toLowerCase().trim(),
                    OR: [
                        {
                            firstName: {
                                contains: firstName.trim(),
                                mode: 'insensitive'
                            }
                        },
                        {
                            lastName: {
                                contains: lastName.trim(),
                                mode: 'insensitive'
                            }
                        }
                    ]
                }
            });

            // Vérifier si un utilisateur a été trouvé mais n'est pas PARENT
            if (existingParent && existingParent.role !== 'PARENT') {
                console.log('⚠️ Utilisateur trouvé mais n\'est pas un parent, rôle:', existingParent.role);
                existingParent = null;
            }
        }

        if (!existingParent) {
            console.log('❌ Aucun parent correspondant trouvé');

            // Vérifier s'il existe un utilisateur avec cet email (pour le debug)
            const anyUser = await prisma.user.findFirst({
                where: { email: email.toLowerCase().trim() }
            });

            if (anyUser) {
                console.log('⚠️ Un utilisateur existe avec cet email mais rôle:', anyUser.role);
            }

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

            return res.redirect('/demande-identifiants?error=Aucun compte parent trouvé avec cette adresse email. Si vous n\'avez pas encore de compte, veuillez d\'abord faire une demande d\'inscription.');
        }

        console.log('✅ Parent trouvé:', existingParent.firstName, existingParent.lastName, '(ID:', existingParent.id + ')');


        // Mettre à jour la demande avec le parent trouvé
        await prisma.credentialsRequest.update({
            where: { id: credentialsRequest.id },
            data: {
                foundParentId: existingParent.id,
                foundParentEmail: existingParent.email
            }
        });

        // ✅ NOUVEAU : Laisser la demande en attente pour validation par le directeur

        // Mettre à jour la demande comme trouvée mais en attente
        await prisma.credentialsRequest.update({
            where: { id: credentialsRequest.id },
            data: {
                status: 'PENDING', // En attente de validation
                processed: false,   // Pas encore traitée
                foundParentId: existingParent.id,
                foundParentEmail: existingParent.email
            }
        });

        // Note: La notification sera gérée par le directeur lors de la validation

        res.redirect('/demande-identifiants?message=Votre demande d\'identifiants a été transmise à la direction. Vous recevrez vos codes d\'accès par email après validation (sous 48h).');

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
