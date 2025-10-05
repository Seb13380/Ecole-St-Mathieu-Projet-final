const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Afficher l'agenda (accessible à tous les utilisateurs connectés)
const getAgenda = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est connecté
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        // Récupérer les événements selon le rôle de l'utilisateur
        let whereClause = {};

        if (req.session.user.role === 'DIRECTION' || req.session.user.role === 'GESTIONNAIRE_SITE' || req.session.user.role === 'SECRETAIRE_DIRECTION') {
            // La direction et la secrétaire voient tous les événements
            whereClause = {};
        } else {
            // Les autres utilisateurs connectés ne voient que les événements visibles
            whereClause = { visible: true };
        }

        const events = await prisma.agendaEvent.findMany({
            where: whereClause,
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: {
                dateDebut: 'asc'
            }
        });

        // Séparer les événements passés et à venir
        const now = new Date();
        const upcomingEvents = events.filter(event => new Date(event.dateDebut) >= now);
        const pastEvents = events.filter(event => new Date(event.dateDebut) < now);

        res.render('pages/agenda/agenda', {
            title: 'Agenda Scolaire',
            upcomingEvents,
            pastEvents,
            user: req.session.user
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'agenda:', error);
        res.status(500).render('pages/error', {
            message: 'Erreur lors du chargement de l\'agenda',
            title: 'Erreur',
            user: req.session.user
        });
    }
};

// Afficher la page de gestion de l'agenda (admin seulement)
const getAgendaManagement = async (req, res) => {
    try {
        // Vérifier les droits d'administration
        if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE', 'SECRETAIRE_DIRECTION'].includes(req.session.user.role)) {
            return res.status(403).render('pages/error', {
                message: 'Accès non autorisé',
                title: 'Erreur 403',
                user: req.session.user
            });
        }

        // Récupérer tous les événements
        const events = await prisma.agendaEvent.findMany({
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: {
                dateDebut: 'desc'
            }
        });

        res.render('pages/agenda/manage', {
            title: 'Gestion de l\'Agenda',
            events,
            user: req.session.user,
            successMessage: req.query.success,
            errorMessage: req.query.error
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        res.status(500).render('pages/error', {
            message: 'Erreur lors du chargement de la gestion agenda',
            title: 'Erreur',
            user: req.session.user
        });
    }
};

// Créer un nouvel événement
const createEvent = async (req, res) => {
    try {
        // Vérifier les droits d'administration
        if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const { titre, description, dateDebut, dateFin, heureDebut, heureFin, lieu, couleur, important, visible } = req.body;

        // Validation des données
        if (!titre || !dateDebut) {
            return res.status(400).json({
                success: false,
                message: 'Le titre et la date de début sont obligatoires'
            });
        }

        // Créer l'événement
        const event = await prisma.agendaEvent.create({
            data: {
                titre,
                description: description || null,
                dateDebut: new Date(dateDebut),
                dateFin: dateFin ? new Date(dateFin) : null,
                heureDebut: heureDebut || null,
                heureFin: heureFin || null,
                lieu: lieu || null,
                couleur: couleur || '#3b82f6',
                important: important === 'true' || important === true,
                visible: visible !== 'false',
                auteurId: req.session.user.id
            }
        });

        console.log('✅ Événement agenda créé:', event.titre);

        res.json({
            success: true,
            message: 'Événement créé avec succès',
            event
        });

    } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'événement'
        });
    }
};

// Modifier un événement
const updateEvent = async (req, res) => {
    try {
        // Vérifier les droits d'administration
        if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const { id } = req.params;
        const { titre, description, dateDebut, dateFin, heureDebut, heureFin, lieu, couleur, important, visible } = req.body;

        // Validation des données
        if (!titre || !dateDebut) {
            return res.status(400).json({
                success: false,
                message: 'Le titre et la date de début sont obligatoires'
            });
        }

        // Mettre à jour l'événement
        const event = await prisma.agendaEvent.update({
            where: { id: parseInt(id) },
            data: {
                titre,
                description: description || null,
                dateDebut: new Date(dateDebut),
                dateFin: dateFin ? new Date(dateFin) : null,
                heureDebut: heureDebut || null,
                heureFin: heureFin || null,
                lieu: lieu || null,
                couleur: couleur || '#3b82f6',
                important: important === 'true' || important === true,
                visible: visible !== 'false'
            }
        });

        console.log('✅ Événement agenda modifié:', event.titre);

        res.json({
            success: true,
            message: 'Événement modifié avec succès',
            event
        });

    } catch (error) {
        console.error('Erreur lors de la modification de l\'événement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de l\'événement'
        });
    }
};

