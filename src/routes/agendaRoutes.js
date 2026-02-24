const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const { requireAuth } = require('../middleware/auth');

// Route pour afficher l'agenda (utilisateurs connectés)
router.get('/', requireAuth, agendaController.getAgenda);

// Route pour la gestion de l'agenda (admin seulement)
router.get('/manage', requireAuth, agendaController.getAgendaManagement);

// API pour récupérer les événements (format JSON) - DOIT être avant /events/:id
router.get('/api/events', requireAuth, agendaController.getEventsAPI);

// API Routes pour CRUD des événements
router.get('/events/:id', requireAuth, agendaController.getEventById);
router.post('/events', requireAuth, agendaController.createEvent);
router.put('/events/:id', requireAuth, agendaController.updateEvent);
router.delete('/events/:id', requireAuth, agendaController.deleteEvent);
router.patch('/events/:id/toggle', requireAuth, agendaController.toggleVisibility);

module.exports = router;
