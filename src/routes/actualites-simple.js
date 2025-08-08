const express = require('express');
const router = express.Router();
const actualiteController = require('../controllers/actualiteController-simple');

// Route simple pour tester
router.get('/test', (req, res) => {
    res.json({ message: 'Routes actualités fonctionnent !', timestamp: new Date() });
});

// 🔍 CONSULTATION PUBLIQUE 
router.get('/', actualiteController.getActualites);

// 🛠️ GESTION ACTUALITÉS (temporairement sans auth pour tester)
router.get('/gestion', actualiteController.getActualitesManagement);

// 🛠️ ALIAS pour /manage 
router.get('/manage', (req, res) => {
    console.log('🔄 Redirection de /manage vers /gestion');
    res.redirect('/actualites/gestion');
});

// Routes placeholder
router.post('/gestion', actualiteController.createActualiteWithUpload);
router.get('/:id/edit', actualiteController.getEditActualite);
router.put('/:id', actualiteController.updateActualite);
router.delete('/:id', actualiteController.deleteActualite);
router.patch('/:id/toggle-visibility', actualiteController.toggleVisibility);

module.exports = router;
