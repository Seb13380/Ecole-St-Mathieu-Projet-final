const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

// Appliquer le middleware d'authentification admin à toutes les routes
router.use(requireAdmin);

// === DASHBOARD ADMIN ===
router.get('/dashboard', adminController.getDashboard);

// === GESTION DES UTILISATEURS ===
router.get('/users', adminController.getUsersManagement);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// === GESTION DES CLASSES ===
router.get('/classes', adminController.getClassesManagement);
router.post('/classes', adminController.createClasse);

// === GESTION DES ÉLÈVES ===
router.get('/students', adminController.getStudentsManagement);
router.post('/students', adminController.createStudent);

module.exports = router;
