const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { requireAuth, requireDirection, requireDocumentManager } = require('../middleware/auth');
const uploadDocuments = require('../../middleware/uploadDocuments');

// Middleware de gestion d'erreur Multer
const handleMulterError = (err, req, res, next) => {
    if (err) {
        console.error('❌ ERREUR MULTER:', err);
        console.error('Type erreur:', err.code);
        console.error('Message:', err.message);

        let errorMessage = 'Erreur lors de l\'upload du fichier';

        if (err.code === 'LIMIT_FILE_SIZE') {
            errorMessage = 'Le fichier est trop volumineux (max 10MB)';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            errorMessage = 'Champ de fichier inattendu';
        } else if (err.message.includes('Type de fichier non autorisé')) {
            errorMessage = err.message;
        } else if (err.code === 'EACCES' || err.code === 'EPERM') {
            errorMessage = 'Erreur de permissions sur le serveur. Contactez l\'administrateur.';
            console.error('❌ PROBLÈME DE PERMISSIONS FICHIER!');
        } else {
            errorMessage = err.message || errorMessage;
        }

        return res.redirect('/documents/admin?error=' + encodeURIComponent(errorMessage));
    }
    next();
};

// Routes administratives AVANT les routes génériques (important pour l'ordre!)
// Accessible par DIRECTION, ADMIN, GESTIONNAIRE_SITE, SECRETAIRE_DIRECTION et APEL
router.get('/admin', requireDocumentManager, documentController.manageDocuments);
router.get('/admin/test', requireDocumentManager, documentController.testManage);
router.get('/admin/manage', requireDocumentManager, documentController.manageDocuments);
router.post('/admin/create', requireDocumentManager, uploadDocuments.single('pdf'), handleMulterError, documentController.createDocument);
router.put('/admin/:id', requireDocumentManager, uploadDocuments.single('pdf'), handleMulterError, documentController.updateDocument);
router.post('/admin/:id', requireDocumentManager, uploadDocuments.single('pdf'), handleMulterError, documentController.updateDocument);
router.delete('/admin/:id', requireDocumentManager, documentController.deleteDocument);
router.post('/admin/:id/delete', requireDocumentManager, documentController.deleteDocument);
router.patch('/admin/:id/toggle', requireDocumentManager, documentController.toggleDocument);
router.post('/admin/:id/toggle', requireDocumentManager, documentController.toggleDocument);

// Routes publiques SANS AUTHENTIFICATION (accès libre)
router.get('/show/:id', documentController.showPublicDocument); // /documents/show/123
router.get('/:category', documentController.getDocumentsByCategory); // /documents/ecole ou /documents/pastorale

module.exports = router;
