const express = require('express');
const router = express.Router();
const travauxController = require('../controllers/travauxController');
const { requireAuth, requireDirection } = require('../middleware/auth');

// Route publique pour voir les travaux
router.get('/', travauxController.getTravaux);

// Routes de gestion (nécessite les permissions de direction)
router.get('/manage', requireDirection, travauxController.getTravauxManagement);
router.post('/', requireDirection, travauxController.createTravaux);
router.put('/:id', requireDirection, travauxController.updateTravaux);
router.post('/:id', requireDirection, travauxController.updateTravaux); // Route POST pour modification
router.delete('/:id', requireDirection, travauxController.deleteTravaux);
router.post('/:id/delete', requireDirection, travauxController.deleteTravaux); // Route POST pour suppression
router.patch('/:id/toggle-visibility', requireDirection, travauxController.toggleVisibility);
router.post('/:id/toggle-visibility', requireDirection, travauxController.toggleVisibility);

module.exports = router;
