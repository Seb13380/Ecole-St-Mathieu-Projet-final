const express = require('express');
const router = express.Router();
const actualiteController = require('../controllers/actualiteController');
const { requireAuth, requireDirection } = require('../middleware/auth');
const uploadActualites = require('../../middleware/uploadActualites');

router.get('/', actualiteController.getActualites);

router.get('/manage', requireDirection, actualiteController.getActualitesManagement);
router.post('/', requireDirection, uploadActualites.single('media'), actualiteController.createActualite);
router.put('/:id', requireDirection, uploadActualites.single('media'), actualiteController.updateActualite);
router.post('/:id', requireDirection, uploadActualites.single('media'), actualiteController.updateActualite); // Route POST pour modification
router.delete('/:id', requireDirection, actualiteController.deleteActualite);
router.post('/:id/delete', requireDirection, actualiteController.deleteActualite); // Route POST pour suppression
router.patch('/:id/toggle-visibility', requireDirection, actualiteController.toggleVisibility);
router.post('/:id/toggle-visibility', requireDirection, actualiteController.toggleVisibility);

module.exports = router;
