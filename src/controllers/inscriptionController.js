const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

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
            // 🛡️ PROTECTION ANTI-SPAM (Honeypot) - PREMIÈRE VÉRIFICATION
            // Si le champ caché "floflo" est rempli, c'est probablement un bot
            if (req.body.floflo && req.body.floflo.trim() !== '') {
                console.log('🚫 Tentative de spam détectée - champ honeypot rempli:', req.body.floflo);
                console.log('🔍 IP source:', req.ip || req.connection.remoteAddress);
                console.log('🔍 User-Agent:', req.get('User-Agent'));
                // Faire semblant que tout s'est bien passé pour tromper les bots
                return res.redirect('/auth/register?success=Votre demande d\'inscription a été envoyée avec succès. Vous recevrez une réponse sous 48h.');
            }

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
                return res.redirect('/auth/register?error=Un compte avec cet email existe déjà');
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
                    birthDate: child.birthDate
                })).filter(child => child.firstName && child.lastName && child.birthDate);
            } else if (req.body.childFirstName) {
                // Un seul enfant
                childrenData = [{
                    firstName: req.body.childFirstName,
                    lastName: req.body.childLastName,
                    birthDate: req.body.childBirthDate,
                    classId: req.body.requestedClass
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
                    classId: classIds[index]
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

                console.log('📧 Envoi notification admin pour demande ID:', inscriptionRequest.id);
                const emailResult = await emailService.sendNewInscriptionNotification(adminEmailData);

                if (emailResult.success) {
                    console.log('✅ Email admin envoyé:', emailResult.messageId);
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

                console.log('📧 Envoi confirmation parent:', parentEmail);
                const parentEmailResult = await emailService.sendInscriptionConfirmation(parentConfirmationData);

                if (parentEmailResult.success) {
                    console.log('✅ Email parent envoyé:', parentEmailResult.messageId);
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
            const requests = await prisma.preInscriptionRequest.findMany({
                orderBy: { submittedAt: 'desc' },
                include: {
                    processor: true
                }
            });

            // Parser les enfants et les parents pour chaque demande
            const requestsWithParsedChildren = requests.map(request => {
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

                return {
                    ...request,
                    children,
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
                console.log('✅ Email de confirmation de rendez-vous envoyé');
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

    // ÉTAPE 2 : Finaliser l'inscription après le rendez-vous (créer les comptes)
    finalizeInscription: async (req, res) => {
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

            if (request.status !== 'ACCEPTED') {
                return res.status(400).json({
                    success: false,
                    message: 'Cette demande n\'est pas au statut accepté pour rendez-vous'
                });
            }

            // Parser les informations des parents depuis le champ message
            let parentsInfo = {};
            if (request.message) {
                try {
                    parentsInfo = typeof request.message === 'string'
                        ? JSON.parse(request.message)
                        : request.message;
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
                        phone: request.parentPhone,
                        adress: parentsInfo.adresse || request.parentAddress
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
                        phone: request.parentPhone,
                        adress: parentsInfo.adresse || request.parentAddress
                    });
                }
            }

            // Fallback : créer au moins le parent principal si aucun parent extrait
            if (parentsToCreate.length === 0) {
                parentsToCreate.push({
                    firstName: request.parentFirstName,
                    lastName: request.parentLastName,
                    email: request.parentEmail,
                    role: 'PARENT',
                    phone: request.parentPhone,
                    adress: request.parentAddress
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
                    console.log('✅ Compte parent existant mis à jour:', parentData.email);
                } else {
                    // Créer le nouveau compte parent
                    parentUser = await prisma.user.create({
                        data: {
                            ...parentData,
                            password: hashedTempPassword
                        }
                    });
                    console.log('✅ Nouveau compte parent créé:', parentData.email);
                }

                createdParents.push(parentUser);
            }

            // Utiliser le premier parent créé pour les enfants (parent principal)
            const parentUser = createdParents[0];

            // 👶 CRÉER LES ENFANTS
            let createdStudents = [];
            if (request.children) {
                const childrenData = typeof request.children === 'string'
                    ? JSON.parse(request.children)
                    : request.children;

                console.log('👶 Création des enfants...');

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
                                    classeId: classeId
                                }
                            });

                            // Créer la relation parent-étudiant
                            await prisma.parentStudent.create({
                                data: {
                                    parentId: parentUser.id,
                                    studentId: student.id
                                }
                            });

                            createdStudents.push(student);
                            console.log(`✅ Enfant créé: ${student.firstName} ${student.lastName} (ID: ${student.id})`);
                        }
                    }
                }

                console.log(`✅ ${createdStudents.length} enfant(s) créé(s) pour les parents`);
            }

            // Mettre à jour le statut à COMPLETED
            await prisma.preInscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'COMPLETED',
                    processedAt: new Date(),
                    processedBy: req.session.user.id,
                    adminNotes: comment || `Inscription finalisée - ${createdParents.length} compte(s) parent(s) et ${createdStudents.length} enfant(s) créés`
                }
            });

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
                    console.log(`✅ Email avec identifiants envoyé à: ${parent.email}`);
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

            // Récupérer la demande
            const request = await prisma.preInscriptionRequest.findUnique({
                where: { id: parseInt(id) }
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande non trouvée'
                });
            }

            // Mettre à jour le statut
            await prisma.preInscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    processedAt: new Date(),
                    processedBy: req.session.user.id,
                    adminNotes: reason
                }
            });

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

    // Pour l'admin : supprimer une demande
    deleteRequest: async (req, res) => {
        try {
            const { id } = req.params;

            // Supprimer la demande
            await prisma.preInscriptionRequest.delete({
                where: { id: parseInt(id) }
            });

            res.json({
                success: true,
                message: 'Demande supprimée avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression: ' + error.message
            });
        }
    },

    // Pour l'admin : voir les détails d'une demande
    showRequestDetails: async (req, res) => {
        try {
            const { id } = req.params;

            const request = await prisma.preInscriptionRequest.findUnique({
                where: { id: parseInt(id) },
                include: {
                    processor: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            if (!request) {
                return res.status(404).render('pages/error', {
                    message: 'Demande non trouvée',
                    user: req.session.user
                });
            }

            // Parser les enfants
            let children = [];
            if (request.children) {
                try {
                    children = typeof request.children === 'string'
                        ? JSON.parse(request.children)
                        : request.children;
                } catch (e) {
                    console.error('Erreur parsing children:', e);
                    children = [];
                }
            }

            res.render('pages/admin/inscription-request-details', {
                title: 'Détails de la demande',
                request: {
                    ...request,
                    children
                },
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

    // Page de gestion des inscriptions améliorée
    showManageInscriptions: async (req, res) => {
        try {
            // Récupérer toutes les demandes avec statistiques
            const requests = await prisma.preInscriptionRequest.findMany({
                orderBy: { submittedAt: 'desc' },
                include: {
                    processor: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            // Calculer les statistiques
            const pendingCount = requests.filter(r => r.status === 'PENDING').length;
            const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
            const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;
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

            // Parser les enfants pour chaque demande
            const requestsWithParsedChildren = requests.map(request => {
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
                return {
                    ...request,
                    children
                };
            });

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

            console.log(`Configuration PS2026 mise à jour: ${afficherAnnoncePS2026 ? 'activée' : 'désactivée'}`);

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
