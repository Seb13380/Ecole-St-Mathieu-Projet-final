const express = require('express');
const router = express.Router();
const { menuDirecteurController } = require('../controllers/menuDirecteurController');
const { requireAuth, requireDirecteurAccess } = require('../middleware/auth');

// Middleware pour vérifier que l'utilisateur est directeur
router.use(requireAuth);
router.use(requireDirecteurAccess);

router.get('/menus', menuDirecteurController.gestionMenus);

module.exports = router;
