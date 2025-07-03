const express = require('express');
const router = express.Router();
const enseignantController = require('../controllers/enseignantController');
const { requireEnseignant } = require('../middleware/auth');

// Appliquer le middleware d'authentification enseignant à toutes les routes
router.use(requireEnseignant);

// === DASHBOARD ENSEIGNANT ===
router.get('/dashboard', enseignantController.getDashboard);

// === GESTION DES NOTES ===
router.get('/notes', enseignantController.getNotesManagement);
router.post('/notes', enseignantController.createNote);

// === GESTION DES ABSENCES ===
router.get('/absences', enseignantController.getAbsencesManagement);
router.post('/absences', enseignantController.createAbsence);

// === HORAIRES ===
router.get('/horaires', enseignantController.getHoraires);

// === MESSAGERIE ===
router.get('/messages', enseignantController.getMessages);
router.post('/messages', enseignantController.sendMessage);

module.exports = router;
