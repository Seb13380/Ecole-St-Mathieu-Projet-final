const express = require('express');
const router = express.Router();
const actualiteController = require('../controllers/actualiteController');
const { requireAuth, requireRole } = require('../middleware/auth');

// 🔍 CONSULTATION PUBLIQUE (tous les utilisateurs connectés)
router.get('/', requireAuth, actualiteController.getActualites);

// 🛠️ GESTION ACTUALITÉS (selon permissions)
router.get('/gestion',
    requireAuth,
    actualiteController.getActualitesManagement
);

// 🛠️ ALIAS pour /manage (redirection vers /gestion)
router.get('/manage', requireAuth, (req, res) => {
    res.redirect('/actualites/gestion');
});

// ➕ CRÉATION ACTUALITÉ (avec upload)
router.post('/gestion',
    requireAuth,
    actualiteController.uploadMiddleware,
    actualiteController.createActualiteWithUpload
);

// ✏️ ÉDITION ACTUALITÉ
router.get('/:id/edit',
    requireAuth,
    actualiteController.getEditActualite
);

router.put('/:id',
    requireAuth,
    actualiteController.uploadMiddleware,
    actualiteController.updateActualite
);

// 🗑️ SUPPRESSION ACTUALITÉ
router.delete('/:id',
    requireAuth,
    actualiteController.deleteActualite
);

// 👁️ PUBLICATION/DÉPUBLICATION
router.patch('/:id/toggle-visibility',
    requireAuth,
    actualiteController.toggleVisibility
);

module.exports = router;
