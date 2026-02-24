const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { requireParent } = require('../middleware/auth');

router.use(requireParent);

router.get('/dashboard', parentController.getDashboard);

router.get('/suivi-scolaire', parentController.getSuiviScolaire);
router.get('/suivi-scolaire/:eleveId', parentController.getSuiviScolaire);

router.get('/horaires', parentController.getHoraires);

router.get('/messages', parentController.getMessages);
router.post('/messages', parentController.sendMessage);

module.exports = router;
