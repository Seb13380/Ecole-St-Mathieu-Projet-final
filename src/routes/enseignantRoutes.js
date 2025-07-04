const express = require('express');
const router = express.Router();
const enseignantController = require('../controllers/enseignantController');
const { requireEnseignant } = require('../middleware/auth');

router.use(requireEnseignant);

router.get('/dashboard', enseignantController.getDashboard);

router.get('/notes', enseignantController.getNotesManagement);
router.post('/notes', enseignantController.createNote);

router.get('/absences', enseignantController.getAbsencesManagement);
router.post('/absences', enseignantController.createAbsence);

router.get('/horaires', enseignantController.getHoraires);

router.get('/messages', enseignantController.getMessages);
router.post('/messages', enseignantController.sendMessage);

module.exports = router;
