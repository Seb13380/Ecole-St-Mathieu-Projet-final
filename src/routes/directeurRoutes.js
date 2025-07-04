const express = require('express');
const directeurController = require('../controllers/directeurController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware pour vérifier l'authentification
router.use(requireAuth);

// Middleware pour vérifier le rôle directeur
router.use(requireRole(['DIRECTEUR']));

// Routes du directeur
router.get('/dashboard', directeurController.dashboard);

module.exports = router;
