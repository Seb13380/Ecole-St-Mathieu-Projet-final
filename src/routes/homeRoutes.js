const express = require('express');
const homeController = require('../controllers/homeController');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', homeController.getHome);
router.get('/reglement-interieur', homeController.getReglementInterieur);
router.get('/frais-scolarite', homeController.getFraisScolarite);
router.get('/horaires', homeController.getHoraires);
router.post('/contact', homeController.postContact);

router.get('/admin/contact-messages', requireAdmin, homeController.getContactMessages);
router.patch('/admin/contact-messages/:id/processed', requireAdmin, homeController.markContactAsProcessed);

module.exports = router;