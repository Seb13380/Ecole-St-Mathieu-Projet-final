const express = require('express');
const router = express.Router();
const heroCarouselController = require('../controllers/heroCarouselController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Middleware pour vérifier les permissions (DIRECTION, MAINTENANCE_SITE ou ADMIN)
const requireHeroCarouselPermission = requireRole(['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN']);

// Routes pour la gestion des images hero carousel
// Route principale - supporte les deux variantes
router.get(['/manage', '/management'], requireAuth, requireHeroCarouselPermission, heroCarouselController.showManagement);

// Routes CRUD
router.post('/add', requireAuth, requireHeroCarouselPermission, heroCarouselController.addImage);

// Support POST pour les formulaires HTML (méthode override)
router.post('/:id/update', requireAuth, requireHeroCarouselPermission, heroCarouselController.updateImage);
router.post('/:id/delete', requireAuth, requireHeroCarouselPermission, heroCarouselController.deleteImage);
router.post('/:id/toggle-status', requireAuth, requireHeroCarouselPermission, heroCarouselController.toggleStatus);

// Routes RESTful (pour compatibilité future)
router.put('/:id', requireAuth, requireHeroCarouselPermission, heroCarouselController.updateImage);
router.delete('/:id', requireAuth, requireHeroCarouselPermission, heroCarouselController.deleteImage);
router.patch('/:id/toggle-status', requireAuth, requireHeroCarouselPermission, heroCarouselController.toggleStatus);

// Alias pour le toggle du statut: certaines vues utilisent /:id/toggle
router.post('/:id/toggle', requireAuth, requireHeroCarouselPermission, heroCarouselController.toggleStatus);

module.exports = router;
