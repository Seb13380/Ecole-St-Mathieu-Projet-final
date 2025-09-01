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
            const inscriptionRequest = await prisma.inscriptionRequest.create({
                data: {
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    parentAddress,
                    password: hashedPassword,
                    children: childrenData
                }
            });

            res.redirect('/auth/register?success=Votre demande d\'inscription a été envoyée avec succès. Vous recevrez une réponse sous 48h.');

        } catch (error) {
            console.error('Erreur lors du traitement de l\'inscription:', error);
            res.redirect('/auth/register?error=Une erreur est survenue. Veuillez réessayer.');
        }
    },

    // Pour l'admin : voir toutes les demandes
    showAllRequests: async (req, res) => {
        try {
            const requests = await prisma.inscriptionRequest.findMany({
                orderBy: { submittedAt: 'desc' },
                include: {
                    reviewer: {
                        select: { firstName: true, lastName: true }
                    }
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
            const request = await prisma.inscriptionRequest.findUnique({
                where: { id: parseInt(id) }
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande d\'inscription non trouvée'
                });
            }

            // Mettre à jour le statut de la demande
            await prisma.inscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'APPROVED',
                    reviewedAt: new Date(),
                    reviewedBy: req.session.user.id,
                    reviewComment: comment || 'Demande approuvée'
                }
            });

            res.json({
                success: true,
                message: 'Demande approuvée avec succès'
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
            const request = await prisma.inscriptionRequest.findUnique({
                where: { id: parseInt(id) }
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande non trouvée'
                });
            }

            // Mettre à jour le statut
            await prisma.inscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    reviewedAt: new Date(),
                    reviewedBy: req.session.user.id,
                    reviewComment: reason
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
            await prisma.inscriptionRequest.delete({
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

            const request = await prisma.inscriptionRequest.findUnique({
                where: { id: parseInt(id) },
                include: {
                    reviewer: {
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
            const requests = await prisma.inscriptionRequest.findMany({
                orderBy: { submittedAt: 'desc' },
                include: {
                    reviewer: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            // Calculer les statistiques
            const pendingCount = requests.filter(r => r.status === 'PENDING').length;
            const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
            const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;
            const totalCount = requests.length;

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
                user: req.session.user
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des demandes',
                user: req.session.user
            });
        }
    }
};

module.exports = inscriptionController;
