const express = require('express');
const router = express.Router();
const heroCarouselController = require('../controllers/heroCarouselController');

// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login?message=Veuillez vous connecter pour accéder à cette page.');
    }
    next();
};

// Middleware pour vérifier les permissions (DIRECTION ou MAINTENANCE_SITE)
const requireHeroCarouselPermission = (req, res, next) => {
    if (!req.session.user || !['DIRECTION', 'MAINTENANCE_SITE'].includes(req.session.user.role)) {
        return res.status(403).render('pages/error', {
            message: 'Accès non autorisé. Seuls les directeurs et le responsable maintenance peuvent gérer les images du carrousel principal.'
        });
    }
    next();
};

// Routes pour la gestion des images hero carousel
router.get('/management', requireAuth, requireHeroCarouselPermission, heroCarouselController.showManagement);
router.post('/add', requireAuth, requireHeroCarouselPermission, heroCarouselController.addImage);
router.put('/:id', requireAuth, requireHeroCarouselPermission, heroCarouselController.updateImage);
router.delete('/:id', requireAuth, requireHeroCarouselPermission, heroCarouselController.deleteImage);
router.patch('/:id/toggle-status', requireAuth, requireHeroCarouselPermission, heroCarouselController.toggleStatus);

module.exports = router;
