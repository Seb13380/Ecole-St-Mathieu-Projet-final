const express = require('express');
const router = express.Router();
// Utilisation du contrôleur COMPLET avec emails (maintenant que Gmail est configuré)
const PreInscriptionController = require('../controllers/preInscriptionController');
const { requireAuth } = require('../middleware/auth');

// Route publique - Afficher le formulaire de pré-inscription
router.get('/pre-inscription', (req, res) => PreInscriptionController.showPreInscriptionForm(req, res));

// Route publique - Soumettre une pré-inscription
router.post('/pre-inscription', (req, res) => PreInscriptionController.submitPreInscription(req, res));

// Routes admin - Gestion des pré-inscriptions (nécessitent authentification)
router.get('/admin/pre-inscriptions', requireAuth, (req, res) => PreInscriptionController.listPreInscriptions(req, res));

// Approuver une pré-inscription
router.post('/admin/pre-inscriptions/:id/approve', requireAuth, (req, res) => PreInscriptionController.approvePreInscription(req, res));

// Rejeter une pré-inscription
router.post('/admin/pre-inscriptions/:id/reject', requireAuth, (req, res) => PreInscriptionController.rejectPreInscription(req, res));

// Actions directes depuis l'email (avec token de sécurité)
router.get('/admin/pre-inscriptions/:id/approve-email', (req, res) => PreInscriptionController.approveFromEmail(req, res));
router.get('/admin/pre-inscriptions/:id/reject-email', (req, res) => PreInscriptionController.rejectFromEmail(req, res));

module.exports = router;
