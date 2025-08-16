const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const travauxController = {
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

            console.log('🔨 Gestion des travaux - Travaux récupérés:', travaux.length);

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

    async createTravaux(req, res) {
        try {
            const { titre, description, dateDebut, dateFin, progression, statut, important, visible } = req.body;
            const auteurId = req.session.user.id;

            // Validation de la progression (0-100)
            const progressionInt = Math.min(100, Math.max(0, parseInt(progression) || 0));

            // Gestion des dates
            let dateDebutFinal = dateDebut && dateDebut.trim() ? new Date(dateDebut) : null;
            let dateFinFinal = dateFin && dateFin.trim() ? new Date(dateFin) : null;

            const travaux = await prisma.travaux.create({
                data: {
                    titre,
                    description,
                    auteurId,
                    dateDebut: dateDebutFinal,
                    dateFin: dateFinFinal,
                    progression: progressionInt,
                    statut: statut || 'PLANIFIE',
                    important: important === 'true',
                    visible: visible === 'true'
                }
            });

            console.log('✅ Travaux créés:', travaux.titre);
            res.redirect('/travaux/manage?success=' + encodeURIComponent('Travaux créés avec succès'));
        } catch (error) {
            console.error('Erreur lors de la création des travaux:', error);
            res.redirect('/travaux/manage?error=' + encodeURIComponent('Erreur lors de la création des travaux'));
        }
    },

    async updateTravaux(req, res) {
        try {
            console.log('🔧 updateTravaux appelé:', {
                method: req.method,
                url: req.url,
                params: req.params,
                body: req.body
            });

            const { id } = req.params;
            const { titre, description, dateDebut, dateFin, progression, statut, important, visible } = req.body;

            // Validation de la progression (0-100)
            const progressionInt = Math.min(100, Math.max(0, parseInt(progression) || 0));

            // Gestion des dates
            let dateDebutFinal = dateDebut && dateDebut.trim() ? new Date(dateDebut) : null;
            let dateFinFinal = dateFin && dateFin.trim() ? new Date(dateFin) : null;

            const travaux = await prisma.travaux.update({
                where: { id: parseInt(id) },
                data: {
                    titre,
                    description,
                    dateDebut: dateDebutFinal,
                    dateFin: dateFinFinal,
                    progression: progressionInt,
                    statut: statut || 'PLANIFIE',
                    important: important === 'true',
                    visible: visible === 'true'
                }
            });

            console.log('✅ Travaux mis à jour:', travaux.titre);
            res.redirect(`/travaux/manage?success=${encodeURIComponent('Travaux mis à jour avec succès')}#travail-${id}`);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des travaux:', error);
            res.redirect(`/travaux/manage?error=${encodeURIComponent('Erreur lors de la mise à jour des travaux')}#travail-${id || ''}`);
        }
    },

    async deleteTravaux(req, res) {
        try {
            console.log('🗑️ deleteTravaux appelé:', {
                method: req.method,
                params: req.params,
                body: req.body
            });

            const { id } = req.params;

            await prisma.travaux.delete({
                where: { id: parseInt(id) }
            });

            console.log('✅ Travaux supprimés:', id);
            res.redirect('/travaux/manage?success=' + encodeURIComponent('Travaux supprimés avec succès'));
        } catch (error) {
            console.error('Erreur lors de la suppression des travaux:', error);
            res.redirect('/travaux/manage?error=' + encodeURIComponent('Erreur lors de la suppression des travaux'));
        }
    },

    async toggleVisibility(req, res) {
        try {
            const { id } = req.params;

            const travaux = await prisma.travaux.findUnique({
                where: { id: parseInt(id) }
            });

            if (!travaux) {
                return res.redirect('/travaux/manage?error=' + encodeURIComponent('Travaux non trouvés'));
            }

            const updatedTravaux = await prisma.travaux.update({
                where: { id: parseInt(id) },
                data: { visible: !travaux.visible }
            });

            const message = updatedTravaux.visible ? 'Travaux rendus visibles' : 'Travaux masqués';
            console.log('✅ Visibilité modifiée:', message);
            res.redirect(`/travaux/manage?success=${encodeURIComponent(message)}#travail-${id}`);
        } catch (error) {
            console.error('Erreur lors du changement de visibilité:', error);
            res.redirect(`/travaux/manage?error=${encodeURIComponent('Erreur lors du changement de visibilité')}#travail-${id || ''}`);
        }
    }
};

module.exports = travauxController;
