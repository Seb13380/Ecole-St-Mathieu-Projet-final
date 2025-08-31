const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const userManagementController = {
    // === GESTION DES PARENTS ===

    async getParentsManagement(req, res) {
        try {
            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).render('pages/error', {
                    message: 'Accès refusé',
                    user: req.session.user
                });
            }

            const parents = await prisma.user.findMany({
                where: { role: 'PARENT' },
                include: {
                    enfants: true,
                    _count: {
                        select: {
                            enfants: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.render('pages/admin/parents-management', {
                parents,
                title: 'Gestion des Parents',
                user: req.session.user
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des parents:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des parents',
                user: req.session.user
            });
        }
    },

    async createParent(req, res) {
        try {
            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }

            const { firstName, lastName, email, phone, adress, password } = req.body;

            // Vérifier si l'email existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Un utilisateur avec cet email existe déjà'
                });
            }

            // Hacher le mot de passe
            const hashedPassword = await bcrypt.hash(password || 'Parent2025!', 10);

            const parent = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    phone: phone || null,
                    adress: adress || null,
                    role: 'PARENT'
                }
            });

            console.log('✅ Parent créé:', parent.email);
            res.json({
                success: true,
                message: 'Parent créé avec succès',
                parent: {
                    id: parent.id,
                    firstName: parent.firstName,
                    lastName: parent.lastName,
                    email: parent.email,
                    phone: parent.phone,
                    adress: parent.adress
                }
            });
        } catch (error) {
            console.error('❌ Erreur lors de la création du parent:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du parent'
            });
        }
    },

    async updateParent(req, res) {
        try {
            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }

            const { id } = req.params;
            const { firstName, lastName, email, phone, adress, password } = req.body;

            // Préparer les données de mise à jour
            const updateData = {
                firstName,
                lastName,
                email,
                phone: phone || null,
                adress: adress || null
            };

            // Si un nouveau mot de passe est fourni, le hacher
            if (password && password.trim()) {
                updateData.password = await bcrypt.hash(password, 10);
            }

            const parent = await prisma.user.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            console.log('✅ Parent mis à jour:', parent.email);
            res.json({
                success: true,
                message: 'Parent mis à jour avec succès',
                parent: {
                    id: parent.id,
                    firstName: parent.firstName,
                    lastName: parent.lastName,
                    email: parent.email,
                    phone: parent.phone,
                    adress: parent.adress
                }
            });
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour du parent:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du parent'
            });
        }
    },

    async deleteParent(req, res) {
        try {
            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }

            const { id } = req.params;

            // Vérifier si le parent a des enfants
            const parent = await prisma.user.findUnique({
                where: { id: parseInt(id) },
                include: { enfants: true }
            });

            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent non trouvé'
                });
            }

            if (parent.enfants.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible de supprimer un parent qui a des enfants inscrits'
                });
            }

            await prisma.user.delete({
                where: { id: parseInt(id) }
            });

            console.log('✅ Parent supprimé:', parent.email);
            res.json({
                success: true,
                message: 'Parent supprimé avec succès'
            });
        } catch (error) {
            console.error('❌ Erreur lors de la suppression du parent:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du parent'
            });
        }
    },

    // === GESTION DES ÉLÈVES ===

    async getStudentsManagement(req, res) {
        try {
            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).render('pages/error', {
                    message: 'Accès refusé',
                    user: req.session.user
                });
            }

            const [eleves, parents, classes] = await Promise.all([
                prisma.eleve.findMany({
                    include: {
                        parent: {
                            select: { firstName: true, lastName: true, email: true }
                        },
                        classe: {
                            select: { nom: true, niveau: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.findMany({
                    where: { role: 'PARENT' },
                    select: { id: true, firstName: true, lastName: true, email: true }
                }),
                prisma.classe.findMany({
                    select: { id: true, nom: true, niveau: true }
                })
            ]);

            res.render('pages/admin/students-management', {
                eleves,
                parents,
                classes,
                title: 'Gestion des Élèves',
                user: req.session.user
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des élèves:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des élèves',
                user: req.session.user
            });
        }
    },

    async createStudent(req, res) {
        try {
            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }

            const { firstName, lastName, birthDate, parentId, classeId } = req.body;

            const eleve = await prisma.eleve.create({
                data: {
                    firstName,
                    lastName,
                    birthDate: new Date(birthDate),
                    parentId: parseInt(parentId),
                    classeId: classeId ? parseInt(classeId) : null
                },
                include: {
                    parent: {
                        select: { firstName: true, lastName: true, email: true }
                    },
                    classe: {
                        select: { nom: true, niveau: true }
                    }
                }
            });

            console.log('✅ Élève créé:', `${eleve.firstName} ${eleve.lastName}`);
            res.json({
                success: true,
                message: 'Élève créé avec succès',
                eleve
            });
        } catch (error) {
            console.error('❌ Erreur lors de la création de l\'élève:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de l\'élève'
            });
        }
    },

    async updateStudent(req, res) {
        try {
            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }

            const { id } = req.params;
            const { firstName, lastName, birthDate, parentId, classeId } = req.body;

            const eleve = await prisma.eleve.update({
                where: { id: parseInt(id) },
                data: {
                    firstName,
                    lastName,
                    birthDate: new Date(birthDate),
                    parentId: parseInt(parentId),
                    classeId: classeId ? parseInt(classeId) : null
                },
                include: {
                    parent: {
                        select: { firstName: true, lastName: true, email: true }
                    },
                    classe: {
                        select: { nom: true, niveau: true }
                    }
                }
            });

            console.log('✅ Élève mis à jour:', `${eleve.firstName} ${eleve.lastName}`);
            res.json({
                success: true,
                message: 'Élève mis à jour avec succès',
                eleve
            });
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de l\'élève:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'élève'
            });
        }
    },

    async deleteStudent(req, res) {
        try {
            // Vérifier les autorisations
            if (!['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
                return res.status(403).json({ success: false, message: 'Accès refusé' });
            }

            const { id } = req.params;

            const eleve = await prisma.eleve.findUnique({
                where: { id: parseInt(id) }
            });

            if (!eleve) {
                return res.status(404).json({
                    success: false,
                    message: 'Élève non trouvé'
                });
            }

            await prisma.eleve.delete({
                where: { id: parseInt(id) }
            });

            console.log('✅ Élève supprimé:', `${eleve.firstName} ${eleve.lastName}`);
            res.json({
                success: true,
                message: 'Élève supprimé avec succès'
            });
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'élève:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'élève'
            });
        }
    }
};

module.exports = userManagementController;
