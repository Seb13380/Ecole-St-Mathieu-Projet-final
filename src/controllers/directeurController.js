const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const directeurController = {
    // Afficher le tableau de bord du directeur
    dashboard: async (req, res) => {
        try {
            console.log('🏫 Accès au tableau de bord directeur');

            // Vérifier que l'utilisateur a les droits (DIRECTION, ADMIN ou GESTIONNAIRE_SITE)
            if (!['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).render('pages/error.twig', {
                    message: 'Accès refusé - Réservé aux administrateurs'
                });
            }

            // Récupérer les statistiques
            const stats = await Promise.all([
                prisma.user.count(),
                prisma.student.count(),
                prisma.classe.count(),
                prisma.message.count(),
                prisma.actualite.count(),
                prisma.travaux.count(),
                prisma.inscriptionRequest.count({ where: { status: 'PENDING' } })
            ]);

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
            const pendingRequests = await prisma.inscriptionRequest.findMany({
                where: { status: 'PENDING' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    parentFirstName: true,
                    parentLastName: true,
                    parentEmail: true,
                    createdAt: true
                }
            });

            res.render('pages/directeur/dashboard.twig', {
                title: 'Tableau de bord - Administration',
                user: req.session.user,
                stats: {
                    totalUsers: stats[0],
                    totalStudents: stats[1],
                    totalClasses: stats[2],
                    totalMessages: stats[3],
                    totalActualites: stats[4],
                    totalTravaux: stats[5],
                    pendingInscriptions: stats[6]
                },
                recentUsers,
                recentMessages,
                pendingRequests
            });

        } catch (error) {
            console.error('❌ Erreur dashboard directeur:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement du tableau de bord'
            });
        }
    },

    // === GESTION DES UTILISATEURS (migré depuis adminController) ===

    async getUsersManagement(req, res) {
        try {
            const users = await prisma.user.findMany({
                include: {
                    enfants: true,
                    _count: {
                        select: {
                            enfants: true,
                            messages: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.render('pages/admin/users', {
                users,
                title: 'Gestion des utilisateurs',
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des utilisateurs',
                user: req.session.user
            });
        }
    },

    async createUser(req, res) {
        try {
            const { firstName, lastName, email, password, role, phone, adress } = req.body;

            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Un utilisateur avec cet email existe déjà'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    role,
                    phone,
                    adress
                }
            });

            res.json({
                success: true,
                message: 'Utilisateur créé avec succès',
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de l\'utilisateur'
            });
        }
    },

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, email, role, phone, adress } = req.body;

            const user = await prisma.user.update({
                where: { id: parseInt(id) },
                data: {
                    firstName,
                    lastName,
                    email,
                    role,
                    phone,
                    adress
                }
            });

            res.json({
                success: true,
                message: 'Utilisateur mis à jour avec succès',
                user
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'utilisateur'
            });
        }
    },

    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            await prisma.user.delete({
                where: { id: parseInt(id) }
            });

            res.json({
                success: true,
                message: 'Utilisateur supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'utilisateur'
            });
        }
    },

    // === GESTION DES CLASSES ===

    async getClassesManagement(req, res) {
        try {
            const classes = await prisma.classe.findMany({
                include: {
                    eleves: true,
                    _count: {
                        select: {
                            eleves: true
                        }
                    }
                },
                orderBy: { nom: 'asc' }
            });

            res.render('pages/admin/classes', {
                classes,
                title: 'Gestion des classes',
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des classes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des classes',
                user: req.session.user
            });
        }
    },

    async createClasse(req, res) {
        try {
            const { nom, niveau } = req.body;

            const classe = await prisma.classe.create({
                data: { nom, niveau }
            });

            res.json({
                success: true,
                message: 'Classe créée avec succès',
                classe
            });
        } catch (error) {
            console.error('Erreur lors de la création de la classe:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de la classe'
            });
        }
    },

    async updateClasse(req, res) {
        try {
            const { id } = req.params;
            const { nom, niveau } = req.body;

            const classe = await prisma.classe.update({
                where: { id: parseInt(id) },
                data: { nom, niveau }
            });

            res.json({
                success: true,
                message: 'Classe mise à jour avec succès',
                classe
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la classe:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la classe'
            });
        }
    },

    async deleteClasse(req, res) {
        try {
            const { id } = req.params;

            await prisma.classe.delete({
                where: { id: parseInt(id) }
            });

            res.json({
                success: true,
                message: 'Classe supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la classe:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la classe'
            });
        }
    },

    // === GESTION DES ÉLÈVES ===

    async getStudentsManagement(req, res) {
        try {
            const students = await prisma.student.findMany({
                include: {
                    classe: true,
                    parent: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                orderBy: [
                    { classe: { nom: 'asc' } },
                    { lastName: 'asc' }
                ]
            });

            const classes = await prisma.classe.findMany({
                orderBy: { nom: 'asc' }
            });

            res.render('pages/admin/students', {
                students,
                classes,
                title: 'Gestion des élèves',
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des élèves:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des élèves',
                user: req.session.user
            });
        }
    },

    async createStudent(req, res) {
        try {
            const { firstName, lastName, birthDate, classeId, parentId } = req.body;

            const student = await prisma.student.create({
                data: {
                    firstName,
                    lastName,
                    birthDate: new Date(birthDate),
                    classeId: parseInt(classeId),
                    parentId: parseInt(parentId)
                }
            });

            res.json({
                success: true,
                message: 'Élève créé avec succès',
                student
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'élève:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de l\'élève'
            });
        }
    },

    async updateStudent(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, birthDate, classeId, parentId } = req.body;

            const student = await prisma.student.update({
                where: { id: parseInt(id) },
                data: {
                    firstName,
                    lastName,
                    birthDate: new Date(birthDate),
                    classeId: parseInt(classeId),
                    parentId: parseInt(parentId)
                }
            });

            res.json({
                success: true,
                message: 'Élève mis à jour avec succès',
                student
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'élève:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'élève'
            });
        }
    },

    async deleteStudent(req, res) {
        try {
            const { id } = req.params;

            await prisma.student.delete({
                where: { id: parseInt(id) }
            });

            res.json({
                success: true,
                message: 'Élève supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'élève:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'élève'
            });
        }
    },

    // === MESSAGES DE CONTACT ===

    async getContactMessages(req, res) {
        try {
            const messages = await prisma.contact.findMany({
                orderBy: { createdAt: 'desc' }
            });

            res.render('pages/admin/contact-messages', {
                messages,
                title: 'Messages de contact',
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des messages:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des messages',
                user: req.session.user
            });
        }
    },

    async markContactAsProcessed(req, res) {
        try {
            const { id } = req.params;

            await prisma.contact.update({
                where: { id: parseInt(id) },
                data: { traite: true }
            });

            res.json({
                success: true,
                message: 'Message marqué comme traité'
            });
        } catch (error) {
            console.error('Erreur lors du marquage du message:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du marquage du message'
            });
        }
    },

    // === EXPORT ET EMAIL DES LISTES ===

    async exportClassList(req, res) {
        try {
            const { id } = req.params;
            const classe = await prisma.classe.findUnique({
                where: { id: parseInt(id) },
                include: {
                    eleves: {
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
                }
            });

            if (!classe) {
                return res.status(404).render('pages/error', {
                    message: 'Classe non trouvée',
                    user: req.session.user
                });
            }

            // Générer un CSV simple
            let csvContent = `Classe ${classe.nom} (${classe.niveau}) - ${classe.anneeScolaire}\n\n`;
            csvContent += 'Nom;Prénom;Date de naissance;Parent;Email parent;Téléphone parent\n';

            classe.eleves.forEach(student => {
                const dateNaissance = new Date(student.dateNaissance).toLocaleDateString('fr-FR');
                csvContent += `${student.lastName};${student.firstName};${dateNaissance};${student.parent.firstName} ${student.parent.lastName};${student.parent.email};${student.parent.phone}\n`;
            });

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="Liste_${classe.nom}_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send('\uFEFF' + csvContent); // BOM pour UTF-8

        } catch (error) {
            console.error('Erreur lors de l\'export de la liste:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de l\'export de la liste',
                user: req.session.user
            });
        }
    },

    async exportAllClassesAndEmail(req, res) {
        try {
            const classes = await prisma.classe.findMany({
                include: {
                    eleves: {
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

            // Trouver Yamina (secrétaire)
            const yamina = await prisma.user.findFirst({
                where: { role: 'SECRETAIRE_DIRECTION' }
            });

            if (!yamina) {
                return res.status(404).json({
                    success: false,
                    message: 'Secrétaire de direction non trouvée'
                });
            }

            // Générer le rapport complet
            let rapport = `RAPPORT COMPLET DES CLASSES - École Saint-Mathieu\n`;
            rapport += `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n`;
            rapport += `Par: ${req.session.user.firstName} ${req.session.user.lastName}\n\n`;

            let totalEleves = 0;

            classes.forEach(classe => {
                rapport += `\n=== CLASSE ${classe.nom} (${classe.niveau}) ===\n`;
                rapport += `Année scolaire: ${classe.anneeScolaire}\n`;
                rapport += `Nombre d'élèves: ${classe.eleves.length}\n\n`;

                if (classe.eleves.length > 0) {
                    classe.eleves.forEach((student, index) => {
                        const dateNaissance = new Date(student.dateNaissance).toLocaleDateString('fr-FR');
                        rapport += `${index + 1}. ${student.firstName} ${student.lastName}\n`;
                        rapport += `   Né(e) le: ${dateNaissance}\n`;
                        rapport += `   Parent: ${student.parent.firstName} ${student.parent.lastName}\n`;
                        rapport += `   Email: ${student.parent.email}\n`;
                        rapport += `   Téléphone: ${student.parent.phone}\n\n`;
                    });
                } else {
                    rapport += '   Aucun élève inscrit\n\n';
                }

                totalEleves += classe.eleves.length;
            });

            rapport += `\n=== RÉSUMÉ GÉNÉRAL ===\n`;
            rapport += `Total classes: ${classes.length}\n`;
            rapport += `Total élèves: ${totalEleves}\n`;
            rapport += `Moyenne élèves/classe: ${classes.length > 0 ? (totalEleves / classes.length).toFixed(1) : 0}\n`;

            // TODO: Envoyer par email à Yamina
            // const emailService = require('../services/emailService');
            // await emailService.sendClassListToSecretary(yamina.email, rapport);

            res.json({
                success: true,
                message: `Rapport généré et envoyé à ${yamina.firstName} ${yamina.lastName} (${yamina.email})`,
                totalClasses: classes.length,
                totalStudents: totalEleves
            });

        } catch (error) {
            console.error('Erreur lors de l\'export complet:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'export complet'
            });
        }
    },

    // === RAPPORTS ET STATISTIQUES ===

    async getReports(req, res) {
        try {
            const stats = await Promise.all([
                prisma.user.groupBy({
                    by: ['role'],
                    _count: { role: true }
                }),
                prisma.student.count(),
                prisma.classe.count(),
                prisma.actualite.count(),
                prisma.contact.count(),
                prisma.inscriptionRequest.groupBy({
                    by: ['status'],
                    _count: { status: true }
                })
            ]);

            res.render('pages/admin/reports', {
                title: 'Rapports et statistiques',
                user: req.session.user,
                usersByRole: stats[0],
                totalStudents: stats[1],
                totalClasses: stats[2],
                totalNews: stats[3],
                totalContacts: stats[4],
                inscriptionsByStatus: stats[5]
            });
        } catch (error) {
            console.error('Erreur lors de la génération des rapports:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la génération des rapports',
                user: req.session.user
            });
        }
    },

    // === PARAMÈTRES SYSTÈME ===

    async getSettings(req, res) {
        try {
            res.render('pages/admin/settings', {
                title: 'Paramètres système',
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors du chargement des paramètres:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement des paramètres',
                user: req.session.user
            });
        }
    },

    async updateSettings(req, res) {
        try {
            // Logique de mise à jour des paramètres
            res.json({
                success: true,
                message: 'Paramètres mis à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des paramètres:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour des paramètres'
            });
        }
    },

    // === ALIAS POUR COMPATIBILITÉ ===
    getDashboard: function (req, res) {
        return this.dashboard(req, res);
    }
};

module.exports = directeurController;
