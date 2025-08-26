const express = require('express');
const router = express.Router();
const { requireDirection, requireAdmin } = require('../middleware/auth');
const inscriptionController = require('../controllers/inscriptionController');

// Route pour afficher les demandes d'inscription (direction et admin)
router.get('/manage', requireDirection, (req, res) => {
    // Rediriger vers la page admin des inscriptions
    res.redirect('/admin/inscriptions');
});

// Redirections pour éviter les erreurs 404
router.get('/:id/details', requireDirection, (req, res) => {
    const { id } = req.params;
    res.redirect(`/admin/inscriptions/${id}/details`);
});

// Routes d'approbation et de rejet qui utilisent directement le contrôleur
router.post('/:id/approve', requireDirection, inscriptionController.approveRequest);
router.post('/:id/reject', requireDirection, inscriptionController.rejectRequest);

module.exports = router;
