const express = require('express');
const carouselController = require('../controllers/carouselController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// API publique pour récupérer les images actives (SANS AUTHENTIFICATION)
router.get('/api/active', carouselController.getActiveImages);

// Middleware pour vérifier l'authentification APRÈS l'API publique
router.use(requireAuth);

// Middleware pour vérifier les rôles autorisés (Directeur et Maintenance)
router.use(requireRole(['DIRECTION', 'ADMIN', 'MAINTENANCE_SITE']));

// Routes pour la gestion du carousel (AVEC AUTHENTIFICATION)
router.get('/manage', carouselController.showManagement);
router.post('/add', carouselController.addImage);
router.post('/:id/update', carouselController.updateImage);
router.post('/:id', carouselController.updateImage);  // Route alternative pour compatibilité
router.post('/:id/delete', carouselController.deleteImage);
router.post('/:id/toggle', carouselController.toggleStatus);

module.exports = router;
