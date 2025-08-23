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

            const student = await prisma.student.create({
                data: {
                    firstName,
                    lastName,
                    dateNaissance: new Date(dateNaissance),
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
    }
};

module.exports = adminController;
