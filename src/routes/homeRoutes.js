const express = require('express');
const homeController = require('../controllers/homeController');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', homeController.getHome);

// Routes désactivées temporairement (controllers supprimés)
router.get('/ogec', (req, res) => res.render('pages/ogec'));
router.get('/gestion-ecole', (req, res) => res.render('pages/ogec'));
router.get('/inscription-eleve', (req, res) => res.status(503).send('Service temporairement indisponible'));
router.post('/inscription-eleve', (req, res) => res.status(503).send('Service temporairement indisponible'));
router.get('/demande-identifiants', (req, res) => res.status(503).send('Service temporairement indisponible'));
router.get('/credentials-request', (req, res) => res.status(503).send('Service temporairement indisponible'));
router.post('/demande-identifiants', (req, res) => res.status(503).send('Service temporairement indisponible'));
router.post('/credentials-request', (req, res) => res.status(503).send('Service temporairement indisponible'));

router.get('/reglement-interieur', homeController.getReglementInterieur);
router.get('/frais-scolarite', homeController.getFraisScolarite);
router.get('/horaires', homeController.getHoraires);
router.post('/contact', homeController.postContact);

router.get('/admin/contact-messages', requireAdmin, homeController.getContactMessages);
router.patch('/admin/contact-messages/:id/processed', requireAdmin, homeController.markContactAsProcessed);

// Routes légales
router.get('/a-propos', (req, res) => res.render('pages/legal/a-propos'));
router.get('/mentions-legales', (req, res) => res.render('pages/legal/mentions-legales'));
router.get('/politique-confidentialite', (req, res) => res.render('pages/legal/politique-confidentialite'));

module.exports = router;