const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth, requireRole } = require('../middleware/auth');

/**
 * 📊 ROUTES ANALYTICS - STATISTIQUES DU SITE
 * Accessible uniquement aux administrateurs et direction
 */

// Middleware d'authentification et de rôle
router.use(requireAuth);
router.use(requireRole(['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE']));

// Dashboard principal des analytics
router.get('/', analyticsController.getAnalyticsDashboard);

// API pour récupérer les données (AJAX)
router.get('/data', analyticsController.getAnalyticsData);

// Statistiques détaillées par période
router.get('/stats/:type/:period', analyticsController.getDetailedStats);

// Export des logs en CSV
router.get('/export', analyticsController.exportLogsCSV);

module.exports = router;
