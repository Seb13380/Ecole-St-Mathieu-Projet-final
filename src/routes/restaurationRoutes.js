const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Route publique - Afficher les menus de la semaine
router.get('/menus', menuController.getMenus);

module.exports = router;
