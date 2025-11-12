const express = require('express');
const rateLimit = require('express-rate-limit');
const preInscriptionController = require('../controllers/preInscriptionController');
const inscriptionEleveController = require('../controllers/inscriptionEleveController'); // Ajouter pour validation email
const { requireDirection, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// 🛡️ Rate limiter pour éviter le spam de formulaires
const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Maximum 3 soumissions par IP
    message: 'Trop de demandes. Veuillez réessayer dans 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Routes publiques pour la pré-inscription
router.get('/', preInscriptionController.getPreInscription);
router.post('/', formLimiter, preInscriptionController.postPreInscription);

// ✉️ NOUVELLE ROUTE - Validation email d'inscription (publique)
router.get('/validate-email/:token', inscriptionEleveController.validateEmail);

// Routes administratives (accès restreint)
router.get('/admin', requireDirection, preInscriptionController.getAdminPreInscriptions);
router.put('/admin/:id', requireDirection, preInscriptionController.updateRequestStatus);

module.exports = router;
