const ogecController = {
    getOgec: (req, res) => {
        res.render('pages/gestion-ecole', {
            title: 'École Saint-Mathieu - OGEC',
            user: req.session.user || null,
            isAuthenticated: !!req.session.user
        });
    }
};

module.exports = ogecController;
