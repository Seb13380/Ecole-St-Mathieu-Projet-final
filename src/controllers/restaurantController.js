const express = require('express');

/**
 * Génère des données de test pour les réservations
 */
function generateTestReservations() {
    const reservations = [];
    const today = new Date();

    // Classes de test
    const classes = [
        { id: 1, nom: 'CP-A' },
        { id: 2, nom: 'CE1-B' },
        { id: 3, nom: 'CE2-A' },
        { id: 4, nom: 'CM1-B' },
        { id: 5, nom: 'CM2-A' }
    ];

    // Élèves de test
    const students = [
        { id: 1, firstName: 'Emma', lastName: 'Martin', classe: classes[0] },
        { id: 2, firstName: 'Lucas', lastName: 'Bernard', classe: classes[1] },
        { id: 3, firstName: 'Chloé', lastName: 'Dubois', classe: classes[0] },
        { id: 4, firstName: 'Hugo', lastName: 'Thomas', classe: classes[2] },
        { id: 5, firstName: 'Léa', lastName: 'Petit', classe: classes[1] },
        { id: 6, firstName: 'Nathan', lastName: 'Robert', classe: classes[3] },
        { id: 7, firstName: 'Inès', lastName: 'Richard', classe: classes[2] },
        { id: 8, firstName: 'Théo', lastName: 'Durand', classe: classes[4] },
        { id: 9, firstName: 'Clara', lastName: 'Leroy', classe: classes[3] },
        { id: 10, firstName: 'Maxime', lastName: 'Moreau', classe: classes[4] }
    ];

    // Générer des réservations pour les 30 derniers jours
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Ignorer les week-ends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        // Générer 5-15 réservations par jour
        const numReservations = Math.floor(Math.random() * 11) + 5;

        for (let j = 0; j < numReservations; j++) {
            const student = students[Math.floor(Math.random() * students.length)];

            // Déterminer le statut selon la date
            let status;
            if (i === 0) { // Aujourd'hui
                const rand = Math.random();
                if (rand < 0.6) status = 'CONSUMED';
                else if (rand < 0.8) status = 'RESERVED';
                else status = 'NO_SHOW';
            } else if (i < 7) { // Semaine passée
                const rand = Math.random();
                if (rand < 0.8) status = 'CONSUMED';
                else status = 'NO_SHOW';
            } else { // Plus ancien
                status = Math.random() < 0.9 ? 'CONSUMED' : 'NO_SHOW';
            }

            reservations.push({
                id: reservations.length + 1,
                student,
                mealDate: date.toISOString().split('T')[0],
                status,
                createdAt: new Date(date.getTime() - Math.random() * 86400000), // Créé max 1 jour avant
                consumedAt: status === 'CONSUMED' ? new Date(date.getTime() + Math.random() * 3600000) : null
            });
        }
    }

    return reservations;
}

