const express = require('express');
const loginRoutes = require('./loginRoutes');
// const registerRoutes = require('./registerRoutes'); // Fichier non existant
const parentInvitationController = require('../controllers/parentInvitationController');

const router = express.Router();

router.use('/login', loginRoutes);

// router.use('/register', registerRoutes); // Fichier non existant

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
