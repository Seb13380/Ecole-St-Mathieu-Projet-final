const express = require('express');
const loginRoutes = require('./loginRoutes');
const registerRoutes = require('./registerRoutes');

const router = express.Router();

router.use('/login', loginRoutes);

router.use('/register', registerRoutes);

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
