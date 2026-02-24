const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Route pour le dashboard de Frank
router.get('/dashboard', requireAuth, (req, res) => {

    // Vérifier que l'utilisateur est bien Frank (MAINTENANCE_SITE)
    if (req.session.user.role !== 'MAINTENANCE_SITE') {
        return res.status(403).render('pages/error.twig', {
            message: 'Accès refusé - Réservé au gestionnaire',
            title: 'Accès refusé'
        });
    }

    res.render('pages/frank/dashboard.twig', {
        title: 'Tableau de bord - Frank',
        user: req.session.user,
        stats: {
            totalUsers: 0,
            totalStudents: 0,
            totalClasses: 0,
            totalMessages: 0,
            totalActualites: 0
        },
        recentUsers: [],
        recentMessages: []
    });
});

module.exports = router;
