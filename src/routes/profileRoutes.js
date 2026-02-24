const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');

// Afficher le profil
router.get('/profile',
    requireAuth,
    profileController.showProfile
);

// Formulaire d'édition du profil
router.get('/profile/edit',
    requireAuth,
    profileController.editProfile
);

// Mettre à jour le profil
router.post('/profile/edit',
    requireAuth,
    profileController.updateProfile
);

// Formulaire de changement de mot de passe
router.get('/profile/change-password',
    requireAuth,
    profileController.changePasswordForm
);

// Changer le mot de passe
router.post('/profile/change-password',
    requireAuth,
    profileController.changePassword
);

module.exports = router;
