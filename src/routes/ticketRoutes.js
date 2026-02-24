const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const reservationController = require('../controllers/reservationController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Routes pour les parents - achat de tickets
router.get('/tickets/purchase',
    requireAuth,
    requireRole(['PARENT', 'ADMIN']),
    ticketController.showPurchasePage
);

router.post('/tickets/purchase',
    requireAuth,
    requireRole(['PARENT', 'ADMIN']),
    ticketController.processPurchase
);

// Voir les tickets d'un enfant spécifique
router.get('/tickets/child/:studentId',
    requireAuth,
    requireRole(['PARENT', 'ADMIN']),
    ticketController.showChildTickets
);

// Routes pour le calendrier de réservation
router.get('/tickets/calendar/:studentId',
    requireAuth,
    requireRole(['PARENT', 'ADMIN']),
    reservationController.showCalendar
);

router.post('/tickets/reserve',
    requireAuth,
    requireRole(['PARENT', 'ADMIN']),
    reservationController.createReservation
);

router.post('/tickets/cancel',
    requireAuth,
    requireRole(['PARENT', 'ADMIN']),
    reservationController.cancelReservation
);

module.exports = router;
