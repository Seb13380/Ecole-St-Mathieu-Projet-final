const { PrismaClient } = require('@prisma/client');
const directeurController = require('./directeurController');

const prisma = new PrismaClient();

const secretaireController = {
    // Dashboard secrétaire - Utilise le même dashboard que le directeur
    dashboard: async (req, res) => {
        try {

            // Vérifier que l'utilisateur a les droits
            if (!['SECRETAIRE_DIRECTION', 'DIRECTION', 'ADMIN'].includes(req.session.user.role)) {
                return res.status(403).render('pages/error.twig', {
                    message: 'Accès refusé - Réservé au secrétariat'
                });
            }

            // Récupérer les statistiques complètes comme le directeur
            const statsArray = await Promise.all([
                prisma.user.count(),
                prisma.student.count(),
                prisma.classe.count(),
                prisma.message.count(),
                prisma.actualite.count(),
                prisma.travaux.count(),
                // Compter les demandes en attente : pré-inscriptions + dossiers d'inscription
                Promise.all([
                    prisma.preInscriptionRequest.count({ where: { status: 'PENDING' } }),
                    prisma.dossierInscription.count({ where: { statut: 'EN_ATTENTE' } })
                ]).then(counts => counts[0] + counts[1]),
                prisma.credentialsRequest.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
                prisma.preInscriptionRequest.count({ where: { status: 'ACCEPTED' } }) // Rendez-vous en attente
            ]);

            // Créer l'objet stats
            const stats = {
                totalUsers: statsArray[0],
                totalStudents: statsArray[1],
                totalClasses: statsArray[2],
                totalMessages: statsArray[3],
                totalActualites: statsArray[4],
                totalTravaux: statsArray[5],
                pendingInscriptions: statsArray[6],
                pendingCredentials: statsArray[7],
                acceptedInscriptions: statsArray[8] // Rendez-vous en attente
            };

            // Debug - vérification des valeurs

            // Récupérer les utilisateurs récents
            const recentUsers = await prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });

            // Récupérer les messages de contact non traités
            const recentMessages = await prisma.contact.findMany({
                where: { traite: false },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    nom: true,
                    email: true,
                    sujet: true,
                    createdAt: true
                }
            });

            // Récupérer les demandes d'inscription en attente
            const pendingRequests = await prisma.preInscriptionRequest.findMany({
                where: { status: 'PENDING' },
                take: 5,
                orderBy: { submittedAt: 'desc' },
                select: {
                    id: true,
                    parentFirstName: true,
                    parentLastName: true,
                    parentEmail: true,
                    submittedAt: true
                }
            });

            // Récupérer les demandes d'identifiants en attente
            const pendingCredentials = await prisma.credentialsRequest.findMany({
                where: {
                    status: { in: ['PENDING', 'PROCESSING'] }
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    foundParent: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });

            // Rendu avec le template du directeur
            res.render('pages/directeur/dashboard.twig', {
                title: 'Secrétariat - Tableau de bord',
                user: req.session.user,
                stats: stats,
                recentUsers: recentUsers,
                recentMessages: recentMessages,
                pendingRequests: pendingRequests,
                pendingCredentials: pendingCredentials,
                isSecretary: true // Flag pour indiquer que c'est la secrétaire
            });

        } catch (error) {
            console.error('❌ Erreur dashboard secrétaire:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement du tableau de bord'
            });
        }
    },

    // Consulter les listes d'élèves reçues
    async getClassLists(req, res) {
        try {
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
                        },
                        orderBy: { lastName: 'asc' }
                    }
                },
                orderBy: { nom: 'asc' }
            });

            res.render('pages/secretaire/class-lists.twig', {
                title: 'Listes d\'élèves',
                user: req.session.user,
                classes
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des listes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des listes',
                user: req.session.user
            });
        }
    },

    // === DELEGATION DES FONCTIONS DU DIRECTEUR ===
    // Toutes les fonctions du directeur sont maintenant accessibles à la secrétaire

    // Gestion des utilisateurs
    getUsersManagement: directeurController.getUsersManagement,
    getUser: directeurController.getUser,
    createUser: directeurController.createUser,
    updateUser: directeurController.updateUser,
    deleteUser: directeurController.deleteUser,

    // Gestion des classes
    getClassesManagement: directeurController.getClassesManagement,
    createClasse: directeurController.createClasse,
    updateClasse: directeurController.updateClasse,
    deleteClasse: directeurController.deleteClasse,
    exportClassList: directeurController.exportClassList,
    exportAllClassesAndEmail: directeurController.exportAllClassesAndEmail,

    // Gestion des élèves
    getStudentsManagement: directeurController.getStudentsManagement,
    createStudent: directeurController.createStudent,
    updateStudent: directeurController.updateStudent,
    deleteStudent: directeurController.deleteStudent,

    // Rendez-vous d'inscription
    getRendezVousInscriptions: directeurController.getRendezVousInscriptions,
    generateInscriptionPDF: directeurController.generateInscriptionPDF,

    // Archive PDF
    getPDFArchive: directeurController.getPDFArchive,

    // Messages de contact
    getContactMessages: directeurController.getContactMessages,
    markContactAsProcessed: directeurController.markContactAsProcessed,

    // Demandes d'identifiants
    getCredentialsRequests: directeurController.getCredentialsRequests,
    approveCredentialsRequest: directeurController.approveCredentialsRequest,
    rejectCredentialsRequest: directeurController.rejectCredentialsRequest,
    deleteCredentialsRequest: directeurController.deleteCredentialsRequest,

    // Rapports et statistiques
    getReports: directeurController.getReports,

    // Paramètres système
    getSettings: directeurController.getSettings,
    updateSettings: directeurController.updateSettings,

    // Import Excel
    getImportExcel: directeurController.getImportExcel,
    processExcelImport: directeurController.processExcelImport
};

module.exports = secretaireController;
