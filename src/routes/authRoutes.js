const express = require('express');
const loginRoutes = require('./loginRoutes');
const parentInvitationController = require('../controllers/parentInvitationController');

const router = express.Router();

router.use('/login', loginRoutes);

// Routes de réinitialisation du mot de passe - Désactivées (controller supprimé)
router.get('/forgot-password', (req, res) => res.status(503).send('Service temporairement indisponible'));
router.post('/forgot-password', (req, res) => res.status(503).send('Service temporairement indisponible'));
router.get('/reset-password/:token', (req, res) => res.status(503).send('Service temporairement indisponible'));
router.post('/reset-password/:token', (req, res) => res.status(503).send('Service temporairement indisponible'));

// Routes pour l'inscription publique - Désactivées (controller supprimé)
router.get('/register', (req, res) => res.status(503).send('Service temporairement indisponible'));
router.post('/register', (req, res) => res.status(503).send('Service temporairement indisponible'));

// Routes pour les invitations avec token
router.get('/register/:token', parentInvitationController.showRegistrationForm);
router.post('/register/:token', parentInvitationController.processInvitationRegistration);

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Erreur déconnexion:', err);
        }
        res.redirect('/?message=Déconnexion réussie');
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Erreur déconnexion:', err);
        }
        res.redirect('/?message=Déconnexion réussie');
    });
});

module.exports = router;
