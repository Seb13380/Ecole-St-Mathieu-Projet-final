const express = require('express');
const router = express.Router();
const actualiteController = require('../controllers/actualiteController');
const { requireAuth, requireDirection } = require('../middleware/auth');


router.get('/', actualiteController.getActualites);

router.get('/manage', requireDirection, actualiteController.getActualitesManagement);
router.post('/', requireDirection, actualiteController.createActualite);
router.put('/:id', requireDirection, actualiteController.updateActualite);
router.delete('/:id', requireDirection, actualiteController.deleteActualite);
router.patch('/:id/toggle-visibility', requireDirection, actualiteController.toggleVisibility);

module.exports = router;
