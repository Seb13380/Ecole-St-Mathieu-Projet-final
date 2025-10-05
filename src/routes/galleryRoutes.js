const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Route publique pour afficher la galerie (nécessite authentification)
router.get('/', requireAuth, galleryController.showGallery);

// Routes admin pour la gestion
router.get('/admin', requireAdmin, galleryController.showAdminGallery);

// API routes pour les actions admin
router.post('/admin/themes', requireAdmin, galleryController.createTheme);
router.delete('/admin/themes/:id', requireAdmin, galleryController.deleteTheme);
router.post('/admin/themes/reorder', requireAdmin, galleryController.reorderThemes);

router.post('/admin/upload', requireAdmin, galleryController.upload.array('files', 10), galleryController.uploadMedia);
router.delete('/admin/media/:id', requireAdmin, galleryController.deleteMedia);

module.exports = router;
