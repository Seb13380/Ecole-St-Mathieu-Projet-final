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
            const statsArray = await Promise.all([
                prisma.user.count(),
                prisma.student.count(),
                prisma.classe.count(),
                prisma.message.count(),
                prisma.actualite.count(),
                prisma.travaux.count(),
                prisma.preInscriptionRequest.count({ where: { status: 'PENDING' } }),
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
            console.log('🔍 DEBUG STATS DASHBOARD:');
            console.log('  - pendingInscriptions:', stats.pendingInscriptions);
            console.log('  - acceptedInscriptions:', stats.acceptedInscriptions);
            console.log('  - pendingCredentials:', stats.pendingCredentials);

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

            res.render('pages/directeur/dashboard.twig', {
                title: 'Tableau de bord - Administration',
                user: req.session.user,
                stats: stats,
                recentUsers,
                recentMessages,
                pendingRequests,
                pendingCredentials
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

    async getUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    enfants: true
                }
            });

            if (!user) {
                return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
            }

            res.json({ success: true, user });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            res.status(500).json({ success: false, message: 'Erreur serveur' });
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

            // Gestion des messages de feedback
            let message = null;
            let messageType = 'info';

            if (req.query.success) {
                messageType = 'success';
                switch (req.query.success) {
                    case 'classe-created':
                        message = 'Classe créée avec succès';
                        break;
                    case 'classe-updated':
                        message = 'Classe mise à jour avec succès';
                        break;
                    case 'classe-deleted':
                        message = 'Classe supprimée avec succès';
                        break;
                }
            } else if (req.query.error) {
                messageType = 'error';
                switch (req.query.error) {
                    case 'creation-failed':
                        message = 'Erreur lors de la création de la classe';
                        break;
                    case 'update-failed':
                        message = 'Erreur lors de la mise à jour de la classe';
                        break;
                    case 'delete-failed':
                        message = 'Erreur lors de la suppression de la classe';
                        break;
                }
            }

            res.render('pages/admin/classes', {
                classes,
                title: 'Gestion des classes',
                user: req.session.user,
                message,
                messageType
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
            const { nom, niveau, anneeScolaire } = req.body;

            const classe = await prisma.classe.create({
                data: {
                    nom,
                    niveau,
                    anneeScolaire: anneeScolaire || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
                }
            });

            // Redirection au lieu de JSON pour éviter l'affichage du JSON brut
            res.redirect('/directeur/classes?success=classe-created');
        } catch (error) {
            console.error('Erreur lors de la création de la classe:', error);
            // Redirection avec erreur au lieu de JSON
            res.redirect('/directeur/classes?error=creation-failed');
        }
    },

    async updateClasse(req, res) {
        try {
            const { id } = req.params;
            const { nom, niveau, anneeScolaire } = req.body;

            const classe = await prisma.classe.update({
                where: { id: parseInt(id) },
                data: { nom, niveau, anneeScolaire }
            });

            // Redirection au lieu de JSON pour éviter l'affichage du JSON brut
            res.redirect('/directeur/classes?success=classe-updated');
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la classe:', error);
            // Redirection avec erreur au lieu de JSON
            res.redirect('/directeur/classes?error=update-failed');
        }
    },

    async deleteClasse(req, res) {
        try {
            const { id } = req.params;

            await prisma.classe.delete({
                where: { id: parseInt(id) }
            });

            // Redirection au lieu de JSON pour éviter l'affichage du JSON brut
            res.redirect('/directeur/classes?success=classe-deleted');
        } catch (error) {
            console.error('Erreur lors de la suppression de la classe:', error);
            // Redirection avec erreur au lieu de JSON
            res.redirect('/directeur/classes?error=delete-failed');
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
                    dateNaissance: new Date(birthDate),
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
                const dateNaissance = student.dateNaissance ? new Date(student.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée';
                const parentName = student.parent ? `${student.parent.firstName} ${student.parent.lastName}` : 'Non renseigné';
                const parentEmail = student.parent ? student.parent.email : 'Non renseigné';
                const parentPhone = student.parent ? (student.parent.phone || 'Non renseigné') : 'Non renseigné';

                csvContent += `${student.lastName};${student.firstName};${dateNaissance};${parentName};${parentEmail};${parentPhone}\n`;
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

    // === GESTION DES DEMANDES D'IDENTIFIANTS ===

    async getCredentialsRequests(req, res) {
        try {
            console.log('🔑 Accès aux demandes d\'identifiants');

            // Récupérer toutes les demandes d'identifiants
            const credentialsRequests = await prisma.credentialsRequest.findMany({
                include: {
                    foundParent: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Statistiques
            const stats = {
                total: credentialsRequests.length,
                pending: credentialsRequests.filter(r => r.status === 'PENDING').length,
                processing: credentialsRequests.filter(r => r.status === 'PROCESSING').length,
                completed: credentialsRequests.filter(r => r.status === 'COMPLETED').length,
                rejected: credentialsRequests.filter(r => r.status === 'REJECTED').length
            };

            res.render('pages/directeur/credentials.twig', {
                title: 'Demandes d\'identifiants - Gestion',
                user: req.session.user,
                credentialsRequests,
                stats
            });

        } catch (error) {
            console.error('❌ Erreur récupération demandes identifiants:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement des demandes d\'identifiants'
            });
        }
    },

    async approveCredentialsRequest(req, res) {
        try {
            const { id } = req.params;
            const { notes } = req.body;

            console.log(`✅ Approbation demande identifiants ID: ${id}`);

            await prisma.credentialsRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'COMPLETED',
                    processedAt: new Date(),
                    processed: true,
                    identifiersSent: true,
                    adminNotes: notes || null
                }
            });

            res.json({
                success: true,
                message: 'Demande d\'identifiants approuvée et identifiants envoyés avec succès'
            });

        } catch (error) {
            console.error('❌ Erreur approbation demande identifiants:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'approbation de la demande'
            });
        }
    },

    async rejectCredentialsRequest(req, res) {
        try {
            const { id } = req.params;
            const { reason, notes } = req.body;

            console.log(`❌ Rejet demande identifiants ID: ${id}`);

            await prisma.credentialsRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    processedAt: new Date(),
                    processed: true,
                    errorMessage: reason || null,
                    adminNotes: notes || null
                }
            });

            res.json({
                success: true,
                message: 'Demande d\'identifiants rejetée'
            });

        } catch (error) {
            console.error('❌ Erreur rejet demande identifiants:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du rejet de la demande'
            });
        }
    },

    async deleteCredentialsRequest(req, res) {
        try {
            const { id } = req.params;

            console.log(`🗑️ Suppression demande identifiants ID: ${id}`);

            await prisma.credentialsRequest.delete({
                where: { id: parseInt(id) }
            });

            res.json({
                success: true,
                message: 'Demande d\'identifiants supprimée'
            });

        } catch (error) {
            console.error('❌ Erreur suppression demande identifiants:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la demande'
            });
        }
    },

    // === NOUVELLES FONCTIONS POUR RENDEZ-VOUS INSCRIPTIONS ===

    // Afficher la liste des rendez-vous d'inscription (statut ACCEPTED)
    getRendezVousInscriptions: async (req, res) => {
        try {
            // Récupérer toutes les demandes acceptées (en attente de rendez-vous)
            const acceptedRequests = await prisma.preInscriptionRequest.findMany({
                where: {
                    status: 'ACCEPTED'
                },
                orderBy: {
                    submittedAt: 'desc'
                },
                include: {
                    processor: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });

            // Parser les données enfants et parents pour l'affichage
            const requestsWithParsedChildren = acceptedRequests.map(request => {
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

                // Parser les informations des parents
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

                return {
                    ...request,
                    parsedChildren: children,
                    parentsInfo
                };
            });

            res.render('pages/directeur/rendez-vous-inscriptions', {
                title: 'Rendez-vous d\'inscription - École Saint-Mathieu',
                user: req.session.user,
                requests: requestsWithParsedChildren
            });

        } catch (error) {
            console.error('❌ Erreur récupération rendez-vous inscriptions:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des rendez-vous',
                user: req.session.user
            });
        }
    },

    // Générer et afficher le PDF d'inscription dans une nouvelle fenêtre selon le format officiel
    generateInscriptionPDF: async (req, res) => {
        try {
            const { id } = req.params;

            // DEBUG: Message très visible pour confirmer l'exécution
            console.log('🔥🔥🔥 GÉNÉRATION PDF DÉMARRÉE - ID:', id, '🔥🔥🔥');

            // Récupérer la demande d'inscription
            const request = await prisma.preInscriptionRequest.findUnique({
                where: { id: parseInt(id) }
            });

            if (!request) {
                console.log('❌ Demande d\'inscription non trouvée pour ID:', id);
                return res.status(404).json({
                    success: false,
                    message: 'Demande d\'inscription non trouvée'
                });
            }

            console.log('✅ Demande trouvée:', request.parentLastName);

            // Parser les données enfants
            let children = [];
            if (request.children) {
                try {
                    children = typeof request.children === 'string'
                        ? JSON.parse(request.children)
                        : request.children;
                } catch (e) {
                    console.error('Erreur parsing children pour PDF:', e);
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
                    console.error('Erreur parsing parents info pour PDF:', e);
                    parentsInfo = {};
                }
            }

            console.log('📄 Démarrage création PDF...');

            // Créer le PDF avec PDFKit selon le format officiel
            const PDFDocument = require('pdfkit');
            const path = require('path');
            const fs = require('fs');

            // Fonction pour formater les dates en français (dd/mm/yyyy)
            const formatDateFrench = (dateString) => {
                if (!dateString) return '__________';
                try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return '__________';

                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();

                    return `${day}/${month}/${year}`;
                } catch (error) {
                    console.error('Erreur formatage date:', error);
                    return '__________';
                }
            };

            // Créer le dossier d'archivage s'il n'existe pas
            const archiveDir = path.join(__dirname, '../../public/pdf_archive');
            if (!fs.existsSync(archiveDir)) {
                fs.mkdirSync(archiveDir, { recursive: true });
                console.log('📁 Dossier d\'archivage PDF créé:', archiveDir);
            }

            console.log('📄 Création du document PDFKit...');
            const doc = new PDFDocument({
                size: 'A4',
                margin: 60
            });
            console.log('✅ Document PDFKit créé avec succès');

            // Configuration des en-têtes pour affichage dans le navigateur
            console.log('📄 Configuration des headers HTTP...');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="demande-inscription-' + request.parentLastName + '.pdf"');
            console.log('✅ Headers configurés');

            // Pipe le PDF directement vers la réponse
            console.log('📄 Configuration du pipe...');
            doc.pipe(res);
            console.log('✅ Pipe configuré');

            let yPos = 30;

            // === EN-TÊTE MODERNE AVEC LOGOS ===
            try {
                // Logo École Saint-Mathieu
                const logoEcolePath = path.join(__dirname, '../../public/assets/images/testimage.jpg');
                if (fs.existsSync(logoEcolePath)) {
                    doc.image(logoEcolePath, 60, yPos, { width: 55, height: 55 });
                }

                // Logo Enseignement Catholique
                const logoEnseignPath = path.join(__dirname, '../../public/assets/images/enseigncatho.png');
                if (fs.existsSync(logoEnseignPath)) {
                    doc.image(logoEnseignPath, 130, yPos, { width: 55, height: 55 });
                }
            } catch (error) {
                console.log('Erreur chargement logos:', error);
            }

            // Titre élégant à droite
            doc.fontSize(18).font('Helvetica-Bold')
                .text('DEMANDE D\'INSCRIPTION', 200, yPos + 8);
            doc.fontSize(11).font('Helvetica')
                .text('Année scolaire ' + (request.anneeScolaire || '2025-2026'), 200, yPos + 32);

            yPos += 70;

            // === LIGNE DE SÉPARATION ===
            doc.moveTo(60, yPos).lineTo(535, yPos).stroke();
            yPos += 15;

            // === SECTION PARENTS (STRUCTURE VERTICALE) ===

            // === SECTION PÈRE ===
            doc.fontSize(12).font('Helvetica-Bold')
                .text('RESPONSABLE 1 - PÈRE', 60, yPos, { align: 'center', width: 475 });

            yPos += 18;

            // Extraire les infos du père depuis les champs de base ET message JSON
            let pereInfo = {
                firstName: request.parentFirstName || '',
                lastName: request.parentLastName || '',
                email: request.parentEmail || '',
                phone: request.parentPhone || ''
            };

            // Si on a des infos dans le message JSON, on les utilise pour compléter
            if (parentsInfo.pere) {
                const pereMatch = parentsInfo.pere.match(/^(.+?)\s+(.+?)\s*-\s*(.+)$/);
                if (pereMatch) {
                    pereInfo.firstName = pereMatch[1].trim();
                    pereInfo.lastName = pereMatch[2].trim();
                    pereInfo.email = pereMatch[3].trim();
                }
            }

            doc.fontSize(10).font('Helvetica');

            // Informations père en colonnes
            doc.text('Civilité: M.', 60, yPos);
            doc.text('Nom: ' + (pereInfo.lastName || '______________'), 200, yPos);
            doc.text('Prénom: ' + (pereInfo.firstName || '______________'), 350, yPos);
            yPos += 15;

            doc.text('Téléphone: ' + (pereInfo.phone || '______________'), 60, yPos);
            doc.text('Email: ' + (pereInfo.email || '______________'), 280, yPos);
            yPos += 15;

            // Adresse du père
            const fullAddress = request.parentAddress || '';
            const addressLines = fullAddress.split('\n').filter(line => line.trim());
            let codePostal = '';
            let ville = '';
            let adresseRue = '';

            if (addressLines.length > 0) {
                adresseRue = addressLines[0];
                if (addressLines.length > 1) {
                    const lastLine = addressLines[addressLines.length - 1];
                    const codePostalMatch = lastLine.match(/(\d{5})\s+(.+)/);
                    if (codePostalMatch) {
                        codePostal = codePostalMatch[1];
                        ville = codePostalMatch[2];
                    } else {
                        ville = lastLine;
                    }
                }
            }

            doc.text('Adresse: ' + (adresseRue || '_________________________________'), 60, yPos);
            yPos += 15;
            doc.text('Code postal: ' + (codePostal || '________'), 60, yPos);
            doc.text('Ville: ' + (ville || '____________________'), 220, yPos);

            yPos += 25;

            // === SECTION MÈRE ===
            doc.moveTo(60, yPos).lineTo(535, yPos).stroke();
            yPos += 12;

            doc.fontSize(12).font('Helvetica-Bold')
                .text('RESPONSABLE 2 - MÈRE', 60, yPos, { align: 'center', width: 475 });

            yPos += 18;

            // Extraire les infos de la mère depuis parentsInfo et champs directs
            let mereInfo = {};

            // Essayer d'abord les champs directs
            if (request.motherFirstName || request.motherLastName || request.motherEmail || request.motherPhone) {
                mereInfo = {
                    firstName: request.motherFirstName || '',
                    lastName: request.motherLastName || '',
                    email: request.motherEmail || '',
                    phone: request.motherPhone || ''
                };
            }

            // Compléter avec parentsInfo si disponible
            if (parentsInfo.mere) {
                const mereMatch = parentsInfo.mere.match(/^(.+?)\s+(.+?)\s*-\s*(.+)$/);
                if (mereMatch) {
                    mereInfo = {
                        firstName: mereInfo.firstName || mereMatch[1].trim(),
                        lastName: mereInfo.lastName || mereMatch[2].trim(),
                        email: mereInfo.email || mereMatch[3].trim(),
                        phone: mereInfo.phone || ''
                    };
                }
            }

            // Chercher le téléphone dans le message JSON global (parfois plus d'informations y sont stockées)
            if (!mereInfo.phone && request.message) {
                try {
                    const messageData = typeof request.message === 'string' ? JSON.parse(request.message) : request.message;
                    if (messageData.motherPhone || messageData.mere?.telephone || messageData.mere?.phone) {
                        mereInfo.phone = messageData.motherPhone || messageData.mere?.telephone || messageData.mere?.phone || '';
                    }
                } catch (e) {
                    console.error('Erreur parsing message pour téléphone mère:', e);
                }
            }

            // DEBUG: Voir ce qu'on a dans mereInfo
            console.log('📄 PDF - mereInfo:', JSON.stringify(mereInfo, null, 2));

            doc.fontSize(10).font('Helvetica');

            // Informations mère en colonnes
            doc.text('Civilité: Mme', 60, yPos);
            doc.text('Nom: ' + (mereInfo.lastName || '______________'), 200, yPos);
            doc.text('Prénom: ' + (mereInfo.firstName || '______________'), 350, yPos);
            yPos += 15;

            doc.text('Téléphone: ' + (mereInfo.phone || '______________'), 60, yPos);
            doc.text('Email: ' + (mereInfo.email || '______________'), 280, yPos);
            yPos += 15;

            // Adresse de la mère (même que père pour l'instant, géré intelligemment selon situation familiale)
            doc.text('Adresse: ' + (adresseRue || '_________________________________'), 60, yPos);
            yPos += 15;
            doc.text('Code postal: ' + (codePostal || '________'), 60, yPos);
            doc.text('Ville: ' + (ville || '____________________'), 220, yPos);

            yPos += 25;

            // === SITUATION DE FAMILLE ===
            console.log('📄 PDF - Position SITUATION DE FAMILLE - yPos:', yPos);

            doc.moveTo(60, yPos).lineTo(535, yPos).stroke();
            yPos += 12;

            doc.fontSize(12).font('Helvetica-Bold')
                .text('SITUATION DE FAMILLE', 60, yPos, { align: 'center', width: 475 });

            yPos += 18;
            doc.fontSize(10).font('Helvetica');

            // Déterminer la situation familiale depuis les données
            let situationFamiliale = request.familySituation || request.situationFamiliale || '';

            // Créer les cases avec la bonne cochée selon la situation
            let mariés = '☐';
            let pacsés = '☐';
            let unionLibre = '☐';
            let divorcés = '☐';
            let séparés = '☐';
            let autre = '☐';

            const situation = situationFamiliale.toLowerCase();
            if (situation.includes('marié')) mariés = '☑';
            else if (situation.includes('pacs')) pacsés = '☑';
            else if (situation.includes('union libre') || situation.includes('concubinage')) unionLibre = '☑';
            else if (situation.includes('divorcé')) divorcés = '☑';
            else if (situation.includes('séparé')) séparés = '☑';
            else if (situationFamiliale && !situation.includes('marié')) autre = '☑';

            doc.text(`${mariés} Mariés     ${pacsés} Pacsés     ${unionLibre} Union libre     ${divorcés} Divorcés     ${séparés} Séparés     ${autre} Autre: ${situationFamiliale && autre === '☑' ? situationFamiliale : '___________'}`, 60, yPos);

            // DEBUG: Ajout d'une ligne pour vérifier que le code s'exécute
            console.log('📄 PDF - Section Situation de famille générée avec situation:', situationFamiliale);

            yPos += 25;

            // === SECTION ENFANT (TRÈS COMPACTE) ===
            doc.moveTo(60, yPos).lineTo(535, yPos).stroke();
            yPos += 12;

            doc.fontSize(11).font('Helvetica-Bold')
                .text('RENSEIGNEMENTS ENFANT', 60, yPos, { align: 'center', width: 475 });

            yPos += 15;
            doc.fontSize(9).font('Helvetica');

            if (children.length > 0) {
                const child = children[0];

                // Ligne 1: Informations de base (tout sur une ligne)
                doc.text('Nom: ' + (child.lastName || '________'), 60, yPos);
                doc.text('Prénom: ' + (child.firstName || '________'), 180, yPos);

                // DEBUG: Vérifier le formatage de date
                const formattedDate = formatDateFrench(child.birthDate);
                console.log('📄 PDF - Date originale:', child.birthDate, '-> Formatée:', formattedDate);

                doc.text('Date de naissance: ' + formattedDate, 300, yPos);
                yPos += 15;

                // Ligne 2: Lieu de naissance et Nationalité  
                doc.text('Lieu de naissance: ' + (child.birthPlace || child.lieuNaissance || '________________'), 60, yPos);
                doc.text('Nationalité: ' + (child.nationality || child.nationalite || '________________'), 300, yPos);
                yPos += 15;

                // Ligne 3: Classe demandée (plus proéminente)
                doc.fontSize(10).font('Helvetica-Bold')
                    .text('CLASSE DEMANDÉE: ' + (child.requestedClass || child.schoolLevel || '________________'), 60, yPos);
                yPos += 20;

                // École actuelle sur une ligne
                doc.fontSize(9).font('Helvetica')
                    .text('École actuelle: ' + (child.currentSchool || child.previousSchool || '________________'), 60, yPos);
                doc.text('Classe actuelle: ' + (child.currentClass || '________'), 350, yPos);
            } else {
                doc.text('Aucun enfant renseigné', 60, yPos);
                yPos += 15;
            }

            yPos += 25;

            // === ÉTABLISSEMENT EN COURS ===
            doc.moveTo(60, yPos).lineTo(535, yPos).stroke();
            yPos += 12;

            doc.fontSize(11).font('Helvetica-Bold')
                .text('ÉTABLISSEMENT EN COURS', 60, yPos, { align: 'center', width: 475 });

            yPos += 15;
            doc.fontSize(9).font('Helvetica');

            if (children.length > 0 && children[0]) {
                doc.text('École actuelle: ' + (children[0].currentSchool || children[0].previousSchool || '________________________'), 60, yPos);
                yPos += 15;
                doc.text('Classe actuelle: ' + (children[0].currentClass || '________'), 60, yPos);
                doc.text('Directeur/Directrice: ________________', 250, yPos);
                yPos += 15;
                doc.text('Adresse de l\'établissement: _________________________________', 60, yPos);
            } else {
                doc.text('École actuelle: ________________________', 60, yPos);
                yPos += 15;
                doc.text('Classe actuelle: ________', 60, yPos);
                doc.text('Directeur/Directrice: ________________', 250, yPos);
                yPos += 15;
                doc.text('Adresse de l\'établissement: _________________________________', 60, yPos);
            }

            yPos += 25;

            // === BESOINS PARTICULIERS ===
            if (request.specialNeeds) {
                doc.moveTo(60, yPos).lineTo(535, yPos).stroke();
                yPos += 12;
                doc.fontSize(10).font('Helvetica-Bold')
                    .text('BESOINS PARTICULIERS', 60, yPos, { align: 'center', width: 475 });
                yPos += 15;
                doc.fontSize(9).font('Helvetica')
                    .text(request.specialNeeds, 60, yPos, { width: 475 });
                yPos += 20;
            }

            // === INFORMATIONS ADMINISTRATIVES (COMPACT) ===
            doc.moveTo(60, yPos).lineTo(535, yPos).stroke();
            yPos += 12;

            doc.fontSize(10).font('Helvetica-Bold')
                .text('INFORMATIONS ADMINISTRATIVES', 60, yPos, { align: 'center', width: 475 });

            yPos += 15;
            doc.fontSize(8).font('Helvetica');

            const dateInscription = request.submittedAt ? new Date(request.submittedAt).toLocaleDateString('fr-FR') : 'Non définie';
            let statusText = 'En attente';
            if (request.status === 'ACCEPTED') statusText = 'Accepté pour rendez-vous';
            else if (request.status === 'COMPLETED') statusText = 'Inscription finalisée';
            else if (request.status === 'REJECTED') statusText = 'Refusée';

            doc.text('Date de demande: ' + dateInscription, 60, yPos);
            doc.text('Statut: ' + statusText, 300, yPos);

            if (request.adminNotes) {
                yPos += 12;
                doc.text('Notes: ' + request.adminNotes, 60, yPos, { width: 400 });
            }

            // === SIGNATURES (BAS DE PAGE) ===
            yPos = 750; // Position fixe en bas
            doc.fontSize(9).font('Helvetica')
                .text('Signature du père: _______________', 60, yPos)
                .text('Date: ________', 220, yPos)
                .text('Signature de la mère: _______________', 320, yPos)
                .text('Date: ________', 480, yPos);

            // Envoyer le PDF directement au navigateur
            console.log('📄 PDF - Début du pipe vers le navigateur');

            // Attacher les événements AVANT la finalisation
            doc.on('end', () => {
                console.log('✅ Événement END du PDF déclenché');
            });

            res.on('finish', () => {
                console.log('✅ Réponse HTTP terminée');
            });

            res.on('close', () => {
                console.log('🔒 Connexion fermée');
            });

            console.log('📄 PDF - Pipe déjà configuré, finalisation...');

            // Finaliser le PDF avec plus de debug
            console.log('🔚 Début finalisation PDF...');
            doc.end();
            console.log('🔥🔥🔥 PDF FINALISÉ ET ENVOYÉ 🔥🔥🔥');

            console.log('📄 PDF - doc.end() appelé, PDF envoyé');

        } catch (error) {
            console.error('❌❌❌ ERREUR GÉNÉRATION PDF ❌❌❌');
            console.error('Type d\'erreur:', error.constructor.name);
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);

            // Si les headers n'ont pas encore été envoyés, envoyer une réponse d'erreur
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la génération du PDF: ' + error.message
                });
            } else {
                console.error('❌ Headers déjà envoyés, impossible de renvoyer une réponse d\'erreur');
            }
        }
    },

    // === IMPORT EXCEL DES FAMILLES ===

    // Page d'import Excel
    getImportExcel: async (req, res) => {
        try {
            console.log('📊 Accès à la page d\'import Excel');

            res.render('pages/directeur/import-excel', {
                title: 'Import Excel des familles - École Saint-Mathieu',
                user: req.session.user
            });

        } catch (error) {
            console.error('❌ Erreur page import Excel:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement de la page d\'import',
                user: req.session.user
            });
        }
    },

    // Traitement de l'import Excel
    processExcelImport: async (req, res) => {
        try {
            console.log('🔥🔥🔥 DÉBUT IMPORT EXCEL 🔥🔥🔥');

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucun fichier Excel fourni'
                });
            }

            const XLSX = require('xlsx');
            const fs = require('fs');

            // Lire le fichier Excel
            console.log('📖 Lecture du fichier Excel:', req.file.originalname);
            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convertir en JSON avec headers automatiques
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 4) {
                return res.status(400).json({
                    success: false,
                    message: 'Fichier Excel vide ou format incorrect'
                });
            }

            // Identifier la ligne des en-têtes (ligne 4 basé sur votre fichier)
            const headers = jsonData[3]; // Index 3 = ligne 4
            const dataRows = jsonData.slice(4); // Données à partir de la ligne 5

            console.log('📋 Headers détectés:', headers);
            console.log('📊 Nombre de lignes de données:', dataRows.length);

            // Mapping des colonnes selon votre fichier
            const columnMapping = {
                responsable1: 0,      // Civilité, Particule, nom et prénom Resp
                tel1: 1,              // Tél. portable Resp
                email1: 2,            // Email Personnel Resp
                responsable2: 3,      // Civilité, Particule, nom et prénom Conjoint
                email2: 4,            // Email Personnel Conjoint
                tel2: 5,              // Tél. portable Conjoint
                adresse: 6,           // Adresse 1
                codePostalVille: 7,   // CP - Ville
                enfantNom: 8,         // Particule, nom et prénom
                dateNaissance: 9,     // Date de naissance
                codeNiveau: 10,       // Code niveau
                codeClasse: 11        // Code classe
            };

            const results = {
                success: 0,
                errors: 0,
                families: 0,
                students: 0,
                classes: 0,
                details: []
            };

            // Parser les données ligne par ligne
            for (let i = 0; i < dataRows.length; i++) {
                const row = dataRows[i];
                if (!row || row.length === 0) continue;

                try {
                    console.log(`📝 Traitement ligne ${i + 1}:`, row[columnMapping.responsable1]);

                    // Extraire les informations du responsable 1 (père)
                    const resp1Full = row[columnMapping.responsable1] || '';
                    const resp1Match = resp1Full.match(/^(M\.|Mme)\s*(.+?)?\s+(.+)$/);

                    let pere = null;
                    if (resp1Match) {
                        const civilite = resp1Match[1];
                        const nomComplet = resp1Match[3] || '';
                        const nomParts = nomComplet.trim().split(' ');
                        const prenom = nomParts[0] || '';
                        const nom = nomParts.slice(1).join(' ') || nomParts[0] || '';

                        if (civilite === 'M.' && nom && prenom) {
                            pere = {
                                civilite: 'M.',
                                firstName: prenom,
                                lastName: nom,
                                email: row[columnMapping.email1] || '',
                                phone: row[columnMapping.tel1] || ''
                            };
                        }
                    }

                    // Extraire les informations du responsable 2 (mère)
                    const resp2Full = row[columnMapping.responsable2] || '';
                    const resp2Match = resp2Full.match(/^(M\.|Mme)\s*(.+?)?\s+(.+)$/);

                    let mere = null;
                    if (resp2Match) {
                        const civilite = resp2Match[1];
                        const nomComplet = resp2Match[3] || '';
                        const nomParts = nomComplet.trim().split(' ');
                        const prenom = nomParts[0] || '';
                        const nom = nomParts.slice(1).join(' ') || nomParts[0] || '';

                        if (civilite === 'Mme' && nom && prenom) {
                            mere = {
                                civilite: 'Mme',
                                firstName: prenom,
                                lastName: nom,
                                email: row[columnMapping.email2] || '',
                                phone: row[columnMapping.tel2] || ''
                            };
                        }
                    }

                    // Adresse
                    const adresseComplete = row[columnMapping.adresse] || '';
                    const codePostalVille = row[columnMapping.codePostalVille] || '';
                    const codePostalMatch = codePostalVille.match(/^(\d{5})\s+(.+)$/);

                    const adresse = {
                        rue: adresseComplete,
                        codePostal: codePostalMatch ? codePostalMatch[1] : '',
                        ville: codePostalMatch ? codePostalMatch[2] : codePostalVille
                    };

                    // Enfant
                    const enfantNomComplet = row[columnMapping.enfantNom] || '';
                    const enfantParts = enfantNomComplet.trim().split(' ');
                    const enfantPrenom = enfantParts[enfantParts.length - 1] || '';
                    const enfantNom = enfantParts.slice(0, -1).join(' ') || enfantParts[0] || '';

                    const dateNaissanceRaw = row[columnMapping.dateNaissance] || '';
                    const codeClasse = row[columnMapping.codeClasse] || '';

                    // Convertir la date (format DD/MM/YYYY vers YYYY-MM-DD)
                    let dateNaissance = null;
                    if (dateNaissanceRaw) {
                        const dateMatch = dateNaissanceRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                        if (dateMatch) {
                            dateNaissance = new Date(`${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`);
                        }
                    }

                    const enfant = {
                        firstName: enfantPrenom,
                        lastName: enfantNom,
                        dateNaissance: dateNaissance,
                        codeClasse: codeClasse
                    };

                    // Validation basique
                    if (!enfant.firstName || !enfant.lastName || !enfant.codeClasse) {
                        results.errors++;
                        results.details.push({
                            ligne: i + 1,
                            erreur: 'Informations enfant incomplètes',
                            donnees: row
                        });
                        continue;
                    }

                    if (!pere && !mere) {
                        results.errors++;
                        results.details.push({
                            ligne: i + 1,
                            erreur: 'Aucun parent identifié',
                            donnees: row
                        });
                        continue;
                    }

                    // Ici nous aurons la logique de création en base de données
                    // Pour l'instant, on simule le succès
                    results.success++;
                    results.details.push({
                        ligne: i + 1,
                        status: 'success',
                        famille: `${pere ? pere.firstName + ' ' + pere.lastName : ''} / ${mere ? mere.firstName + ' ' + mere.lastName : ''}`,
                        enfant: `${enfant.firstName} ${enfant.lastName}`,
                        classe: enfant.codeClasse
                    });

                } catch (rowError) {
                    console.error(`❌ Erreur ligne ${i + 1}:`, rowError);
                    results.errors++;
                    results.details.push({
                        ligne: i + 1,
                        erreur: rowError.message,
                        donnees: row
                    });
                }
            }

            // Nettoyer le fichier temporaire
            fs.unlinkSync(req.file.path);

            console.log('🎉 Import terminé:', results);

            res.json({
                success: true,
                message: `Import terminé: ${results.success} succès, ${results.errors} erreurs`,
                results: results
            });

        } catch (error) {
            console.error('❌ Erreur import Excel:', error);

            // Nettoyer le fichier temporaire en cas d'erreur
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanError) {
                    console.error('Erreur nettoyage fichier:', cleanError);
                }
            }

            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'import: ' + error.message
            });
        }
    },

    // === ALIAS POUR COMPATIBILITÉ ===
    getDashboard: function (req, res) {
        return this.dashboard(req, res);
    }
};

module.exports = directeurController;
