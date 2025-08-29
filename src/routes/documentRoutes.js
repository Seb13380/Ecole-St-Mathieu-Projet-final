const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { requireAuth, requireDirection } = require('../middleware/auth');
const uploadDocuments = require('../../middleware/uploadDocuments');

// Routes administratives AVANT les routes génériques (important pour l'ordre!)
router.get('/admin', requireDirection, documentController.manageDocuments);
router.get('/admin/test', requireDirection, documentController.testManage);
router.get('/admin/manage', requireDirection, documentController.manageDocuments);
router.post('/admin/create', requireDirection, uploadDocuments.single('pdf'), documentController.createDocument);
router.put('/admin/:id', requireDirection, uploadDocuments.single('pdf'), documentController.updateDocument);
router.post('/admin/:id', requireDirection, uploadDocuments.single('pdf'), documentController.updateDocument);
router.delete('/admin/:id', requireDirection, documentController.deleteDocument);
router.post('/admin/:id/delete', requireDirection, documentController.deleteDocument);
router.patch('/admin/:id/toggle', requireDirection, documentController.toggleDocument);
router.post('/admin/:id/toggle', requireDirection, documentController.toggleDocument);

// Routes publiques SANS AUTHENTIFICATION (accès libre)
router.get('/show/:id', documentController.showPublicDocument); // /documents/show/123
router.get('/:category', documentController.getDocumentsByCategory); // /documents/ecole ou /documents/pastorale

module.exports = router;
