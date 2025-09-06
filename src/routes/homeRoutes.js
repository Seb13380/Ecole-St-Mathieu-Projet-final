const express = require('express');
const homeController = require('../controllers/homeController');
const ogecController = require('../controllers/ogecController');
const legalController = require('../controllers/legalController');
const inscriptionEleveController = require('../controllers/inscriptionEleveController');
const credentialsController = require('../controllers/credentialsController');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', homeController.getHome);
router.get('/ogec', ogecController.getOgec);
router.get('/gestion-ecole', ogecController.getOgec);  // Nouvelle route pour test
router.get('/inscription-eleve', inscriptionEleveController.getInscriptionEleve);
router.post('/inscription-eleve', inscriptionEleveController.postInscriptionEleve);
router.post('/admin/inscription-eleve/respond', requireAdmin, inscriptionEleveController.handleDirectorResponse);

// Routes pour demandes d'identifiants
router.get('/demande-identifiants', credentialsController.showCredentialsForm);
router.get('/credentials-request', credentialsController.showCredentialsForm); // Alias
router.post('/demande-identifiants', credentialsController.processCredentialsRequest);
router.post('/credentials-request', credentialsController.processCredentialsRequest); // Alias
router.get('/reglement-interieur', homeController.getReglementInterieur);
router.get('/frais-scolarite', homeController.getFraisScolarite);
router.get('/horaires', homeController.getHoraires);
router.post('/contact', homeController.postContact);

router.get('/admin/contact-messages', requireAdmin, homeController.getContactMessages);
router.patch('/admin/contact-messages/:id/processed', requireAdmin, homeController.markContactAsProcessed);

// Routes légales
router.get('/a-propos', legalController.getAPropos);
router.get('/mentions-legales', legalController.getMentionsLegales);
router.get('/politique-confidentialite', legalController.getPolitiqueConfidentialite);

module.exports = router;