const RestaurantController = {
    /**
     * Affiche le tableau de bord du restaurant avec les réservations du jour
     */
    async showDashboard(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Données de test simulées
            const testReservations = generateTestReservations();

            // Filtrer les réservations pour aujourd'hui
            const todayReservations = testReservations.filter(reservation => {
                const reservationDate = new Date(reservation.mealDate);
                reservationDate.setHours(0, 0, 0, 0);
                return reservationDate.getTime() === today.getTime();
            });

            // Statistiques
            const stats = {
                totalToday: todayReservations.length,
                served: todayReservations.filter(r => r.status === 'CONSUMED').length,
                pending: todayReservations.filter(r => r.status === 'RESERVED').length,
                noShow: todayReservations.filter(r => r.status === 'NO_SHOW').length
            };

            res.render('pages/restaurant/dashboard.twig', {
                pageTitle: 'Tableau de bord restaurant',
                todayReservations,
                stats,
                currentDate: today.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du dashboard restaurant:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement du tableau de bord'
            });
        }
    },

    /**
     * Marque un ticket comme consommé
     */
    async markAsConsumed(req, res) {
        try {
            const { reservationId } = req.body;

            if (!reservationId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de réservation manquant'
                });
            }

            // Dans un vrai projet, on mettrait à jour la base de données :
            // const reservation = await prisma.mealReservation.update({
            //     where: { id: parseInt(reservationId) },
            //     data: {
            //         status: 'CONSUMED',
            //         consumedAt: new Date()
            //     }
            // });

            console.log(`✅ Ticket ${reservationId} marqué comme consommé par ${req.user?.username || 'restaurant'}`);

            res.json({
                success: true,
                message: 'Ticket marqué comme consommé'
            });
        } catch (error) {
            console.error('Erreur lors du marquage du ticket:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du marquage du ticket'
            });
        }
    },

    /**
     * Marque un ticket comme "absent" (no-show)
     */
    async markAsNoShow(req, res) {
        try {
            const { reservationId } = req.body;

            if (!reservationId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de réservation manquant'
                });
            }

            // Dans un vrai projet :
            // const reservation = await prisma.mealReservation.update({
            //     where: { id: parseInt(reservationId) },
            //     data: {
            //         status: 'NO_SHOW',
            //         updatedAt: new Date()
            //     }
            // });

            console.log(`❌ Ticket ${reservationId} marqué comme absent par ${req.user?.username || 'restaurant'}`);

            res.json({
                success: true,
                message: 'Ticket marqué comme absent'
            });
        } catch (error) {
            console.error('Erreur lors du marquage absence:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du marquage absence'
            });
        }
    },

    /**
     * Affiche l'historique des repas avec recherche et filtres
     */
    async showHistory(req, res) {
        try {
            const { date, status, search } = req.query;

            // Générer des données de test pour l'historique
            let reservations = generateTestReservations();

            // Appliquer les filtres
            if (date) {
                const filterDate = new Date(date);
                filterDate.setHours(0, 0, 0, 0);
                reservations = reservations.filter(r => {
                    const rDate = new Date(r.mealDate);
                    rDate.setHours(0, 0, 0, 0);
                    return rDate.getTime() === filterDate.getTime();
                });
            }

            if (status && status !== 'ALL') {
                reservations = reservations.filter(r => r.status === status);
            }

            if (search) {
                const searchLower = search.toLowerCase();
                reservations = reservations.filter(r =>
                    r.student.firstName.toLowerCase().includes(searchLower) ||
                    r.student.lastName.toLowerCase().includes(searchLower) ||
                    r.student.classe.nom.toLowerCase().includes(searchLower)
                );
            }

            // Trier par date décroissante
            reservations.sort((a, b) => new Date(b.mealDate) - new Date(a.mealDate));

            res.render('pages/restaurant/history.twig', {
                pageTitle: 'Historique des repas',
                reservations,
                filters: { date, status, search }
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage de l\'historique:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement de l\'historique'
            });
        }
    },

    /**
     * Affiche les statistiques détaillées
     */
    async showStats(req, res) {
        try {
            const reservations = generateTestReservations();

            // Calculer les statistiques
            const stats = calculateStats(reservations);

            res.render('pages/restaurant/stats.twig', {
                pageTitle: 'Statistiques',
                stats
            });
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement des statistiques'
            });
        }
    }
};

/**
 * Calcule les statistiques détaillées
 */
function calculateStats(reservations) {
    const stats = {
        total: reservations.length,
        consumed: reservations.filter(r => r.status === 'CONSUMED').length,
        noShow: reservations.filter(r => r.status === 'NO_SHOW').length,
        reserved: reservations.filter(r => r.status === 'RESERVED').length
    };

    // Statistiques par classe
    const classeStats = {};
    reservations.forEach(r => {
        const className = r.student.classe.nom;
        if (!classeStats[className]) {
            classeStats[className] = {
                total: 0,
                consumed: 0,
                noShow: 0
            };
        }
        classeStats[className].total++;
        if (r.status === 'CONSUMED') classeStats[className].consumed++;
        if (r.status === 'NO_SHOW') classeStats[className].noShow++;
    });

    // Statistiques par jour des 7 derniers jours
    const dailyStats = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        if (date.getDay() !== 0 && date.getDay() !== 6) { // Pas de week-end
            const dateStr = date.toISOString().split('T')[0];
            const dayReservations = reservations.filter(r => r.mealDate === dateStr);

            dailyStats.push({
                date: dateStr,
                dateFormatted: date.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                }),
                total: dayReservations.length,
                consumed: dayReservations.filter(r => r.status === 'CONSUMED').length,
                noShow: dayReservations.filter(r => r.status === 'NO_SHOW').length
            });
        }
    }

    return {
        global: stats,
        classes: classeStats,
        daily: dailyStats,
        consumptionRate: stats.total > 0 ? Math.round((stats.consumed / stats.total) * 100) : 0,
        noShowRate: stats.total > 0 ? Math.round((stats.noShow / stats.total) * 100) : 0
    };
}

module.exports = RestaurantController;
