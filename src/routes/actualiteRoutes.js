const express = require('express');
const router = express.Router();
const actualiteController = require('../controllers/actualiteController');
const { requireAuth, requireDirection } = require('../middleware/auth');
const uploadActualites = require('../../middleware/uploadActualites');

const uploadFields = uploadActualites.fields([
    { name: 'media', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
]);

router.get('/', actualiteController.getActualites);

router.get('/manage', requireDirection, actualiteController.getActualitesManagement);
router.post('/', requireDirection, uploadFields, actualiteController.createActualite);
router.put('/:id', requireDirection, uploadFields, actualiteController.updateActualite);
router.post('/:id', requireDirection, uploadFields, actualiteController.updateActualite); // Route POST pour modification
router.delete('/:id', requireDirection, actualiteController.deleteActualite);
router.post('/:id/delete', requireDirection, actualiteController.deleteActualite); // Route POST pour suppression
router.patch('/:id/toggle-visibility', requireDirection, actualiteController.toggleVisibility);
router.post('/:id/toggle-visibility', requireDirection, actualiteController.toggleVisibility);
router.post('/:id/documents/:documentId/delete', requireDirection, actualiteController.deleteDocument);

module.exports = router;

