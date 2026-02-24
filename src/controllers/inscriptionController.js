const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const spamDetector = require('../middleware/spamDetector');

const prisma = new PrismaClient();

const inscriptionController = {
    // Afficher le formulaire d'inscription
    showRegistrationForm: (req, res) => {
        res.render('pages/auth/register', {
            title: 'Inscription - École Saint-Mathieu',
            error: req.query.error,
            success: req.query.success
        });
    },

    // Traiter l'inscription depuis le formulaire  
    processRegistration: async (req, res) => {
        try {
            // 🛡️ PROTECTION ANTI-SPAM AVANCÉE - TEMPORAIREMENT DÉSACTIVÉE POUR DIAGNOSTIC
            // const formStartTime = req.body.formStartTime ? parseInt(req.body.formStartTime) : null;
            // const spamDetection = spamDetector.detectSpam(req, formStartTime);

            // if (spamDetection.isSpam) {
            //     // Logger l'activité suspecte
            //     spamDetector.logSuspiciousActivity(spamDetection, {
            //         endpoint: '/inscription',
            //         data: {
            //             email: req.body.parentEmail,
            //             firstName: req.body.parentFirstName,
            //             lastName: req.body.parentLastName
            //         }
            //     });

            //     // Réponse différente selon le niveau de risque
            //     if (spamDetection.riskLevel === 'HIGH') {
            //         // Risque élevé : blocage direct
            //         return res.status(429).json({
            //             error: 'Trop de requêtes. Veuillez réessayer plus tard.',
            //             blocked: true
            //         });
            //     } else {
            //         // Risque moyen : faire semblant que ça marche
            //         return res.redirect('/auth/register?success=Votre demande d\'inscription a été envoyée avec succès. Vous recevrez une réponse sous 48h.');
            //     }
            // }

            const {
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                parentAddress,
                password,
                confirmPassword
            } = req.body;

            // Validation des mots de passe
            if (password !== confirmPassword) {
                return res.redirect('/auth/register?error=Les mots de passe ne correspondent pas');
            }

            if (password.length < 6) {
                return res.redirect('/auth/register?error=Le mot de passe doit contenir au moins 6 caractères');
            }

            // Vérifier si l'email existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: parentEmail }
            });

            if (existingUser) {
                // ✅ NOUVEAU : Permettre une nouvelle demande d'inscription pour un parent existant
                // Ne pas bloquer, laisser créer une nouvelle demande d'inscription
            }

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 12);

            // Récupérer les données des enfants du formulaire
            let childrenData = [];

            // Gestion des enfants multiples
            if (req.body.children && Array.isArray(req.body.children)) {
                childrenData = req.body.children.map(child => ({
                    firstName: child.firstName,
                    lastName: child.lastName,
                    birthDate: child.birthDate,
                    requestedClass: child.requestedClass
                })).filter(child => child.firstName && child.lastName && child.birthDate);
            } else if (req.body.childFirstName) {
                // Un seul enfant
                childrenData = [{
                    firstName: req.body.childFirstName,
                    lastName: req.body.childLastName,
                    birthDate: req.body.childBirthDate,
                    requestedClass: req.body.requestedClass
                }];
            } else {
                // Enfants envoyés en tableau séparé
                const firstNames = Array.isArray(req.body.childFirstName) ? req.body.childFirstName : [req.body.childFirstName];
                const lastNames = Array.isArray(req.body.childLastName) ? req.body.childLastName : [req.body.childLastName];
                const birthDates = Array.isArray(req.body.childBirthDate) ? req.body.childBirthDate : [req.body.childBirthDate];
                const classIds = Array.isArray(req.body.requestedClass) ? req.body.requestedClass : [req.body.requestedClass];
                childrenData = firstNames.map((firstName, index) => ({
                    firstName,
                    lastName: lastNames[index],
                    birthDate: birthDates[index],
                    requestedClass: classIds[index]
                })).filter(child => child.firstName && child.lastName && child.birthDate);
            }

            // Vérifier qu'au moins un enfant est présent
            if (childrenData.length === 0) {
                return res.redirect('/auth/register?error=Veuillez ajouter au moins un enfant');
            }

            // Création de la demande d'inscription
            const inscriptionRequest = await prisma.preInscriptionRequest.create({
                data: {
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    parentAddress,
                    parentPassword: hashedPassword, // Stocker le mot de passe hashé
                    children: childrenData
                }
            });

            // 🔥 ENVOI EMAIL NOTIFICATION ADMIN
            try {
                const adminEmailData = {
                    requestId: inscriptionRequest.id,
                    parentName: `${parentFirstName} ${parentLastName}`,
                    parentEmail: parentEmail,
                    parentPhone: parentPhone,
                    parentAddress: parentAddress,
                    children: childrenData,
                    submittedAt: inscriptionRequest.submittedAt,
                    adminEmail: 'sgdigitalweb13@gmail.com'
                };

                const emailResult = await emailService.sendNewInscriptionNotification(adminEmailData);

                if (emailResult.success) {
                } else {
                    console.error('❌ Erreur email admin:', emailResult.error);
                }
            } catch (emailError) {
                console.error('❌ Erreur lors de l\'envoi de l\'email admin:', emailError);
                // Ne pas faire échouer l'inscription si l'email échoue
            }

            //  ENVOI EMAIL CONFIRMATION PARENT
            try {
                const parentConfirmationData = {
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    children: childrenData
                };

                const parentEmailResult = await emailService.sendInscriptionConfirmation(parentConfirmationData);

                if (parentEmailResult.success) {
                } else {
                    console.error('❌ Erreur email parent:', parentEmailResult.error);
                }
            } catch (emailError) {
                console.error('❌ Erreur lors de l\'envoi de l\'email parent:', emailError);
                // Ne pas faire échouer l'inscription si l'email échoue
            }

            res.redirect('/auth/register?success=Votre demande d\'inscription a été envoyée avec succès. Vous recevrez une réponse sous 48h.');

        } catch (error) {
            console.error('Erreur lors du traitement de l\'inscription:', error);
            res.redirect('/auth/register?error=Une erreur est survenue. Veuillez réessayer.');
        }
    },

    // Pour l'admin : voir toutes les demandes
    showAllRequests: async (req, res) => {
        try {

            // Récupérer les pré-inscriptions ET les dossiers d'inscription
            const [preInscriptions, dossierInscriptions] = await Promise.all([
                prisma.preInscriptionRequest.findMany({
                    where: {
                        NOT: { status: 'EMAIL_PENDING' }
                    },
                    orderBy: { submittedAt: 'desc' },
                    include: { processor: true }
                }),
                prisma.dossierInscription.findMany({
                    orderBy: { createdAt: 'desc' },
                    include: { traitant: true }
                })
            ]);

            // Normaliser les dossiers d'inscription vers le format des pré-inscriptions
            const normalizedDossiers = dossierInscriptions.map(dossier => {
                // Normaliser les statuts pour l'affichage uniforme
                let normalizedStatus = dossier.statut;
                if (dossier.statut === 'REFUSE') normalizedStatus = 'REJECTED';
                if (dossier.statut === 'VALIDE') normalizedStatus = 'ACCEPTED';
                if (dossier.statut === 'EN_ATTENTE') normalizedStatus = 'PENDING';

                return {
                    id: dossier.id,
                    type: 'DOSSIER_INSCRIPTION',
                    parentFirstName: dossier.perePrenom,
                    parentLastName: dossier.pereNom,
                    parentEmail: dossier.pereEmail,
                    parentPhone: dossier.pereTelephone,
                    status: normalizedStatus,
                    submittedAt: dossier.createdAt,
                    children: JSON.stringify([{
                        firstName: dossier.enfantPrenom,
                        lastName: dossier.enfantNom,
                        birthDate: dossier.enfantDateNaissance,
                        requestedClass: dossier.enfantClasseDemandee
                    }]),
                    message: JSON.stringify({
                        pere: `${dossier.perePrenom} ${dossier.pereNom}`,
                        mere: `${dossier.merePrenom} ${dossier.mereNom}`,
                        adresse: dossier.adresseComplete
                    }),
                    processor: dossier.traitant
                };
            });

            // Ajouter le type aux pré-inscriptions
            const normalizedPreInscriptions = preInscriptions.map(req => ({
                ...req,
                type: 'PRE_INSCRIPTION'
            }));

            // Combiner et trier toutes les demandes
            const allRequests = [...normalizedPreInscriptions, ...normalizedDossiers]
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

            // 🔍 DEBUG: Vérifier spécifiquement la demande 51
            const request51 = allRequests.find(req => req.id === 51);
            if (request51) {
            } else {
            }

            // Parser les enfants et les parents pour chaque demande
            const requestsWithParsedChildren = allRequests.map(request => {
                let children = [];
                if (request.children) {
                    try {
                        children = typeof request.children === 'string'
                            ? JSON.parse(request.children)
                            : request.children;
                    } catch (e) {
                        console.error('Erreur parsing children pour request', request.id, ':', e);
                        children = [];
                    }
                }

                // Parser les informations des parents
                let parentsInfo = {};
                if (request.message) {
                    try {
                        parentsInfo = typeof request.message === 'string'
                            ? JSON.parse(request.message)
                            : request.message;
                    } catch (e) {
                        console.error('Erreur parsing parents info pour request', request.id, ':', e);
                        parentsInfo = {};
                    }
                }

                // Debug temporaire
                if (request.id === 22) {
                }

                return {
                    ...request,
                    children,
                    parsedChildren: children,
                    parentsInfo
                };
            });

            res.render('pages/admin/inscription-requests', {
                title: 'Demandes d\'inscription',
                requests: requestsWithParsedChildren,
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des demandes',
                user: req.session.user
            });
        }
    },

    // VALIDER UN DOSSIER D'INSCRIPTION COMPLET
    validateDossier: async (req, res) => {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const requestId = parseInt(id);


            // Chercher dans DossierInscription uniquement
            const dossier = await prisma.dossierInscription.findUnique({
                where: { id: requestId }
            });

            if (!dossier) {
                return res.status(404).json({
                    success: false,
                    message: 'Dossier d\'inscription non trouvé'
                });
            }

            if (dossier.statut !== 'EN_ATTENTE') {
                return res.status(400).json({
                    success: false,
                    message: `Ce dossier n'est pas en attente (statut actuel: ${dossier.statut})`
                });
            }

            // Mettre à jour le statut vers VALIDE
            await prisma.dossierInscription.update({
                where: { id: requestId },
                data: {
                    statut: 'VALIDE',
                    dateTraitement: new Date(),
                    traitePar: req.session.user.id,
                    notesAdministratives: comment || 'Dossier validé'
                }
            });


            // Envoyer email de validation aux parents
            try {
                const parentEmail = dossier.pereEmail || dossier.mereEmail;
                const parentName = `${dossier.perePrenom || dossier.merePrenom} ${dossier.pereNom || dossier.mereNom}`;


                await emailService.sendDossierValidationEmail({
                    parentFirstName: dossier.perePrenom || dossier.merePrenom,
                    parentLastName: dossier.pereNom || dossier.mereNom,
                    parentEmail: parentEmail,
                    enfantPrenom: dossier.enfantPrenom,
                    enfantNom: dossier.enfantNom,
                    enfantClasseDemandee: dossier.enfantClasseDemandee
                }, comment);

            } catch (emailError) {
                console.error('❌ Erreur envoi email validation:', emailError);
                // Ne pas faire échouer la validation si l'email échoue
            }

            res.json({
                success: true,
                message: 'Dossier validé avec succès',
                status: 'VALIDE'
            });

        } catch (error) {
            console.error('Erreur lors de la validation du dossier:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la validation: ' + error.message
            });
        }
    },

    // ÉTAPE 1 : Approuver la demande pour un rendez-vous (sans créer les comptes)
    approveRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            // Récupérer la demande d'inscription
            const request = await prisma.preInscriptionRequest.findUnique({
                where: { id: parseInt(id) }
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande d\'inscription non trouvée'
                });
            }

            // Mettre à jour le statut pour indiquer qu'un rendez-vous est accepté
            await prisma.preInscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'ACCEPTED', // Accepté pour rendez-vous
                    processedAt: new Date(),
                    processedBy: req.session.user.id,
                    adminNotes: comment || 'Demande acceptée - Rendez-vous d\'inscription à programmer'
                }
            });

            // Envoyer email pour confirmer le rendez-vous
            try {
                await emailService.sendAppointmentAcceptanceEmail({
                    parentFirstName: request.parentFirstName,
                    parentLastName: request.parentLastName,
                    parentEmail: request.parentEmail,
                    children: request.children
                }, comment);
            } catch (emailError) {
                console.error('❌ Erreur envoi email rendez-vous:', emailError);
            }

            res.json({
                success: true,
                message: 'Demande approuvée pour rendez-vous',
                parentEmail: request.parentEmail
            });

        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'approbation: ' + error.message
            });
        }
    },

    // ÉTAPE 2 : Finaliser l'inscription après le rendez-vous (créer les comptes) - VERSION UNIFIÉE
    finalizeInscription: async (req, res) => {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            const requestId = parseInt(id);


            // 🔍 RECHERCHE UNIFIÉE DANS LES DEUX TABLES
            let request = null;
            let requestType = null;
            let requestData = {};

            // 1. Essayer dans PreInscriptionRequest
            const preInscriptionRequest = await prisma.preInscriptionRequest.findUnique({
                where: { id: requestId }
            });

            if (preInscriptionRequest && preInscriptionRequest.status === 'ACCEPTED') {
                request = preInscriptionRequest;
                requestType = 'PRE_INSCRIPTION';

                // Convertir au format unifié
                let children = [];
                if (request.children) {
                    try {
                        children = typeof request.children === 'string' ? JSON.parse(request.children) : request.children;
                    } catch (e) {
                        console.error('Erreur parsing children:', e);
                    }
                }

                requestData = {
                    parentFirstName: request.parentFirstName,
                    parentLastName: request.parentLastName,
                    parentEmail: request.parentEmail,
                    parentPhone: request.parentPhone,
                    parentAddress: request.parentAddress,
                    children: children,
                    message: request.message
                };
            }

            // 2. Si pas trouvé ou pas au bon statut, essayer DossierInscription
            if (!request) {
                const dossierInscription = await prisma.dossierInscription.findUnique({
                    where: { id: requestId }
                });

                if (dossierInscription && dossierInscription.statut === 'VALIDE') {
                    request = dossierInscription;
                    requestType = 'DOSSIER_INSCRIPTION';

                    // Convertir au format unifié
                    requestData = {
                        parentFirstName: dossierInscription.perePrenom || dossierInscription.merePrenom,
                        parentLastName: dossierInscription.pereNom || dossierInscription.mereNom,
                        parentEmail: dossierInscription.pereEmail || dossierInscription.mereEmail,
                        parentPhone: dossierInscription.pereTelephone || dossierInscription.mereTelephone,
                        parentAddress: dossierInscription.adresseComplete,
                        children: [{
                            firstName: dossierInscription.enfantPrenom,
                            lastName: dossierInscription.enfantNom,
                            birthDate: dossierInscription.enfantDateNaissance,
                            requestedClass: dossierInscription.enfantClasseDemandee
                        }],
                        message: JSON.stringify({
                            pere: `${dossierInscription.perePrenom} ${dossierInscription.pereNom} - ${dossierInscription.pereEmail}`,
                            mere: `${dossierInscription.merePrenom} ${dossierInscription.mereNom} - ${dossierInscription.mereEmail}`,
                            adresse: dossierInscription.adresseComplete
                        })
                    };
                }
            }

            // 3. Vérifications
            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande d\'inscription non trouvée'
                });
            }

            const status = requestType === 'PRE_INSCRIPTION' ? request.status : request.statut;
            const expectedStatuses = requestType === 'PRE_INSCRIPTION' ? ['ACCEPTED'] : ['VALIDE'];

            if (!expectedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Cette demande n'est pas au bon statut (actuel: ${status})`
                });
            }


            // Maintenant utiliser requestData au lieu de request pour la suite...

            // Parser les informations des parents depuis requestData
            let parentsInfo = {};
            if (requestData.message) {
                try {
                    parentsInfo = typeof requestData.message === 'string'
                        ? JSON.parse(requestData.message)
                        : requestData.message;
                } catch (e) {
                    console.error('Erreur parsing parents info:', e);
                    parentsInfo = {};
                }
            }

            // Préparer les données des parents à créer
            const parentsToCreate = [];

            // PÈRE - extraire informations du format "Prénom Nom - email"
            if (parentsInfo.pere) {
                const pereData = parentsInfo.pere.split(' - ');
                if (pereData.length >= 2) {
                    const nomPrenom = pereData[0].trim().split(' ');
                    const prenom = nomPrenom[0];
                    const nom = nomPrenom.slice(1).join(' ');
                    const email = pereData[1].trim();

                    parentsToCreate.push({
                        firstName: prenom,
                        lastName: nom,
                        email: email,
                        role: 'PARENT',
                        phone: requestData.parentPhone,
                        adress: parentsInfo.adresse || requestData.parentAddress
                    });
                }
            }

            // MÈRE - extraire informations du format "Prénom Nom - email"
            if (parentsInfo.mere) {
                const mereData = parentsInfo.mere.split(' - ');
                if (mereData.length >= 2) {
                    const nomPrenom = mereData[0].trim().split(' ');
                    const prenom = nomPrenom[0];
                    const nom = nomPrenom.slice(1).join(' ');
                    const email = mereData[1].trim();

                    parentsToCreate.push({
                        firstName: prenom,
                        lastName: nom,
                        email: email,
                        role: 'PARENT',
                        phone: requestData.parentPhone,
                        adress: parentsInfo.adresse || requestData.parentAddress
                    });
                }
            }

            // Fallback : créer au moins le parent principal si aucun parent extrait
            if (parentsToCreate.length === 0) {
                parentsToCreate.push({
                    firstName: requestData.parentFirstName,
                    lastName: requestData.parentLastName,
                    email: requestData.parentEmail,
                    role: 'PARENT',
                    phone: requestData.parentPhone,
                    adress: requestData.parentAddress
                });
            }

            // Créer ou mettre à jour les comptes parents
            const createdParents = [];
            let tempPassword = 'TempEcole' + Math.floor(Math.random() * 1000) + '!';
            const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

            for (const parentData of parentsToCreate) {
                let existingUser = await prisma.user.findUnique({
                    where: { email: parentData.email }
                });

                let parentUser;
                if (existingUser) {
                    // Si le parent existe déjà, l'utiliser et mettre à jour
                    parentUser = await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            password: hashedTempPassword,
                            phone: parentData.phone || existingUser.phone,
                            adress: parentData.adress || existingUser.adress
                        }
                    });
                } else {
                    // Créer le nouveau compte parent
                    parentUser = await prisma.user.create({
                        data: {
                            ...parentData,
                            password: hashedTempPassword
                        }
                    });
                }

                createdParents.push(parentUser);
            }

            // Utiliser le premier parent créé pour les enfants (parent principal)
            const parentUser = createdParents[0];

            // 👶 CRÉER LES ENFANTS
            let createdStudents = [];
            if (requestData.children && requestData.children.length > 0) {
                const childrenData = requestData.children;


                for (const childData of childrenData) {
                    if (childData.firstName && childData.lastName && childData.birthDate) {
                        // Attribution dynamique de la classe
                        let classeId = null;
                        let assignmentMethod = '';

                        // Recherche par requestedClass d'abord
                        if (childData.requestedClass) {
                            let requestedClassObj = await prisma.classe.findFirst({
                                where: { niveau: childData.requestedClass }
                            });

                            if (!requestedClassObj) {
                                requestedClassObj = await prisma.classe.findFirst({
                                    where: { nom: childData.requestedClass }
                                });
                            }

                            if (requestedClassObj) {
                                classeId = requestedClassObj.id;
                                assignmentMethod = `requestedClass "${childData.requestedClass}" → ${requestedClassObj.nom}`;
                            }
                        }

                        // Recherche par schoolLevel si pas trouvé
                        if (!classeId && childData.schoolLevel) {
                            const schoolLevelObj = await prisma.classe.findFirst({
                                where: { niveau: childData.schoolLevel.toUpperCase() }
                            });

                            if (schoolLevelObj) {
                                classeId = schoolLevelObj.id;
                                assignmentMethod = `schoolLevel "${childData.schoolLevel}" → ${schoolLevelObj.nom}`;
                            }
                        }

                        // Classe par défaut si rien trouvé
                        if (!classeId) {
                            const defaultClass = await prisma.classe.findFirst({
                                where: { niveau: 'PS' }
                            });

                            if (defaultClass) {
                                classeId = defaultClass.id;
                                assignmentMethod = `défaut → ${defaultClass.nom}`;
                            } else {
                                const firstClass = await prisma.classe.findFirst();
                                if (firstClass) {
                                    classeId = firstClass.id;
                                    assignmentMethod = `première disponible → ${firstClass.nom}`;
                                }
                            }
                        }

                        if (classeId) {
                            const student = await prisma.student.create({
                                data: {
                                    firstName: childData.firstName,
                                    lastName: childData.lastName,
                                    dateNaissance: new Date(childData.birthDate),
                                    parentId: parentUser.id,  // 🔧 CORRECTION: Lien direct parent-enfant
                                    classeId: classeId
                                }
                            });

                            // Créer la relation parent-étudiant (relation many-to-many)
                            await prisma.parentStudent.create({
                                data: {
                                    parentId: parentUser.id,
                                    studentId: student.id
                                }
                            });

                            // 🔧 CORRECTION: Créer relation pour tous les parents créés
                            for (const additionalParent of createdParents.slice(1)) {
                                await prisma.parentStudent.create({
                                    data: {
                                        parentId: additionalParent.id,
                                        studentId: student.id
                                    }
                                });
                            }

                            createdStudents.push(student);
                        }
                    }
                }

            }

            // 🔄 METTRE À JOUR LE STATUT SELON LE TYPE DE DEMANDE
            const finalNote = comment || `Inscription finalisée - ${createdParents.length} compte(s) parent(s) et ${createdStudents.length} enfant(s) créés`;

            if (requestType === 'PRE_INSCRIPTION') {
                await prisma.preInscriptionRequest.update({
                    where: { id: requestId },
                    data: {
                        status: 'COMPLETED',
                        processedAt: new Date(),
                        processedBy: req.session.user.id,
                        adminNotes: finalNote
                    }
                });
            } else if (requestType === 'DOSSIER_INSCRIPTION') {
                await prisma.dossierInscription.update({
                    where: { id: requestId },
                    data: {
                        statut: 'FINALISE',
                        dateTraitement: new Date(),
                        traitePar: req.session.user.id,
                        notesAdministratives: finalNote
                    }
                });
            }

            // Envoyer email avec les identifiants à tous les parents créés
            for (const parent of createdParents) {
                try {
                    await emailService.sendApprovalEmailWithCredentials({
                        parentFirstName: parent.firstName,
                        parentLastName: parent.lastName,
                        parentEmail: parent.email,
                        children: request.children,
                        createdStudents: createdStudents,
                        tempPassword: tempPassword
                    }, comment);
                } catch (emailError) {
                    console.error(`❌ Erreur envoi email identifiants à ${parent.email}:`, emailError);
                }
            }

            res.json({
                success: true,
                message: `Inscription finalisée avec succès - Comptes créés pour ${createdParents.length} parent(s) et ${createdStudents.length} enfant(s)`,
                parentsCreated: createdParents.length,
                studentsCreated: createdStudents.length
            });

        } catch (error) {
            console.error('Erreur lors de la finalisation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la finalisation: ' + error.message
            });
        }
    },

    // Pour l'admin : rejeter une demande
    rejectRequest: async (req, res) => {
        try {

            const { id } = req.params;
            const { reason } = req.body;


            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Le motif du refus est obligatoire'
                });
            }


            let request = null;
            let foundIn = null;

            // 1. Chercher d'abord dans dossierInscription (plus probable)
            const dossierRequest = await prisma.dossierInscription.findUnique({
                where: { id: parseInt(id) }
            });

            if (dossierRequest) {
                foundIn = 'dossierInscription';

                // Mettre à jour le statut dans dossierInscription
                await prisma.dossierInscription.update({
                    where: { id: parseInt(id) },
                    data: {
                        statut: 'REFUSE',
                        dateTraitement: new Date(),
                        traitePar: req.session.user.id,
                        notesAdministratives: reason
                    }
                });

                request = dossierRequest; // Pour pas que ce soit null
            } else {
                // 2. Sinon chercher dans inscriptionRequest
                request = await prisma.inscriptionRequest.findUnique({
                    where: { id: parseInt(id) }
                });

                if (request) {
                    foundIn = 'inscriptionRequest';

                    // Mettre à jour le statut dans inscriptionRequest
                    await prisma.inscriptionRequest.update({
                        where: { id: parseInt(id) },
                        data: {
                            status: 'REJECTED',
                            processedAt: new Date(),
                            processedBy: req.session.user.id,
                            adminNotes: reason
                        }
                    });
                } else {
                    // 3. Enfin chercher dans preInscriptionRequest
                    request = await prisma.preInscriptionRequest.findUnique({
                        where: { id: parseInt(id) }
                    });

                    if (request) {
                        foundIn = 'preInscriptionRequest';

                        // Mettre à jour le statut dans preInscriptionRequest
                        await prisma.preInscriptionRequest.update({
                            where: { id: parseInt(id) },
                            data: {
                                status: 'REJECTED',
                                processedAt: new Date(),
                                processedBy: req.session.user.id,
                                adminNotes: reason
                            }
                        });
                    }
                }
            }

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande non trouvée'
                });
            }


            res.json({
                success: true,
                message: 'Demande refusée et email envoyé'
            });

        } catch (error) {
            console.error('Erreur lors du refus:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du refus: ' + error.message
            });
        }
    },

    // Pour l'admin : supprimer une demande (GESTION UNIFIÉE)
    deleteRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const requestId = parseInt(id);


            // 🔍 DÉTECTER DANS QUELLE TABLE SE TROUVE LA DEMANDE
            let deleteResult = null;
            let deletedFrom = null;

            // 1. Essayer dans PreInscriptionRequest
            try {
                const existsInPreInscription = await prisma.preInscriptionRequest.findUnique({
                    where: { id: requestId }
                });

                if (existsInPreInscription) {
                    await prisma.preInscriptionRequest.delete({
                        where: { id: requestId }
                    });
                    deleteResult = true;
                    deletedFrom = 'PreInscriptionRequest';
                }
            } catch (error) {
                if (error.code !== 'P2025') { // P2025 = Record not found
                    throw error;
                }
            }

            // 2. Si pas trouvé dans PreInscriptionRequest, essayer DossierInscription
            if (!deleteResult) {
                try {
                    const existsInDossierInscription = await prisma.dossierInscription.findUnique({
                        where: { id: requestId }
                    });

                    if (existsInDossierInscription) {
                        await prisma.dossierInscription.delete({
                            where: { id: requestId }
                        });
                        deleteResult = true;
                        deletedFrom = 'DossierInscription';
                    }
                } catch (error) {
                    if (error.code !== 'P2025') { // P2025 = Record not found
                        throw error;
                    }
                }
            }

            // 3. Vérifier si la suppression a réussi
            if (deleteResult) {
                res.json({
                    success: true,
                    message: `Demande supprimée avec succès depuis ${deletedFrom}`
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: `Demande ID ${requestId} introuvable`
                });
            }

        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression: ' + error.message
            });
        }
    },

    // Pour l'admin : voir les détails d'une demande (VERSION UNIFIÉE)
    showRequestDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const requestId = parseInt(id);


            // 🔍 RECHERCHE UNIFIÉE DANS LES DEUX TABLES
            let request = null;
            let requestType = null;
            let normalizedRequest = {};

            // 1. Essayer dans PreInscriptionRequest
            const preInscriptionRequest = await prisma.preInscriptionRequest.findUnique({
                where: { id: requestId },
                include: {
                    processor: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            if (preInscriptionRequest) {
                request = preInscriptionRequest;
                requestType = 'PRE_INSCRIPTION';

                // Normaliser vers le format unifié
                let children = [];
                if (request.children) {
                    try {
                        children = typeof request.children === 'string' ? JSON.parse(request.children) : request.children;
                    } catch (e) {
                        console.error('Erreur parsing children:', e);
                        children = [];
                    }
                }

                // Parser les informations des parents
                let parentsInfo = {};
                if (request.message) {
                    try {
                        parentsInfo = typeof request.message === 'string' ? JSON.parse(request.message) : request.message;
                    } catch (e) {
                        console.error('Erreur parsing parents info:', e);
                        parentsInfo = {};
                    }
                }

                normalizedRequest = {
                    id: request.id,
                    type: 'PRE_INSCRIPTION',
                    status: request.status,
                    submittedAt: request.submittedAt,
                    parentFirstName: request.parentFirstName,
                    parentLastName: request.parentLastName,
                    parentEmail: request.parentEmail,
                    parentPhone: request.parentPhone,
                    parentAddress: request.parentAddress,
                    children: children,
                    parentsInfo: parentsInfo,
                    processor: request.processor,
                    processedAt: request.processedAt,
                    adminNotes: request.adminNotes,
                    message: request.message
                };
            }

            // 2. Si pas trouvé, essayer DossierInscription
            if (!request) {
                const dossierInscription = await prisma.dossierInscription.findUnique({
                    where: { id: requestId },
                    include: {
                        traitant: {
                            select: { firstName: true, lastName: true }
                        }
                    }
                });

                if (dossierInscription) {
                    request = dossierInscription;
                    requestType = 'DOSSIER_INSCRIPTION';

                    // Normaliser vers le format unifié
                    const children = [{
                        firstName: dossierInscription.enfantPrenom,
                        lastName: dossierInscription.enfantNom,
                        birthDate: dossierInscription.enfantDateNaissance,
                        requestedClass: dossierInscription.enfantClasseDemandee
                    }];

                    normalizedRequest = {
                        id: request.id,
                        type: 'DOSSIER_INSCRIPTION',
                        status: request.statut,
                        submittedAt: request.createdAt,
                        parentFirstName: request.perePrenom || request.merePrenom,
                        parentLastName: request.pereNom || request.mereNom,
                        parentEmail: request.pereEmail || request.mereEmail,
                        parentPhone: request.pereTelephone || request.mereTelephone,
                        parentAddress: request.adresseComplete,
                        children: children,
                        parentsInfo: {
                            pere: `${request.perePrenom} ${request.pereNom} - ${request.pereEmail}`,
                            mere: `${request.merePrenom} ${request.mereNom} - ${request.mereEmail}`,
                            adresse: request.adresseComplete
                        },
                        processor: request.traitant,
                        processedAt: request.dateTraitement,
                        adminNotes: request.notesAdministratives,
                        // Données spécifiques au dossier complet
                        pereInfo: {
                            nom: request.pereNom,
                            prenom: request.perePrenom,
                            profession: request.pereProfession,
                            telephone: request.pereTelephone,
                            email: request.pereEmail
                        },
                        mereInfo: {
                            nom: request.mereNom,
                            prenom: request.merePrenom,
                            profession: request.mereProfession,
                            telephone: request.mereTelephone,
                            email: request.mereEmail
                        },
                        situationFamiliale: request.situationFamiliale,
                        nombreEnfantsFoyer: request.nombreEnfantsFoyer
                    };
                }
            }

            // 3. Vérifications
            if (!request) {
                return res.status(404).render('pages/error', {
                    message: 'Demande non trouvée',
                    user: req.session.user
                });
            }


            res.render('pages/admin/inscription-request-details', {
                title: 'Détails de la demande',
                request: normalizedRequest,
                requestType: requestType,
                user: req.session.user
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des détails:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des détails',
                user: req.session.user
            });
        }
    },

    // API pour récupérer les classes disponibles
    getAvailableClasses: async (req, res) => {
        try {
            const classes = await prisma.classe.findMany({
                orderBy: [
                    { niveau: 'asc' },
                    { nom: 'asc' }
                ],
                include: {
                    _count: {
                        select: { students: true }
                    }
                }
            });

            res.json({
                success: true,
                classes: classes.map(classe => ({
                    id: classe.id,
                    nom: classe.nom,
                    niveau: classe.niveau,
                    anneeScolaire: classe.anneeScolaire,
                    studentCount: classe._count.students
                }))
            });

        } catch (error) {
            console.error('Erreur récupération classes:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des classes'
            });
        }
    },

    // Notifier Yamina manuellement
    notifyYamina: async (req, res) => {
        try {
            // Récupérer toutes les classes avec leurs élèves
            const classes = await prisma.classe.findMany({
                include: {
                    students: {
                        include: {
                            parents: {
                                include: {
                                    parent: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                            email: true,
                                            phone: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { niveau: 'asc' },
                    { nom: 'asc' }
                ]
            });

            // Récupérer Yamina
            const yamina = await prisma.user.findFirst({
                where: { role: 'SECRETAIRE_DIRECTION' }
            });

            if (!yamina) {
                return res.status(404).json({
                    success: false,
                    message: 'Secrétaire introuvable'
                });
            }

            // Préparer les données pour l'email
            const classesData = classes.map(classe => ({
                nom: classe.nom,
                niveau: classe.niveau,
                studentCount: classe.students.length,
                students: classe.students.map(student => {
                    const parents = student.parents.map(ps => ps.parent);
                    const parentNames = parents.map(p => `${p.firstName} ${p.lastName}`).join(' & ');
                    const parentEmails = parents.map(p => p.email).join(' / ');
                    const parentPhones = parents.map(p => p.phone || 'Non renseigné').join(' / ');

                    return {
                        nom: `${student.firstName} ${student.lastName}`,
                        parent: parentNames || 'Non renseigné',
                        email: parentEmails || 'Non renseigné',
                        telephone: parentPhones
                    };
                })
            }));

            // Envoyer l'email à Yamina
            await emailService.sendClassListsToYamina({
                yamimaEmail: yamina.email,
                yamimaFirstName: yamina.firstName,
                classes: classesData
            });

            res.json({
                success: true,
                message: 'Listes de classes envoyées à Yamina avec succès'
            });

        } catch (error) {
            console.error('Erreur notification Yamina:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi de la notification'
            });
        }
    },

    // Page de gestion des inscriptions améliorée (VUE UNIFIÉE)
    showManageInscriptions: async (req, res) => {
        try {
            // 🔄 RÉCUPÉRER LES DEUX TYPES DE DEMANDES

            // 1. Pré-inscriptions (ancienne structure)
            const preInscriptions = await prisma.preInscriptionRequest.findMany({
                orderBy: { submittedAt: 'desc' },
                include: {
                    processor: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            // 2. Dossiers d'inscription (nouvelle structure)
            const dossiersInscriptions = await prisma.dossierInscription.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    traitant: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            // 🔧 NORMALISER LES DONNÉES VERS UN FORMAT UNIFIÉ
            const normalizedPreInscriptions = preInscriptions.map(req => {
                let children = [];
                if (req.children) {
                    try {
                        children = typeof req.children === 'string' ? JSON.parse(req.children) : req.children;
                    } catch (e) {
                        console.error('Erreur parsing children pour request', req.id, ':', e);
                        children = [];
                    }
                }

                return {
                    id: req.id,
                    type: 'PRE_INSCRIPTION',
                    status: req.status,
                    submittedAt: req.submittedAt,
                    parentFirstName: req.parentFirstName,
                    parentLastName: req.parentLastName,
                    parentEmail: req.parentEmail,
                    children: children,
                    enfantPrenom: children.length > 0 ? children[0].firstName : '',
                    enfantNom: children.length > 0 ? children[0].lastName : '',
                    enfantClasseDemandee: children.length > 0 ? children[0].requestedClass : '',
                    processor: req.processor,
                    processedAt: req.processedAt,
                    adminNotes: req.adminNotes
                };
            });

            const normalizedDossiers = dossiersInscriptions.map(dossier => ({
                id: dossier.id,
                type: 'DOSSIER_INSCRIPTION',
                status: dossier.statut,
                submittedAt: dossier.createdAt,
                parentFirstName: dossier.perePrenom || dossier.merePrenom,
                parentLastName: dossier.pereNom || dossier.mereNom,
                parentEmail: dossier.pereEmail || dossier.mereEmail,
                children: [{
                    firstName: dossier.enfantPrenom,
                    lastName: dossier.enfantNom,
                    birthDate: dossier.enfantDateNaissance,
                    requestedClass: dossier.enfantClasseDemandee
                }], // ✅ CORRECTION: Créer la structure children pour uniformité
                enfantPrenom: dossier.enfantPrenom,
                enfantNom: dossier.enfantNom,
                enfantClasseDemandee: dossier.enfantClasseDemandee,
                processor: dossier.traitant,
                processedAt: dossier.dateTraitement,
                adminNotes: dossier.notesAdministratives
            }));

            // 🔗 COMBINER ET TRIER LES DEMANDES
            const requests = [...normalizedPreInscriptions, ...normalizedDossiers]
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

            // 📊 CALCULER LES STATISTIQUES UNIFIÉES
            const pendingCount = requests.filter(r =>
                r.status === 'PENDING' || r.status === 'EMAIL_PENDING' || r.status === 'EN_ATTENTE'
            ).length;
            const approvedCount = requests.filter(r =>
                r.status === 'APPROVED' || r.status === 'ACCEPTED' || r.status === 'VALIDE'
            ).length;
            const rejectedCount = requests.filter(r =>
                r.status === 'REJECTED' || r.status === 'REFUSE'
            ).length;
            const completedCount = requests.filter(r =>
                r.status === 'COMPLETED' || r.status === 'EN_COURS'
            ).length;
            const totalCount = requests.length;

            // Récupérer la configuration des inscriptions
            let config = await prisma.inscriptionConfiguration.findFirst();
            if (!config) {
                // Créer une configuration par défaut si elle n'existe pas
                config = await prisma.inscriptionConfiguration.create({
                    data: {
                        afficherAnnoncePS2026: false
                    }
                });
            }

            // Les données sont déjà normalisées, pas besoin de parsing supplémentaire
            const requestsWithParsedChildren = requests;

            res.render('pages/admin/manage-inscriptions', {
                title: 'Gestion des Inscriptions',
                requests: requestsWithParsedChildren,
                pendingCount,
                approvedCount,
                rejectedCount,
                totalCount,
                config, // Ajouter la configuration
                user: req.session.user
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des demandes',
                user: req.session.user
            });
        }
    },

    // Mettre à jour la configuration des inscriptions
    updateInscriptionConfig: async (req, res) => {
        try {
            const { afficherAnnoncePS2026 } = req.body;

            // Récupérer ou créer la configuration
            let config = await prisma.inscriptionConfiguration.findFirst();

            if (config) {
                // Mettre à jour la configuration existante
                config = await prisma.inscriptionConfiguration.update({
                    where: { id: config.id },
                    data: {
                        afficherAnnoncePS2026: Boolean(afficherAnnoncePS2026)
                    }
                });
            } else {
                // Créer une nouvelle configuration
                config = await prisma.inscriptionConfiguration.create({
                    data: {
                        afficherAnnoncePS2026: Boolean(afficherAnnoncePS2026)
                    }
                });
            }


            res.json({
                success: true,
                message: 'Configuration mise à jour avec succès',
                config: config
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour de la configuration:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la configuration'
            });
        }
    }
};

module.exports = inscriptionController;
