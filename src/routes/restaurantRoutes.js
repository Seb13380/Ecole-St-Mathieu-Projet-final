const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Tableau de bord restaurant
router.get('/restaurant',
    requireAuth,
    requireRole(['RESTAURANT', 'ADMIN']),
    restaurantController.showDashboard
);

router.get('/restaurant/dashboard',
    requireAuth,
    requireRole(['RESTAURANT', 'ADMIN']),
    restaurantController.showDashboard
);

// Marquer un ticket comme consommé
router.post('/restaurant/consume',
    requireAuth,
    requireRole(['RESTAURANT', 'ADMIN']),
    restaurantController.markAsConsumed
);

// Marquer un ticket comme absent
router.post('/restaurant/no-show',
    requireAuth,
    requireRole(['RESTAURANT', 'ADMIN']),
    restaurantController.markAsNoShow
);

// Historique des repas
router.get('/restaurant/history',
    requireAuth,
    requireRole(['RESTAURANT', 'ADMIN']),
    restaurantController.showHistory
);

// Statistiques
router.get('/restaurant/stats',
    requireAuth,
    requireRole(['RESTAURANT', 'ADMIN']),
    restaurantController.showStats
);

module.exports = router;
