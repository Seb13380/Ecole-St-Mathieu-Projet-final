const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
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

    // Traitement du formulaire d'inscription élève
    postInscriptionEleve: async (req, res) => {
        try {
            const {
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                parentAddress,
                children,
                specialNeeds,
                message
            } = req.body;

            // Validation des champs obligatoires du parent
            if (!parentFirstName || !parentLastName || !parentEmail || !parentPhone) {
                req.flash('error', 'Veuillez remplir tous les champs obligatoires du parent.');
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

            // Création de la demande d'inscription avec plusieurs enfants
            const inscriptionRequest = await prisma.preInscriptionRequest.create({
                data: {
                    // Informations parent
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    parentAddress,

                    // Informations des enfants (stocker en JSON)
                    children: JSON.stringify(childrenData),

                    // Informations complémentaires
                    specialNeeds: specialNeeds || null,
                    message: message || null,

                    // Statut
                    status: 'PENDING',
                    submittedAt: new Date()
                }
            });

            console.log(`Nouvelle demande d'inscription créée pour ${childrenData.length} enfant(s):`, inscriptionRequest.id);

            // Envoyer email de confirmation au parent
            try {
                await emailService.sendInscriptionConfirmation({
                    parentEmail,
                    parentFirstName,
                    children: childrenData
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
                    children: childrenData,
                    requestId: inscriptionRequest.id
                });
            } catch (emailError) {
                console.error('Erreur envoi notification directeur:', emailError);
            }

            const successMessage = childrenData.length === 1
                ? 'Votre demande d\'inscription a été envoyée avec succès !'
                : `Votre demande d'inscription pour ${childrenData.length} enfants a été envoyée avec succès !`;

            req.flash('success', successMessage + ' Vous recevrez une réponse par email sous 48h.');
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
