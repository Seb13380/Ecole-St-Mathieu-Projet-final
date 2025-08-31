const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Middleware d'authentification et d'autorisation
router.use(requireAuth);
router.use(requireRole(['DIRECTION', 'GESTIONNAIRE_SITE']));

// === ROUTES GESTION DES PARENTS ===

// Page de gestion des parents
router.get('/parents', userManagementController.getParentsManagement);

// CRUD Parents
router.post('/parents', userManagementController.createParent);
router.put('/parents/:id', userManagementController.updateParent);
router.delete('/parents/:id', userManagementController.deleteParent);

// === ROUTES GESTION DES ÉLÈVES ===

// Page de gestion des élèves
router.get('/students', userManagementController.getStudentsManagement);

// CRUD Élèves
router.post('/students', userManagementController.createStudent);
router.put('/students/:id', userManagementController.updateStudent);
router.delete('/students/:id', userManagementController.deleteStudent);

module.exports = router;
