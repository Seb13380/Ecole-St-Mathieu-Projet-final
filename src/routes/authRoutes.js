const express = require('express');
const loginRoutes = require('./loginRoutes');
const parentInvitationController = require('../controllers/parentInvitationController');

const router = express.Router();

router.use('/login', loginRoutes);

// Redirection de l'ancien système d'inscription vers le nouveau système de pré-inscription
router.get('/register', (req, res) => {
    console.log('🔄 Redirection /auth/register vers /pre-inscription');
    res.redirect('/pre-inscription');
});

router.post('/register', (req, res) => {
    console.log('🔄 Redirection POST /auth/register vers /pre-inscription');
    res.redirect('/pre-inscription');
});

// Routes pour les invitations avec token
router.get('/register/:token', parentInvitationController.showRegistrationForm);
router.post('/register/:token', parentInvitationController.processInvitationRegistration);

router.get('/logout', (req, res) => {
    console.log('� Déconnexion directe pour:', req.session.user?.email);
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Erreur déconnexion:', err);
        }
        res.redirect('/?message=Déconnexion réussie');
    });
});

router.post('/logout', (req, res) => {
    console.log('🚪 Déconnexion POST pour:', req.session.user?.email);
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Erreur déconnexion:', err);
        }
        res.redirect('/?message=Déconnexion réussie');
    });
});

module.exports = router;
