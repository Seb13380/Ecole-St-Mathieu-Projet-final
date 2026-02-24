const express = require('express');
const loginRoutes = require('./loginRoutes');
const passwordResetRoutes = require('./passwordResetRoutes');
const parentInvitationController = require('../controllers/parentInvitationController');
const inscriptionController = require('../controllers/inscriptionController');

const router = express.Router();

router.use('/login', loginRoutes);
router.use('/', passwordResetRoutes); // Routes pour forgot-password et reset-password

// Routes pour l'inscription publique
router.get('/register', inscriptionController.showRegistrationForm);
router.post('/register', inscriptionController.processRegistration);

// router.use('/register', registerRoutes); // Fichier non existant

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
