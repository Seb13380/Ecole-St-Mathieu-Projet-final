const express = require('express');
const router = express.Router();
const actualiteController = require('../controllers/actualiteController-simple');

// Route de test
router.get('/test', (req, res) => {
    res.json({ message: 'Routes actualités OK!', date: new Date() });
});

// 🔍 CONSULTATION PUBLIQUE
router.get('/', actualiteController.getActualites);

// 🛠️ GESTION ACTUALITÉS
router.get('/manage', actualiteController.getActualitesManagement);
router.get('/gestion', actualiteController.getActualitesManagement);

// Actions CRUD
router.post('/', actualiteController.createActualiteWithUpload);
router.put('/:id', actualiteController.updateActualite);
router.delete('/:id', actualiteController.deleteActualite);
router.patch('/:id/toggle-visibility', actualiteController.toggleVisibility);

module.exports = router;
