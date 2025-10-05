const express = require('express');
const multer = require('multer');
const path = require('path');
const secretaireController = require('../controllers/secretaireController');
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

// Middleware pour vérifier le rôle secrétaire/directeur/admin
router.use(requireRole(['SECRETAIRE_DIRECTION', 'DIRECTION', 'ADMIN']));

// Dashboard
router.get('/dashboard', secretaireController.dashboard);

// Listes d'élèves (routes originales de la secrétaire)
router.get('/class-lists', secretaireController.getClassLists);

// === NOUVELLES ROUTES AVEC ACCÈS DIRECTEUR ===

// Gestion des utilisateurs
router.get('/users', secretaireController.getUsersManagement);
router.get('/users/:id', secretaireController.getUser);
router.post('/users', secretaireController.createUser);
router.post('/users/:id/update', secretaireController.updateUser);
router.post('/users/:id/delete', secretaireController.deleteUser);

// Gestion des classes
router.get('/classes', secretaireController.getClassesManagement);
router.post('/classes', secretaireController.createClasse);
router.post('/classes/:id/update', secretaireController.updateClasse);
router.post('/classes/:id/delete', secretaireController.deleteClasse);
router.get('/classes/:id/export', secretaireController.exportClassList);
router.post('/classes/export-all', secretaireController.exportAllClassesAndEmail);

// Gestion des élèves
router.get('/students', secretaireController.getStudentsManagement);
router.post('/students', secretaireController.createStudent);
router.post('/students/:id/update', secretaireController.updateStudent);
router.post('/students/:id/delete', secretaireController.deleteStudent);

// Routes pour les demandes d'inscription
router.get('/inscriptions', inscriptionController.showAllRequests);
router.get('/inscriptions/manage', inscriptionController.showManageInscriptions);
router.post('/inscriptions/:id/approve', inscriptionController.approveRequest);
router.post('/inscriptions/:id/validate', inscriptionController.validateDossier);
router.post('/inscriptions/:id/reject', inscriptionController.rejectRequest);
router.delete('/inscriptions/:id/delete', inscriptionController.deleteRequest);
router.get('/inscriptions/:id/details', inscriptionController.showRequestDetails);

// Nouvelles routes pour les rendez-vous d'inscription
router.get('/rendez-vous-inscriptions', secretaireController.getRendezVousInscriptions);
router.get('/rendez-vous-inscriptions/:id/pdf', secretaireController.generateInscriptionPDF);
router.post('/rendez-vous-inscriptions/:id/finalize', inscriptionController.finalizeInscription);

// Route PDF accessible depuis les inscriptions finalisées également
router.get('/inscriptions/:id/pdf', secretaireController.generateInscriptionPDF);

// ARCHIVE PDF - Nouvelle route pour gérer les PDF archivés
router.get('/pdf-archive', secretaireController.getPDFArchive);

// API routes for inscriptions
router.get('/api/classes', inscriptionController.getAvailableClasses);
router.post('/notify-yamina', inscriptionController.notifyYamina);

// Configuration des inscriptions
router.post('/inscription-config', inscriptionController.updateInscriptionConfig);

// Messages de contact
router.get('/contact-messages', secretaireController.getContactMessages);
router.post('/contact/:id/process', secretaireController.markContactAsProcessed);

// Demandes d'identifiants
router.get('/credentials', secretaireController.getCredentialsRequests);
router.post('/credentials/:id/approve', secretaireController.approveCredentialsRequest);
router.post('/credentials/:id/reject', secretaireController.rejectCredentialsRequest);
router.post('/credentials/:id/delete', secretaireController.deleteCredentialsRequest);

// Rapports et statistiques
router.get('/reports', secretaireController.getReports);

// Paramètres système
router.get('/settings', secretaireController.getSettings);
router.post('/settings', secretaireController.updateSettings);

// Import Excel des familles
router.get('/import-excel', secretaireController.getImportExcel);
router.post('/import-excel/process', upload.single('excelFile'), secretaireController.processExcelImport);

module.exports = router;
