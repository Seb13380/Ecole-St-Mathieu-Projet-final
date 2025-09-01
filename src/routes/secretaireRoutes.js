const express = require('express');
const secretaireController = require('../controllers/secretaireController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware pour vérifier l'authentification
router.use(requireAuth);

// Middleware pour vérifier le rôle secrétaire
router.use(requireRole(['SECRETAIRE_DIRECTION', 'DIRECTION', 'ADMIN']));

// Dashboard
router.get('/dashboard', secretaireController.dashboard);

// Listes d'élèves
router.get('/class-lists', secretaireController.getClassLists);

module.exports = router;
