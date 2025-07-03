const express = require('express');
const homeController = require('../controllers/homeController');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Routes publiques
router.get('/', homeController.getHome);
router.post('/contact', homeController.postContact);

// Routes admin pour les messages de contact
router.get('/admin/contact-messages', requireAdmin, homeController.getContactMessages);
router.patch('/admin/contact-messages/:id/processed', requireAdmin, homeController.markContactAsProcessed);

module.exports = router;