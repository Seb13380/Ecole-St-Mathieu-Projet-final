const express = require('express');
const router = express.Router();
const menuPdfController = require('../controllers/menuPdfController');

// Route publique - Afficher les menus de la semaine (système PDF)
router.get('/menus', menuPdfController.getPublicMenus);

module.exports = router;
