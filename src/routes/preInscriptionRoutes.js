const express = require('express');
const preInscriptionController = require('../controllers/preInscriptionController');
const inscriptionEleveController = require('../controllers/inscriptionEleveController'); // Ajouter pour validation email
const { requireDirection, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Routes publiques pour la pré-inscription
router.get('/', preInscriptionController.getPreInscription);
router.post('/', preInscriptionController.postPreInscription);

// ✉️ NOUVELLE ROUTE - Validation email d'inscription (publique)
router.get('/validate-email/:token', inscriptionEleveController.validateEmail);

// Routes administratives (accès restreint)
router.get('/admin', requireDirection, preInscriptionController.getAdminPreInscriptions);
router.put('/admin/:id', requireDirection, preInscriptionController.updateRequestStatus);

module.exports = router;
