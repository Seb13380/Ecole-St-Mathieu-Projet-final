const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Routes d'administration - accessibles au directeur et à Frank
router.get('/admin/media',
    requireAuth,
    requireRole(['DIRECTEUR', 'ADMIN', 'MAINTENANCE_SITE']),
    mediaController.getMediaManagement
);

router.post('/admin/media/upload',
    requireAuth,
    requireRole(['DIRECTEUR', 'ADMIN', 'MAINTENANCE_SITE']),
    mediaController.uploadMiddleware,
    mediaController.uploadImages
);

router.get('/admin/media/:filename/info',
    requireAuth,
    requireRole(['DIRECTEUR', 'ADMIN', 'MAINTENANCE_SITE']),
    mediaController.getImageInfo
);

router.delete('/admin/media/:filename',
    requireAuth,
    requireRole(['DIRECTEUR', 'ADMIN', 'MAINTENANCE_SITE']),
    mediaController.deleteImage
);

module.exports = router;
