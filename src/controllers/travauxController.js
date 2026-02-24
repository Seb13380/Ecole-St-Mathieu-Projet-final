const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const travauxController = {
    // Liste publique des travaux (visible:true)
    async getTravaux(req, res) {
        try {
            const travaux = await prisma.travaux.findMany({
                where: { visible: true },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, role: true }
                    }
                },
                orderBy: [
                    { important: 'desc' },
                    { createdAt: 'desc' }
                ]
            });

            res.render('pages/travaux', {
                travaux,
                title: 'Travaux de l\'école'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des travaux:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des travaux'
            });
        }
    },

    // Ancien nom éventuellement utilisé ailleurs (non référencé dans routes actuelles)
    async getTravauxManagement(req, res) {
        try {
            const travaux = await prisma.travaux.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, role: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });


            res.render('pages/admin/travaux', {
                travaux,
                title: 'Gestion des Travaux',
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des travaux:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des travaux'
            });
        }
    },

    // Page de gestion (admin)
    showManagement: async (req, res) => {
        try {

            const travaux = await prisma.travaux.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: [
                    { important: 'desc' },
                    { dateDebut: 'desc' }
                ]
            });

            // Formater les dates pour l'affichage HTML
            const travauxFormatted = travaux.map(t => ({
                ...t,
                dateDebutFormatted: t.dateDebut ? t.dateDebut.toISOString().split('T')[0] : '',
                dateFinFormatted: t.dateFin ? t.dateFin.toISOString().split('T')[0] : '',
                progressionPercent: Math.min(100, Math.max(0, t.progression || 0))
            }));

            res.render('pages/admin/travaux-management', {
                title: 'Gestion des Travaux',
                travaux: travauxFormatted,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des travaux pour la gestion:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement de la gestion des travaux',
                user: req.session.user
            });
        }
    },

    // Création d'un travail (admin)
    createTravaux: async (req, res) => {
        try {
            const {
                titre,
                description,
                dateDebut,
                dateFin,
                progression,
                statut,
                important,
                visible
            } = req.body;

            if (!req.session?.user?.id) {
                return res.redirect('/travaux/manage?error=' + encodeURIComponent('Utilisateur non authentifié'));
            }

            const nouveauTravail = await prisma.travaux.create({
                data: {
                    titre,
                    description,
                    dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
                    dateFin: dateFin ? new Date(dateFin) : null,
                    progression: parseInt(progression) || 0,
                    statut: statut || 'EN_COURS',
                    important: important === 'on' || important === 'true',
                    visible: visible === 'on' || visible === 'true',
                    auteurId: req.session.user.id
                }
            });

            res.redirect('/travaux/manage?success=' + encodeURIComponent('Travail créé avec succès'));
        } catch (error) {
            console.error('❌ Erreur lors de la création du travail:', error);
            res.redirect('/travaux/manage?error=' + encodeURIComponent('Erreur lors de la création du travail'));
        }
    },

    // Mise à jour d'un travail (admin)
    updateTravaux: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                titre,
                description,
                dateDebut,
                dateFin,
                progression,
                statut,
                important,
                visible
            } = req.body;

            const travauxMisAJour = await prisma.travaux.update({
                where: { id: parseInt(id) },
                data: {
                    titre,
                    description,
                    dateDebut: dateDebut ? new Date(dateDebut) : undefined,
                    dateFin: dateFin ? new Date(dateFin) : null,
                    progression: parseInt(progression) || 0,
                    statut: statut || 'EN_COURS',
                    important: important === 'on' || important === 'true',
                    visible: visible === 'on' || visible === 'true'
                }
            });

            res.redirect('/travaux/manage?success=' + encodeURIComponent('Travail mis à jour avec succès'));
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour du travail:', error);
            res.redirect('/travaux/manage?error=' + encodeURIComponent('Erreur lors de la mise à jour du travail'));
        }
    },

    // Suppression d'un travail (admin)
    deleteTravaux: async (req, res) => {
        try {
            const { id } = req.params;

            const travauxSupprime = await prisma.travaux.delete({
                where: { id: parseInt(id) }
            });

            res.redirect('/travaux/manage?success=' + encodeURIComponent('Travail supprimé avec succès'));
        } catch (error) {
            console.error('❌ Erreur lors de la suppression du travail:', error);
            res.redirect('/travaux/manage?error=' + encodeURIComponent('Erreur lors de la suppression du travail'));
        }
    },

    // Bascule visibilité (admin)
    toggleVisibility: async (req, res) => {
        try {
            const { id } = req.params;

            const travail = await prisma.travaux.findUnique({
                where: { id: parseInt(id) }
            });

            if (!travail) {
                return res.redirect('/travaux/manage?error=' + encodeURIComponent('Travail non trouvé'));
            }

            const travauxMisAJour = await prisma.travaux.update({
                where: { id: parseInt(id) },
                data: { visible: !travail.visible }
            });

            const message = travauxMisAJour.visible ? 'Travail rendu visible' : 'Travail masqué';
            res.redirect('/travaux/manage?success=' + encodeURIComponent(message));
        } catch (error) {
            console.error('❌ Erreur lors du changement de visibilité:', error);
            res.redirect('/travaux/manage?error=' + encodeURIComponent('Erreur lors du changement de visibilité'));
        }
    },

    // Alias compatible avec les routes existantes (routes appellent showTravaux)
    showTravaux(req, res) {
        return this.getTravaux(req, res);
    }
};

module.exports = travauxController;
