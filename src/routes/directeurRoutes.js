const express = require('express');
const directeurController = require('../controllers/directeurController');
const inscriptionController = require('../controllers/inscriptionController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware pour vérifier l'authentification
router.use(requireAuth);

// Middleware pour vérifier le rôle directeur/admin/gestionnaire
router.use(requireRole(['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE']));

// Dashboard
router.get('/dashboard', directeurController.dashboard);

// Gestion des utilisateurs
router.get('/users', directeurController.getUsersManagement);
router.get('/users/:id', directeurController.getUser);
router.post('/users', directeurController.createUser);
router.post('/users/:id/update', directeurController.updateUser);
router.post('/users/:id/delete', directeurController.deleteUser);

// Gestion des classes
router.get('/classes', directeurController.getClassesManagement);
router.post('/classes', directeurController.createClasse);
router.post('/classes/:id/update', directeurController.updateClasse);
router.post('/classes/:id/delete', directeurController.deleteClasse);
router.get('/classes/:id/export', directeurController.exportClassList);
router.post('/classes/export-all', directeurController.exportAllClassesAndEmail);

// Gestion des élèves
router.get('/students', directeurController.getStudentsManagement);
router.post('/students', directeurController.createStudent);
router.post('/students/:id/update', directeurController.updateStudent);
router.post('/students/:id/delete', directeurController.deleteStudent);

// Routes pour les demandes d'inscription
router.get('/inscriptions', inscriptionController.showAllRequests);
router.get('/inscriptions/manage', inscriptionController.showManageInscriptions);
router.post('/inscriptions/:id/approve', inscriptionController.approveRequest);
router.post('/inscriptions/:id/reject', inscriptionController.rejectRequest);
router.post('/inscriptions/:id/delete', inscriptionController.deleteRequest);
router.get('/inscriptions/:id/details', inscriptionController.showRequestDetails);

// API routes for inscriptions
router.get('/api/classes', inscriptionController.getAvailableClasses);
router.post('/notify-yamina', inscriptionController.notifyYamina);

// Configuration des inscriptions
router.post('/inscription-config', inscriptionController.updateInscriptionConfig);

// Messages de contact
router.get('/contact-messages', directeurController.getContactMessages);
router.post('/contact/:id/process', directeurController.markContactAsProcessed);

// Demandes d'identifiants
router.get('/credentials', directeurController.getCredentialsRequests);
router.post('/credentials/:id/approve', directeurController.approveCredentialsRequest);
router.post('/credentials/:id/reject', directeurController.rejectCredentialsRequest);
router.post('/credentials/:id/delete', directeurController.deleteCredentialsRequest);

// Rapports et statistiques
router.get('/reports', directeurController.getReports);

// Paramètres système
router.get('/settings', directeurController.getSettings);
router.post('/settings', directeurController.updateSettings);

module.exports = router;
