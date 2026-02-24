const express = require('express');
const router = express.Router();
const travauxController = require('../controllers/travauxController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Routes publiques
router.get('/', travauxController.showTravaux);
router.get('/list', travauxController.showTravaux);

// Routes admin - gestion des travaux
router.get('/manage', requireAdmin, travauxController.showManagement);
router.get('/management', requireAdmin, travauxController.showManagement);

// CRUD travaux
router.post('/create', requireAdmin, travauxController.createTravaux);
router.post('/:id/update', requireAdmin, travauxController.updateTravaux);
router.post('/:id/delete', requireAdmin, travauxController.deleteTravaux);
router.post('/:id/toggle-visibility', requireAdmin, travauxController.toggleVisibility);

// Routes RESTful pour compatibilité API
router.put('/:id', requireAdmin, travauxController.updateTravaux);
router.delete('/:id', requireAdmin, travauxController.deleteTravaux);
router.patch('/:id/toggle', requireAdmin, travauxController.toggleVisibility);

module.exports = router;
module.exports = router;
