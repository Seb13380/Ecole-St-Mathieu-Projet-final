const express = require('express');
const router = express.Router();
const inscriptionManagementController = require('../controllers/inscriptionManagementController');
const { requireAuth, requireRole } = require('../middleware/auth');

// ============ ROUTES ADMINISTRATION (Frank & Lionel) ============

// Middleware d'authentification et d'autorisation pour l'admin
router.use('/admin', requireAuth);
router.use('/admin', requireRole(['DIRECTION', 'GESTIONNAIRE_SITE']));

// Page de gestion des inscriptions
router.get('/admin', inscriptionManagementController.getInscriptionManagement);

// Gestion de la configuration
router.put('/admin/config', inscriptionManagementController.updateInscriptionConfig);

// Gestion des documents
router.post('/admin/documents',
    inscriptionManagementController.uploadMiddleware,
    inscriptionManagementController.addDocument
);

router.delete('/admin/documents/:id', inscriptionManagementController.deleteDocument);

router.put('/admin/documents/order', inscriptionManagementController.updateDocumentOrder);

// ============ ROUTES PUBLIQUES ============

// API pour récupérer les données d'inscription (publique)
router.get('/data', inscriptionManagementController.getInscriptionData);

// Téléchargement de documents (publique)
router.get('/documents/:id/download', inscriptionManagementController.downloadDocument);

module.exports = router;
