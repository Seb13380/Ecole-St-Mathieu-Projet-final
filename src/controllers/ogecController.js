const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ogecController = {
    // Page OGEC
    getOgec: async (req, res) => {
        try {
            res.render('pages/ogec', {
                title: 'OGEC - École Saint Mathieu',
                user: req.session.user || null,
                currentUrl: req.originalUrl
            });
        } catch (error) {
            console.error('Erreur lors du chargement de la page OGEC:', error);
            res.status(500).render('error', {
                title: 'Erreur',
                message: 'Une erreur est survenue lors du chargement de la page OGEC.',
                user: req.session.user || null
            });
        }
    }
};

module.exports = ogecController;
