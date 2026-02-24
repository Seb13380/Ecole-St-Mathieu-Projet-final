const legalController = {
    // Page À propos
    getAPropos: async (req, res) => {
        try {
            res.render('pages/legal/a-propos', {
                title: 'À propos de nous - École Saint Mathieu',
                user: req.session.user || null
            });
        } catch (error) {
            console.error('Erreur lors du chargement de la page À propos:', error);
            res.status(500).render('pages/error', {
                title: 'Erreur - École Saint Mathieu',
                message: 'Une erreur est survenue lors du chargement de la page À propos.',
                user: req.session.user || null
            });
        }
    },

    // Page Mentions légales
    getMentionsLegales: async (req, res) => {
        try {
            res.render('pages/legal/mentions-legales', {
                title: 'Mentions légales - École Saint Mathieu',
                user: req.session.user || null
            });
        } catch (error) {
            console.error('Erreur lors du chargement des mentions légales:', error);
            res.status(500).render('pages/error', {
                title: 'Erreur - École Saint Mathieu',
                message: 'Une erreur est survenue lors du chargement des mentions légales.',
                user: req.session.user || null
            });
        }
    },

    // Page Politique de confidentialité
    getPolitiqueConfidentialite: async (req, res) => {
        try {
            res.render('pages/legal/politique-confidentialite', {
                title: 'Politique de confidentialité - École Saint Mathieu',
                user: req.session.user || null
            });
        } catch (error) {
            console.error('Erreur lors du chargement de la politique de confidentialité:', error);
            res.status(500).render('pages/error', {
                title: 'Erreur - École Saint Mathieu',
                message: 'Une erreur est survenue lors du chargement de la politique de confidentialité.',
                user: req.session.user || null
            });
        }
    }
};

module.exports = legalController;