// Supprimer un événement
const deleteEvent = async (req, res) => {
    try {
        // Vérifier les droits d'administration
        if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const { id } = req.params;

        // Supprimer l'événement
        await prisma.agendaEvent.delete({
            where: { id: parseInt(id) }
        });

        console.log('🗑️ Événement agenda supprimé ID:', id);

        res.json({
            success: true,
            message: 'Événement supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'événement'
        });
    }
};

// Basculer la visibilité d'un événement
const toggleVisibility = async (req, res) => {
    try {
        // Vérifier les droits d'administration
        if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const { id } = req.params;

        // Récupérer l'événement actuel
        const currentEvent = await prisma.agendaEvent.findUnique({
            where: { id: parseInt(id) }
        });

        if (!currentEvent) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        // Basculer la visibilité
        const event = await prisma.agendaEvent.update({
            where: { id: parseInt(id) },
            data: {
                visible: !currentEvent.visible
            }
        });

        console.log(`👁️ Événement agenda ${event.visible ? 'ouvert aux connectés' : 'réservé direction'}:`, event.titre);

        res.json({
            success: true,
            message: `Événement ${event.visible ? 'ouvert aux personnes connectées' : 'réservé à la direction'} avec succès`,
            visible: event.visible
        });

    } catch (error) {
        console.error('Erreur lors du changement de visibilité:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de visibilité'
        });
    }
};

// API pour récupérer les événements (format JSON pour calendrier)
const getEventsAPI = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est connecté
        if (!req.session.user) {
            return res.status(401).json({ error: 'Non autorisé' });
        }

        // Récupérer les événements selon le rôle de l'utilisateur
        let whereClause = {};

        if (req.session.user.role === 'DIRECTION' || req.session.user.role === 'GESTIONNAIRE_SITE' || req.session.user.role === 'SECRETAIRE_DIRECTION') {
            // La direction et la secrétaire voient tous les événements
            whereClause = {};
        } else {
            // Les autres utilisateurs connectés ne voient que les événements visibles
            whereClause = { visible: true };
        }

        const events = await prisma.agendaEvent.findMany({
            where: whereClause,
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: {
                dateDebut: 'asc'
            }
        });

        // Formater pour FullCalendar
        const formattedEvents = events.map(event => {
            const eventData = {
                id: event.id,
                title: event.titre,
                backgroundColor: event.couleur,
                borderColor: event.couleur,
                description: event.description,
                lieu: event.lieu,
                important: event.important,
                auteur: `${event.auteur.firstName} ${event.auteur.lastName}`
            };

            // Si l'événement a une heure précise, on l'inclut
            if (event.heureDebut) {
                // Créer une date complète avec l'heure
                const startDate = new Date(event.dateDebut);
                const [heureDebut, minuteDebut] = event.heureDebut.split(':');
                startDate.setHours(parseInt(heureDebut), parseInt(minuteDebut || '0'), 0, 0);

                eventData.start = startDate;

                if (event.heureFin && event.dateFin) {
                    const endDate = new Date(event.dateFin);
                    const [heureFin, minuteFin] = event.heureFin.split(':');
                    endDate.setHours(parseInt(heureFin), parseInt(minuteFin || '0'), 0, 0);
                    eventData.end = endDate;
                } else if (event.heureFin) {
                    const endDate = new Date(event.dateDebut);
                    const [heureFin, minuteFin] = event.heureFin.split(':');
                    endDate.setHours(parseInt(heureFin), parseInt(minuteFin || '0'), 0, 0);
                    eventData.end = endDate;
                }
            } else {
                // Événement "toute la journée" - on utilise seulement la date
                eventData.start = event.dateDebut.toISOString().split('T')[0]; // Format YYYY-MM-DD
                eventData.allDay = true;

                if (event.dateFin) {
                    eventData.end = event.dateFin.toISOString().split('T')[0];
                }
            }

            return eventData;
        });

        res.json(formattedEvents);

    } catch (error) {
        console.error('Erreur lors de la récupération des événements API:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Récupérer un événement spécifique (pour l'édition)
const getEventById = async (req, res) => {
    try {
        // Vérifier les droits d'administration
        if (!req.session.user || !['DIRECTION', 'GESTIONNAIRE_SITE'].includes(req.session.user.role)) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const { id } = req.params;

        const event = await prisma.agendaEvent.findUnique({
            where: { id: parseInt(id) },
            include: {
                auteur: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        // Formater les dates pour les champs input
        const formattedEvent = {
            ...event,
            dateDebut: event.dateDebut.toISOString().split('T')[0], // Format YYYY-MM-DD
            dateFin: event.dateFin ? event.dateFin.toISOString().split('T')[0] : null
        };

        res.json({
            success: true,
            event: formattedEvent
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'événement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'événement'
        });
    }
};

module.exports = {
    getAgenda,
    getAgendaManagement,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleVisibility,
    getEventsAPI,
    getEventById
};
