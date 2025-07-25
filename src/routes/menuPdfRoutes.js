const express = require('express');
const router = express.Router();
const menuPdfController = require('../controllers/menuPdfController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/menus', menuPdfController.getPublicMenus);

router.get('/admin/menus-pdf',
    requireAuth,
    requireRole(['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN']),
    menuPdfController.getMenusManagement
);

router.post('/admin/menus-pdf/create',
    requireAuth,
    requireRole(['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN']),
    menuPdfController.uploadMiddleware,
    menuPdfController.createMenu
);

router.put('/admin/menus-pdf/:id/status',
    requireAuth,
    requireRole(['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN']),
    menuPdfController.updateMenuStatus
);

router.post('/admin/menus-pdf/:id/toggle',
    requireAuth,
    requireRole(['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN']),
    menuPdfController.toggleMenu
);

router.post('/admin/menus-pdf/:id/activate',
    requireAuth,
    requireRole(['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN']),
    menuPdfController.activateMenu
);

router.delete('/admin/menus-pdf/:id',
    requireAuth,
    requireRole(['DIRECTION', 'MAINTENANCE_SITE', 'ADMIN']),
    menuPdfController.deleteMenu
);

module.exports = router;
