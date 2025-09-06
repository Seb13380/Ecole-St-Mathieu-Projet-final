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
                    birthDate: req.body.childBirthDate
                }];
            } else {
                // Enfants envoyés en tableau séparé
                const firstNames = Array.isArray(req.body.childFirstName) ? req.body.childFirstName : [req.body.childFirstName];
                const lastNames = Array.isArray(req.body.childLastName) ? req.body.childLastName : [req.body.childLastName];
                const birthDates = Array.isArray(req.body.childBirthDate) ? req.body.childBirthDate : [req.body.childBirthDate];

                childrenData = firstNames.map((firstName, index) => ({
                    firstName,
                    lastName: lastNames[index],
                    birthDate: birthDates[index]
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

            // 📧 ENVOI EMAIL CONFIRMATION PARENT
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

    // Pour l'admin : approuver une demande
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

            // Vérifier si un compte parent existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: request.parentEmail }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Un compte avec cet email existe déjà'
                });
            }

            // Créer le compte parent avec un mot de passe temporaire
            const tempPassword = 'TempEcole' + Math.floor(Math.random() * 1000) + '!';
            const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

            const parentUser = await prisma.user.create({
                data: {
                    firstName: request.parentFirstName,
                    lastName: request.parentLastName,
                    email: request.parentEmail,
                    password: hashedTempPassword, // Mot de passe temporaire sécurisé
                    role: 'PARENT',
                    phone: request.parentPhone,
                    adress: request.parentAddress
                }
            });

            console.log('✅ Compte parent créé:', request.parentEmail);

            // 👶 CRÉER LES ENFANTS
            let createdStudents = [];
            if (request.children) {
                const childrenData = typeof request.children === 'string'
                    ? JSON.parse(request.children)
                    : request.children;

                console.log('👶 Création des enfants...');

                for (const childData of childrenData) {
                    if (childData.firstName && childData.lastName && childData.birthDate) {
                        const student = await prisma.student.create({
                            data: {
                                firstName: childData.firstName,
                                lastName: childData.lastName,
                                dateNaissance: new Date(childData.birthDate),
                                parentId: parentUser.id,
                                classeId: 1 // Classe par défaut CP A
                            }
                        });

                        createdStudents.push(student);
                        console.log(`   ✅ Enfant créé: ${student.firstName} ${student.lastName} (ID: ${student.id})`);
                    }
                }

                console.log(`✅ ${createdStudents.length} enfant(s) créé(s) pour le parent ${request.parentEmail}`);
            }

            // Mettre à jour le statut de la demande
            await prisma.preInscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'ACCEPTED',
                    processedAt: new Date(),
                    processedBy: req.session.user.id,
                    adminNotes: comment || `Demande approuvée - Compte parent et ${createdStudents.length} enfant(s) créés`
                }
            });

            // Envoyer email d'approbation avec identifiants
            try {
                await emailService.sendApprovalEmailWithCredentials({
                    parentFirstName: request.parentFirstName,
                    parentLastName: request.parentLastName,
                    parentEmail: request.parentEmail,
                    children: request.children,
                    tempPassword: tempPassword,
                    createdStudents: createdStudents
                }, comment);
                console.log('✅ Email d\'approbation avec identifiants envoyé');
            } catch (emailError) {
                console.error('❌ Erreur envoi approbation:', emailError);
            }

            res.json({
                success: true,
                message: 'Demande approuvée avec succès et compte parent créé',
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
                students: classe.students.map(student => ({
                    nom: `${student.firstName} ${student.lastName}`,
                    parent: `${student.parent.firstName} ${student.parent.lastName}`,
                    email: student.parent.email,
                    telephone: student.parent.phone || 'Non renseigné'
                }))
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
