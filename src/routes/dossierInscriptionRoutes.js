const express = require('express');
const router = express.Router();
const dossierInscriptionController = require('../controllers/dossierInscriptionController');
const { requireAuth } = require('../middleware/auth');

// Route publique : afficher le formulaire de dossier d'inscription
router.get('/', dossierInscriptionController.showForm);

// Route publique : traiter la soumission du dossier
router.post('/', dossierInscriptionController.submitDossier);

// Routes administratives - Redirection vers le système existant
router.get('/admin', requireAuth, (req, res) => {
    res.redirect('/directeur/inscriptions');
});

router.get('/admin/:id', requireAuth, (req, res) => {
    res.redirect(`/inscription/admin/request/${req.params.id}`);
});

module.exports = router;