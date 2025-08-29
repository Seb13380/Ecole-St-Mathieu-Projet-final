const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

const inscriptionEleveController = {
    // Affichage du formulaire d'inscription élève
    getInscriptionEleve: async (req, res) => {
        try {
            res.render('pages/inscription-eleve', {
                title: 'Inscription Élève - École Saint Mathieu',
                user: req.session.user || null,
                currentUrl: req.originalUrl,
                success: req.flash('success'),
                error: req.flash('error')
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

    // Traitement du formulaire d'inscription élève
    postInscriptionEleve: async (req, res) => {
        try {
            const {
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                parentAddress,
                studentFirstName,
                studentLastName,
                studentBirthDate,
                currentClass,
                requestedClass,
                previousSchool,
                specialNeeds,
                message
            } = req.body;

            // Validation des champs obligatoires
            if (!parentFirstName || !parentLastName || !parentEmail || !parentPhone ||
                !studentFirstName || !studentLastName || !studentBirthDate || !requestedClass) {
                req.flash('error', 'Veuillez remplir tous les champs obligatoires.');
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

            // Création de la demande d'inscription élève
            const inscriptionRequest = await prisma.preInscriptionRequest.create({
                data: {
                    // Informations parent
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    parentAddress,

                    // Informations élève
                    studentFirstName,
                    studentLastName,
                    studentBirthDate: new Date(studentBirthDate),
                    currentClass: currentClass || null,
                    requestedClass,
                    previousSchool: previousSchool || null,
                    specialNeeds: specialNeeds || null,
                    message: message || null,

                    // Statut
                    status: 'PENDING',
                    submittedAt: new Date()
                }
            });

            console.log('Nouvelle demande d\'inscription élève créée:', inscriptionRequest.id);

            // Envoyer email de confirmation au parent
            try {
                await emailService.sendInscriptionConfirmation({
                    parentEmail,
                    parentFirstName,
                    studentFirstName,
                    studentLastName,
                    requestedClass
                });
            } catch (emailError) {
                console.error('Erreur envoi email de confirmation:', emailError);
            }

            // Envoyer notification au directeur
            try {
                await emailService.sendInscriptionNotificationToDirector({
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    studentFirstName,
                    studentLastName,
                    requestedClass,
                    requestId: inscriptionRequest.id
                });
            } catch (emailError) {
                console.error('Erreur envoi notification directeur:', emailError);
            }

            req.flash('success', 'Votre demande d\'inscription a été envoyée avec succès ! Vous recevrez une réponse par email sous 48h.');
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
                parentAddress,
                studentFirstName,
                studentLastName,
                studentBirthDate,
                requestedClass
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

            // Trouver ou créer la classe demandée
            let classe = await prisma.classe.findFirst({
                where: { nom: requestedClass }
            });

            if (!classe) {
                classe = await prisma.classe.create({
                    data: {
                        nom: requestedClass,
                        niveau: requestedClass,
                        anneeScolaire: new Date().getFullYear().toString()
                    }
                });
            }

            // Créer l'élève
            const student = await prisma.student.create({
                data: {
                    firstName: studentFirstName,
                    lastName: studentLastName,
                    dateOfBirth: new Date(studentBirthDate),
                    classeId: classe.id,
                    parentId: parentUser.id
                }
            });

            // Envoyer email avec identifiants
            try {
                await emailService.sendAccountCreated({
                    parentEmail,
                    parentFirstName,
                    tempPassword,
                    studentFirstName,
                    className: requestedClass
                });
            } catch (emailError) {
                console.error('Erreur envoi identifiants:', emailError);
            }

            return { parentUser, student };

        } catch (error) {
            console.error('Erreur création comptes:', error);
            throw error;
        }
    }
};

module.exports = inscriptionEleveController;
