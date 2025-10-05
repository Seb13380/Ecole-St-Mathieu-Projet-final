const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Routes d'administration - accessibles au directeur et à Frank
router.get('/admin/media',
    requireAuth,
    requireRole(['DIRECTION', 'ADMIN', 'MAINTENANCE_SITE', 'SECRETAIRE_DIRECTION']),
    mediaController.getMediaManagement
);

router.post('/admin/media/upload',
    requireAuth,
    requireRole(['DIRECTION', 'ADMIN', 'MAINTENANCE_SITE', 'SECRETAIRE_DIRECTION']),
    mediaController.uploadMiddleware,
    mediaController.uploadImages
);

router.get('/admin/media/:filename/info',
    requireAuth,
    requireRole(['DIRECTION', 'ADMIN', 'MAINTENANCE_SITE', 'SECRETAIRE_DIRECTION']),
    mediaController.getImageInfo
);

router.delete('/admin/media/:filename',
    requireAuth,
    requireRole(['DIRECTION', 'ADMIN', 'MAINTENANCE_SITE', 'SECRETAIRE_DIRECTION']),
    mediaController.deleteImage
);

module.exports = router;
