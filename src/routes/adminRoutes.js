const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const inscriptionController = require('../controllers/inscriptionController');
const { requireAdmin } = require('../middleware/auth');

// Dashboard admin
router.get('/dashboard', requireAdmin, adminController.getDashboard);

// Gestion des utilisateurs
router.get('/users', requireAdmin, adminController.getUsersManagement);
router.post('/users', requireAdmin, adminController.createUser);
router.post('/users/:id/update', requireAdmin, adminController.updateUser);
router.post('/users/:id/delete', requireAdmin, adminController.deleteUser);

// Gestion des classes
router.get('/classes', requireAdmin, adminController.getClassesManagement);
router.post('/classes', requireAdmin, adminController.createClasse);
router.post('/classes/:id/update', requireAdmin, adminController.updateClasse);
router.post('/classes/:id/delete', requireAdmin, adminController.deleteClasse);

// Gestion des élèves
router.get('/students', requireAdmin, adminController.getStudentsManagement);
router.post('/students', requireAdmin, adminController.createStudent);
router.post('/students/:id/update', requireAdmin, adminController.updateStudent);
router.post('/students/:id/delete', requireAdmin, adminController.deleteStudent);

// Routes pour les demandes d'inscription
router.get('/inscriptions', requireAdmin, inscriptionController.showAllRequests);
router.post('/inscriptions/:id/approve', requireAdmin, inscriptionController.approveRequest);
router.post('/inscriptions/:id/reject', requireAdmin, inscriptionController.rejectRequest);
router.get('/inscriptions/:id/details', requireAdmin, inscriptionController.showRequestDetails);

// Messages de contact
router.get('/contact-messages', requireAdmin, adminController.getContactMessages);
router.post('/contact/:id/process', requireAdmin, adminController.markContactAsProcessed);

// Rapports et statistiques
router.get('/reports', requireAdmin, adminController.getReports);

// Paramètres système
router.get('/settings', requireAdmin, adminController.getSettings);
router.post('/settings', requireAdmin, adminController.updateSettings);

module.exports = router;
