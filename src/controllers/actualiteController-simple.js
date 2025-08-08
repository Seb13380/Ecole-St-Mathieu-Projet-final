const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const actualiteController = {
    // Page publique des actualités
    async getActualites(req, res) {
        try {
            const actualites = await prisma.actualite.findMany({
                where: { visible: true },
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, role: true }
                    }
                },
                orderBy: [
                    { important: 'desc' },
                    { datePublication: 'desc' }
                ]
            });

            res.render('pages/actualites', {
                actualites,
                title: 'Actualités de l\'école'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des actualités:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // Page de gestion des actualités
    async getActualitesManagement(req, res) {
        try {
            console.log('📰 Accès à la gestion des actualités');
            console.log('👤 Utilisateur:', req.user);

            const actualites = await prisma.actualite.findMany({
                include: {
                    auteur: {
                        select: { firstName: true, lastName: true, role: true }
                    }
                },
                orderBy: { datePublication: 'desc' }
            });

            console.log(`📊 ${actualites.length} actualités trouvées`);

            res.render('pages/admin/gestion-actualites-test', {
                actualites,
                title: 'Gestion des actualités - TEST',
                user: req.user || {
                    firstName: 'Test',
                    lastName: 'User',
                    role: 'ADMIN'
                }
            });
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des actualités:', error);
            res.status(500).json({
                error: 'Erreur serveur',
                details: error.message
            });
        }
    },

    // Méthodes placeholder pour éviter les erreurs
    async getEditActualite(req, res) {
        res.json({ message: 'Édition non implémentée' });
    },

    async updateActualite(req, res) {
        res.json({ message: 'Mise à jour non implémentée' });
    },

    async deleteActualite(req, res) {
        res.json({ message: 'Suppression non implémentée' });
    },

    async toggleVisibility(req, res) {
        res.json({ message: 'Toggle non implémenté' });
    },

    async createActualiteWithUpload(req, res) {
        res.json({ message: 'Création non implémentée' });
    },

    uploadMiddleware: (req, res, next) => {
        console.log('📁 Upload middleware appelé');
        next();
    }
};

module.exports = actualiteController;
