const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const adminController = {
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
                title: 'Gestion des utilisateurs'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des utilisateurs'
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
                user: { ...user, password: undefined }
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
                user: { ...user, password: undefined }
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

    async getClassesManagement(req, res) {
        try {
            const classes = await prisma.classe.findMany({
                include: {
                    eleves: true,
                    _count: {
                        select: {
                            eleves: true,
                            horaires: true
                        }
                    }
                },
                orderBy: { nom: 'asc' }
            });

            const enseignants = await prisma.user.findMany({
                where: { role: 'ENSEIGNANT' },
                select: { id: true, firstName: true, lastName: true }
            });

            res.render('pages/admin/classes', {
                classes,
                enseignants,
                title: 'Gestion des classes'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des classes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des classes'
            });
        }
    },

    async createClasse(req, res) {
        try {
            const { nom, niveau, enseignantId, anneeScolaire } = req.body;

            const classe = await prisma.classe.create({
                data: {
                    nom,
                    niveau,
                    enseignantId: enseignantId ? parseInt(enseignantId) : null,
                    anneeScolaire
                }
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
            const { nom, niveau, enseignantId, anneeScolaire } = req.body;

            const classe = await prisma.classe.update({
                where: { id: parseInt(id) },
                data: {
                    nom,
                    niveau,
                    enseignantId: enseignantId ? parseInt(enseignantId) : null,
                    anneeScolaire
                }
            });

            console.log('✅ Classe mise à jour:', classe.nom);
            res.redirect('/admin/classes?success=' + encodeURIComponent('Classe mise à jour avec succès'));
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de la classe:', error);
            res.redirect('/admin/classes?error=' + encodeURIComponent('Erreur lors de la mise à jour de la classe'));
        }
    },

    async deleteClasse(req, res) {
        try {
            const { id } = req.params;

            // Vérifier s'il y a des élèves dans la classe
            const studentCount = await prisma.student.count({
                where: { classeId: parseInt(id) }
            });

            if (studentCount > 0) {
                return res.redirect('/admin/classes?error=' + encodeURIComponent(`Impossible de supprimer cette classe, ${studentCount} élève(s) y sont encore assignés`));
            }

            const classe = await prisma.classe.delete({
                where: { id: parseInt(id) }
            });

            console.log('🗑️ Classe supprimée:', classe.nom);
            res.redirect('/admin/classes?success=' + encodeURIComponent('Classe supprimée avec succès'));
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de la classe:', error);
            res.redirect('/admin/classes?error=' + encodeURIComponent('Erreur lors de la suppression de la classe'));
        }
    },

    async getStudentsManagement(req, res) {
        try {
            const students = await prisma.student.findMany({
                include: {
                    parent: {
                        select: { id: true, firstName: true, lastName: true, email: true }
                    },
                    classe: {
                        select: { id: true, nom: true, niveau: true }
                    },
                    _count: {
                        select: {
                            notes: true,
                            absences: true
                        }
                    }
                },
                orderBy: { lastName: 'asc' }
            });

            const parents = await prisma.user.findMany({
                where: { role: 'PARENT' },
                select: { id: true, firstName: true, lastName: true }
            });

            const classes = await prisma.classe.findMany({
                select: { id: true, nom: true, niveau: true }
            });

            res.render('pages/admin/students', {
                students,
                parents,
                classes,
                title: 'Gestion des élèves'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des élèves:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des élèves'
            });
        }
    },

    async createStudent(req, res) {
        try {
            const { firstName, lastName, dateNaissance, classeId, parentId } = req.body;

            // Créer l'étudiant sans parentId direct
            const student = await prisma.student.create({
                data: {
                    firstName,
                    lastName,
                    dateNaissance: new Date(dateNaissance),
                    classeId: parseInt(classeId)
                }
            });

            // Créer la relation parent-étudiant
            if (parentId) {
                await prisma.parentStudent.create({
                    data: {
                        parentId: parseInt(parentId),
                        studentId: student.id
                    }
                });
            }

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
            const { firstName, lastName, dateNaissance, classeId, parentId } = req.body;

            // Mettre à jour l'étudiant sans parentId direct
            const student = await prisma.student.update({
                where: { id: parseInt(id) },
                data: {
                    firstName,
                    lastName,
                    dateNaissance: new Date(dateNaissance),
                    classeId: parseInt(classeId)
                }
            });

            // Mettre à jour la relation parent-étudiant
            if (parentId) {
                // Supprimer les anciennes relations
                await prisma.parentStudent.deleteMany({
                    where: { studentId: parseInt(id) }
                });

                // Créer la nouvelle relation
                await prisma.parentStudent.create({
                    data: {
                        parentId: parseInt(parentId),
                        studentId: parseInt(id)
                    }
                });
            }

            console.log('✅ Élève mis à jour:', `${student.firstName} ${student.lastName}`);
            res.redirect('/admin/students?success=' + encodeURIComponent('Élève mis à jour avec succès'));
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de l\'élève:', error);
            res.redirect('/admin/students?error=' + encodeURIComponent('Erreur lors de la mise à jour de l\'élève'));
        }
    },

    async deleteStudent(req, res) {
        try {
            const { id } = req.params;

            // Supprimer d'abord les notes et absences liées
            await prisma.note.deleteMany({
                where: { eleveId: parseInt(id) }
            });

            await prisma.absence.deleteMany({
                where: { eleveId: parseInt(id) }
            });

            // Supprimer l'élève
            const student = await prisma.student.delete({
                where: { id: parseInt(id) }
            });

            console.log('🗑️ Élève supprimé:', `${student.firstName} ${student.lastName}`);
            res.redirect('/admin/students?success=' + encodeURIComponent('Élève supprimé avec succès'));
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'élève:', error);
            res.redirect('/admin/students?error=' + encodeURIComponent('Erreur lors de la suppression de l\'élève'));
        }
    },

    async getDashboard(req, res) {
        try {
            const stats = {
                totalUsers: await prisma.user.count(),
                totalStudents: await prisma.student.count(),
                totalClasses: await prisma.classe.count(),
                totalMessages: await prisma.message.count(),
                totalActualites: await prisma.actualite.count(),
                pendingInscriptions: await prisma.inscriptionRequest.count({
                    where: { status: 'PENDING' }
                })
            };

            const recentUsers = await prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, firstName: true, lastName: true, role: true, createdAt: true }
            });

            const recentMessages = await prisma.contact.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                where: { traite: false }
            });

            res.render('pages/admin/dashboard', {
                stats,
                recentUsers,
                recentMessages,
                title: 'Tableau de bord administrateur'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du dashboard:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération du tableau de bord'
            });
        }
    },

    async getContactMessages(req, res) {
        try {
            const messages = await prisma.contact.findMany({
                orderBy: { createdAt: 'desc' }
            });

            res.render('pages/admin/contact-messages', {
                title: 'Messages de contact',
                messages,
                user: req.session.user
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des messages:', error);
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
            console.error('❌ Erreur lors de la mise à jour du message:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du message'
            });
        }
    },

    async getReports(req, res) {
        try {
            // Statistiques générales
            const stats = {
                totalUsers: await prisma.user.count(),
                totalStudents: await prisma.student.count(),
                totalClasses: await prisma.classe.count(),
                totalMessages: await prisma.contact.count(),
                totalActualites: await prisma.actualite.count(),
                pendingInscriptions: await prisma.inscriptionRequest.count({
                    where: { status: 'PENDING' }
                }),
                approvedInscriptions: await prisma.inscriptionRequest.count({
                    where: { status: 'APPROVED' }
                }),
                rejectedInscriptions: await prisma.inscriptionRequest.count({
                    where: { status: 'REJECTED' }
                })
            };

            // Utilisateurs par rôle
            const usersByRole = await prisma.user.groupBy({
                by: ['role'],
                _count: {
                    id: true
                }
            });

            // Élèves par classe
            const studentsByClass = await prisma.classe.findMany({
                include: {
                    _count: {
                        select: {
                            eleves: true
                        }
                    }
                }
            });

            // Messages récents non traités
            const pendingMessages = await prisma.contact.count({
                where: { traite: false }
            });

            res.render('pages/admin/reports', {
                title: 'Rapports et statistiques',
                stats,
                usersByRole,
                studentsByClass,
                pendingMessages,
                user: req.session.user
            });
        } catch (error) {
            console.error('❌ Erreur lors de la génération des rapports:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la génération des rapports',
                user: req.session.user
            });
        }
    },

    async getSettings(req, res) {
        try {
            // Récupérer les paramètres système (ou valeurs par défaut)
            const settings = {
                schoolName: 'École Saint-Mathieu',
                schoolAddress: '123 Rue de l\'École, 75000 Paris',
                schoolPhone: '01.23.45.67.89',
                schoolEmail: 'contact@ecole-saint-mathieu.fr',
                currentYear: '2024-2025',
                maxStudentsPerClass: 25,
                enableNotifications: true,
                enablePublicRegistration: true
            };

            res.render('pages/admin/settings', {
                title: 'Paramètres système',
                settings,
                user: req.session.user
            });
        } catch (error) {
            console.error('❌ Erreur lors du chargement des paramètres:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement des paramètres',
                user: req.session.user
            });
        }
    },

    async updateSettings(req, res) {
        try {
            const settings = req.body;

            // Ici vous pouvez sauvegarder les paramètres dans la base de données
            // ou dans un fichier de configuration selon votre architecture

            console.log('✅ Paramètres mis à jour:', settings);

            res.redirect('/admin/settings?success=' + encodeURIComponent('Paramètres mis à jour avec succès'));
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour des paramètres:', error);
            res.redirect('/admin/settings?error=' + encodeURIComponent('Erreur lors de la mise à jour des paramètres'));
        }
    }
};

module.exports = adminController;
