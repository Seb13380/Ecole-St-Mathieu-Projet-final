const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Pour générer le token de validation
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

const inscriptionEleveController = {
    // Affichage du formulaire d'inscription élève
    getInscriptionEleve: async (req, res) => {
        try {
            // Récupérer la configuration des inscriptions
            let config = await prisma.inscriptionConfiguration.findFirst();
            if (!config) {
                config = {
                    soustitre: "Demande d'inscription pour l'année scolaire 2025-2026",
                    afficherAnnoncePS2026: true // Par défaut, on affiche l'annonce
                };
            }

            res.render('pages/inscription-eleve', {
                title: 'Inscription Élève - École Saint Mathieu',
                user: req.session.user || null,
                currentUrl: req.originalUrl,
                success: req.flash('success'),
                error: req.flash('error'),
                config: config
            });
        } catch (error) {
            console.error('Erreur lors du chargement de la page inscription élève:', error);
            res.status(500).render('error', {
                title: 'Erreur',
                message: 'Une erreur est survenue lors du chargement de la page.',
                user: req.session.user || null
            });
        }
    },

    // ✉️ NOUVELLE FONCTION - Validation de l'email parent
    validateEmail: async (req, res) => {
        try {
            const { token } = req.params;

            if (!token) {
                return res.status(400).render('pages/email-validation-error', {
                    title: 'Erreur de Validation',
                    user: req.session.user || null,
                    message: 'Token de validation manquant.',
                    currentUrl: req.originalUrl
                });
            }

            // Chercher la demande avec ce token
            const request = await prisma.preInscriptionRequest.findUnique({
                where: { validationToken: token }
            });

            if (!request) {
                return res.status(404).render('pages/email-validation-error', {
                    title: 'Lien Invalide',
                    user: req.session.user || null,
                    message: 'Lien de validation invalide ou expiré.',
                    currentUrl: req.originalUrl
                });
            }

            // Vérifier si le token n'est pas expiré
            if (new Date() > request.tokenExpiresAt) {
                return res.status(400).render('pages/email-validation-error', {
                    title: 'Lien Expiré',
                    user: req.session.user || null,
                    message: 'Le lien de validation a expiré (24h maximum). Veuillez refaire une demande d\'inscription.',
                    currentUrl: req.originalUrl
                });
            }

            // Vérifier si l'email n'est pas déjà validé
            if (request.emailValidated) {
                return res.render('pages/email-validated', {
                    title: 'Email Déjà Validé',
                    user: req.session.user || null,
                    message: 'Votre email a déjà été validé. Votre demande est en cours de traitement.',
                    currentUrl: req.originalUrl
                });
            }

            // ✅ VALIDER LA DEMANDE
            await prisma.preInscriptionRequest.update({
                where: { id: request.id },
                data: {
                    emailValidated: true,
                    validationToken: null, // Supprimer le token utilisé
                    status: 'PENDING' // Maintenant en attente de traitement
                }
            });

            console.log(`✅ Email validé pour la demande ${request.id} - ${request.parentEmail}`);

            // 📧 MAINTENANT envoyer notification au directeur
            try {
                const childrenData = JSON.parse(request.children);
                await emailService.sendInscriptionNotificationToDirector({
                    parentFirstName: request.parentFirstName,
                    parentLastName: request.parentLastName,
                    parentEmail: request.parentEmail,
                    children: childrenData,
                    requestId: request.id
                });
                console.log('📧 Notification envoyée au directeur après validation email');
            } catch (emailError) {
                console.error('❌ Erreur envoi notification directeur après validation:', emailError);
            }

            // Afficher page de succès
            res.render('pages/email-validated', {
                title: 'Email Validé',
                user: req.session.user || null,
                message: 'Email validé avec succès ! Votre demande d\'inscription est maintenant transmise à la direction. Vous recevrez une réponse sous 48h.',
                currentUrl: req.originalUrl
            });

        } catch (error) {
            console.error('❌ Erreur lors de la validation email:', error);
            res.status(500).render('pages/email-validation-error', {
                title: 'Erreur',
                user: req.session.user || null,
                message: 'Une erreur est survenue lors de la validation. Veuillez contacter l\'école.',
                currentUrl: req.originalUrl
            });
        }
    },

    // Traitement du formulaire d'inscription élève
    postInscriptionEleve: async (req, res) => {
        try {
            const {
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                parentAddress,
                parentPassword,
                confirmPassword,
                anneeScolaire,
                children,
                specialNeeds,
                message
            } = req.body;

            // Validation des champs obligatoires du parent
            if (!parentFirstName || !parentLastName || !parentEmail || !parentPhone ||
                !parentPassword || !confirmPassword) {
                req.flash('error', 'Veuillez remplir tous les champs obligatoires du parent.');
                return res.redirect('/inscription-eleve');
            }

            // Validation du mot de passe
            if (parentPassword !== confirmPassword) {
                req.flash('error', 'Les mots de passe ne correspondent pas.');
                return res.redirect('/inscription-eleve');
            }

            if (parentPassword.length < 6) {
                req.flash('error', 'Le mot de passe doit contenir au moins 6 caractères.');
                return res.redirect('/inscription-eleve');
            }

            // Validation format mot de passe (majuscule, minuscule, chiffre)
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
            if (!passwordRegex.test(parentPassword)) {
                req.flash('error', 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.');
                return res.redirect('/inscription-eleve');
            }

            // Validation de l'année scolaire
            if (!anneeScolaire) {
                req.flash('error', 'Veuillez sélectionner l\'année scolaire.');
                return res.redirect('/inscription-eleve');
            }

            // Traitement des enfants - le nouveau format envoie children comme objet
            let childrenData = [];
            if (children) {
                // Convertir l'objet children en tableau
                childrenData = Object.keys(children).map(key => {
                    const child = children[key];
                    return {
                        firstName: child.firstName,
                        lastName: child.lastName,
                        birthDate: child.birthDate,
                        currentClass: child.currentClass || null,
                        requestedClass: child.requestedClass,
                        previousSchool: child.previousSchool || null
                    };
                }).filter(child => child.firstName && child.lastName && child.birthDate && child.requestedClass);
            }

            // Vérifier qu'au moins un enfant est présent et valide
            if (childrenData.length === 0) {
                req.flash('error', 'Veuillez ajouter au moins un enfant avec toutes les informations obligatoires.');
                return res.redirect('/inscription-eleve');
            }

            // Vérifier si l'email parent existe déjà
            const existingParent = await prisma.user.findUnique({
                where: { email: parentEmail }
            });

            if (existingParent) {
                req.flash('error', 'Un compte parent existe déjà avec cette adresse email.');
                return res.redirect('/inscription-eleve');
            }

            // Vérifier s'il existe déjà une demande avec cet email
            const existingRequest = await prisma.preInscriptionRequest.findFirst({
                where: { parentEmail: parentEmail }
            });

            if (existingRequest) {
                req.flash('error', 'Une demande d\'inscription existe déjà pour cette adresse email.');
                return res.redirect('/inscription-eleve');
            }

            // Hasher le mot de passe fourni par l'utilisateur
            const hashedPassword = await bcrypt.hash(parentPassword, 12);

            // Générer token de validation email
            const validationToken = crypto.randomBytes(32).toString('hex');
            const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

            // Création de la demande d'inscription avec plusieurs enfants
            const inscriptionRequest = await prisma.preInscriptionRequest.create({
                data: {
                    // Informations parent
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    parentAddress,
                    parentPassword: hashedPassword, // Mot de passe haché fourni par l'utilisateur

                    // Année scolaire
                    anneeScolaire,

                    // Informations des enfants (stocker en JSON)
                    children: JSON.stringify(childrenData),

                    // Informations complémentaires
                    specialNeeds: specialNeeds || null,
                    message: message || null,

                    // ✉️ VALIDATION EMAIL - NOUVEAUX CHAMPS
                    emailValidated: false,
                    validationToken: validationToken,
                    tokenExpiresAt: tokenExpiresAt,

                    // Statut - EN ATTENTE DE VALIDATION EMAIL
                    status: 'EMAIL_PENDING',
                    submittedAt: new Date()
                }
            });

            console.log(`Nouvelle demande d'inscription créée pour ${childrenData.length} enfant(s):`, inscriptionRequest.id);

            // ✉️ ENVOYER EMAIL DE VALIDATION (au lieu de confirmation)
            try {
                await emailService.sendValidationEmail({
                    parentEmail,
                    parentFirstName,
                    validationToken: validationToken,
                    children: childrenData
                });
                console.log('📧 Email de validation envoyé à:', parentEmail);
            } catch (emailError) {
                console.error('❌ Erreur envoi email de validation:', emailError);
                // Ne pas arrêter le processus, juste logguer l'erreur
            }

            // ⚠️ PAS D'ENVOI AU DIRECTEUR MAINTENANT
            // L'email au directeur sera envoyé APRÈS validation du parent

            const successMessage = childrenData.length === 1
                ? 'Votre demande d\'inscription a été enregistrée !'
                : `Votre demande d'inscription pour ${childrenData.length} enfants a été enregistrée !`;

            req.flash('success', successMessage + ' 📧 Vérifiez votre email et cliquez sur le lien de validation pour finaliser votre demande.');
            res.redirect('/inscription-eleve');

        } catch (error) {
            console.error('Erreur lors de la création de l\'inscription élève:', error);
            req.flash('error', 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.');
            res.redirect('/inscription-eleve');
        }
    },

    // Traitement de la réponse du directeur (validation/refus)
    handleDirectorResponse: async (req, res) => {
        try {
            const { requestId, action, reason } = req.body;

            if (!requestId || !action) {
                return res.status(400).json({ error: 'Paramètres manquants' });
            }

            // Récupérer la demande
            const request = await prisma.preInscriptionRequest.findUnique({
                where: { id: parseInt(requestId) }
            });

            if (!request) {
                return res.status(404).json({ error: 'Demande non trouvée' });
            }

            let newStatus;
            let emailTemplate;

            if (action === 'APPROVE') {
                newStatus = 'ACCEPTED';
                emailTemplate = 'inscriptionApproved';

                // Créer automatiquement le compte parent et élève
                try {
                    await inscriptionEleveController.createParentAndStudentAccount(request);
                } catch (createError) {
                    console.error('Erreur création compte:', createError);
                }
            } else if (action === 'REJECT') {
                newStatus = 'REJECTED';
                emailTemplate = 'inscriptionRejected';
            }

            // Mettre à jour le statut
            await prisma.preInscriptionRequest.update({
                where: { id: parseInt(requestId) },
                data: {
                    status: newStatus,
                    processedAt: new Date(),
                    processedBy: req.session.user.id,
                    adminNotes: reason || null
                }
            });

            // Envoyer email de réponse au parent
            try {
                await emailService.sendInscriptionResponse({
                    parentEmail: request.parentEmail,
                    parentFirstName: request.parentFirstName,
                    studentFirstName: request.studentFirstName,
                    studentLastName: request.studentLastName,
                    action: newStatus,
                    reason: reason || null
                });
            } catch (emailError) {
                console.error('Erreur envoi email réponse:', emailError);
            }

            res.json({ success: true, message: 'Réponse envoyée avec succès' });

        } catch (error) {
            console.error('Erreur traitement réponse directeur:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Créer automatiquement le compte parent et élève après validation
    createParentAndStudentAccount: async (inscriptionRequest) => {
        try {
            const {
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                parentAddress
            } = inscriptionRequest;

            // Générer un mot de passe temporaire
            const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
            const hashedPassword = await bcrypt.hash(tempPassword, 12);

            // Créer le compte parent
            const parentUser = await prisma.user.create({
                data: {
                    firstName: parentFirstName,
                    lastName: parentLastName,
                    email: parentEmail,
                    phone: parentPhone,
                    adress: parentAddress,
                    password: hashedPassword,
                    role: 'PARENT'
                }
            });

            // Parser les enfants depuis le JSON
            let childrenData = [];
            try {
                if (typeof inscriptionRequest.children === 'string') {
                    childrenData = JSON.parse(inscriptionRequest.children);
                } else {
                    childrenData = inscriptionRequest.children || [];
                }
            } catch (e) {
                console.error('Erreur parsing children:', e);
                childrenData = [];
            }

            // Créer les comptes étudiants pour chaque enfant
            const students = [];

            for (const child of childrenData) {
                // Trouver ou créer la classe demandée
                let classe = await prisma.classe.findFirst({
                    where: { nom: child.requestedClass }
                });

                if (!classe) {
                    // Créer une classe par défaut si elle n'existe pas
                    classe = await prisma.classe.create({
                        data: {
                            nom: child.requestedClass || 'Non assigné',
                            niveau: child.requestedClass || 'A définir',
                            anneeScolaire: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
                        }
                    });
                }

                // Créer l'élève
                const student = await prisma.student.create({
                    data: {
                        firstName: child.firstName,
                        lastName: child.lastName,
                        dateNaissance: new Date(child.birthDate),
                        classeId: classe.id,
                        parentId: parentUser.id
                    }
                });

                students.push(student);
                console.log('✅ Élève créé:', `${student.firstName} ${student.lastName} - Classe: ${child.requestedClass}`);
            }

            // Envoyer email avec identifiants
            try {
                await emailService.sendAccountCreated({
                    parentEmail,
                    parentFirstName,
                    tempPassword,
                    children: childrenData
                });
            } catch (emailError) {
                console.error('Erreur envoi identifiants:', emailError);
            }

            console.log(`✅ Comptes créés pour ${parentFirstName} ${parentLastName} avec ${students.length} enfant(s)`);
            return { parentUser, students };

        } catch (error) {
            console.error('Erreur création comptes:', error);
            throw error;
        }
    }
};

module.exports = inscriptionEleveController;
