const express = require('express');
const multer = require('multer');
const path = require('path');
const directeurController = require('../controllers/directeurController');
const inscriptionController = require('../controllers/inscriptionController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configuration de multer pour l'upload de fichiers Excel
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/excel/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/octet-stream'
        ];

        if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Format de fichier non supporté. Utilisez .xlsx ou .xls'));
        }
    }
});

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
router.post('/inscriptions/:id/validate', inscriptionController.validateDossier);
router.post('/inscriptions/:id/reject', inscriptionController.rejectRequest);
router.delete('/inscriptions/:id/delete', inscriptionController.deleteRequest);
router.get('/inscriptions/:id/details', inscriptionController.showRequestDetails);

// Nouvelles routes pour les rendez-vous d'inscription
router.get('/rendez-vous-inscriptions', directeurController.getRendezVousInscriptions);
router.get('/rendez-vous-inscriptions/:id/pdf', directeurController.generateInscriptionPDF);
router.post('/rendez-vous-inscriptions/:id/finalize', inscriptionController.finalizeInscription);

// Route PDF accessible depuis les inscriptions finalisées également
router.get('/inscriptions/:id/pdf', directeurController.generateInscriptionPDF);

// ARCHIVE PDF - Nouvelle route pour gérer les PDF archivés
router.get('/pdf-archive', directeurController.getPDFArchive);

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

// Import Excel des familles
router.get('/import-excel', directeurController.getImportExcel);
router.post('/import-excel/process', upload.single('excelFile'), directeurController.processExcelImport);

module.exports = router;
