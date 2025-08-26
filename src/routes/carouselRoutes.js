const express = require('express');
const carouselController = require('../controllers/carouselController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware pour vérifier l'authentification
router.use(requireAuth);

// Middleware pour vérifier les rôles autorisés (Directeur et Maintenance)
router.use(requireRole(['DIRECTION', 'ADMIN', 'MAINTENANCE_SITE']));

// Routes pour la gestion du carousel
router.get('/manage', carouselController.showManagement);
router.post('/add', carouselController.addImage);
router.post('/:id', carouselController.updateImage);
router.post('/:id/delete', carouselController.deleteImage);
router.post('/:id/toggle', carouselController.toggleStatus);

// API publique pour récupérer les images actives
router.get('/api/active', carouselController.getActiveImages);

module.exports = router;
