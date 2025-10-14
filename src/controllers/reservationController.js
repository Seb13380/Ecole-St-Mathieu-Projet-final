const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const reservationController = {
    // Afficher le calendrier de réservation
    showCalendar: async (req, res) => {
        try {

            const studentId = parseInt(req.params.studentId);
            const parentId = req.session.user.id;

            // DONNÉES DE TEST TEMPORAIRES
            if (req.session.user.email === 'sebcecg@gmail.com') {
                const testStudent = {
                    id: studentId,
                    firstName: studentId === 1 ? 'Paul' : 'Emma',
                    lastName: 'Test',
                    classe: { nom: studentId === 1 ? 'CP-A' : 'CE1-B' },
                    totalTicketsRemaining: studentId === 1 ? 3 : 12
                };

                // Générer les dates du mois courant
                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();

                // Générer les réservations existantes (simulation)
                const existingReservations = [
                    { mealDate: new Date(currentYear, currentMonth, 5), status: 'RESERVED' },
                    { mealDate: new Date(currentYear, currentMonth, 12), status: 'CONSUMED' },
                    { mealDate: new Date(currentYear, currentMonth, 19), status: 'RESERVED' }
                ];

                return res.render('pages/parent/tickets/calendar', {
                    title: `Calendrier des repas - ${testStudent.firstName}`,
                    student: testStudent,
                    currentMonth: currentMonth,
                    currentYear: currentYear,
                    reservations: existingReservations,
                    user: req.session.user,
                    success: req.query.success,
                    error: req.query.error
                });
            }

            // Version normale avec BDD
            const student = await prisma.student.findFirst({
                where: {
                    id: studentId,
                    parentId: parentId
                },
                include: {
                    classe: true,
                    TicketBooklet: {
                        where: { status: 'ACTIVE' },
                        orderBy: { createdAt: 'desc' }
                    },
                    MealReservation: {
                        where: {
                            mealDate: {
                                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                            }
                        },
                        orderBy: { mealDate: 'asc' }
                    }
                }
            });

            if (!student) {
                return res.status(404).render('pages/error', {
                    message: 'Enfant non trouvé'
                });
            }

            const totalTickets = student.TicketBooklet.reduce((sum, booklet) => sum + booklet.ticketsRemaining, 0);
            student.totalTicketsRemaining = totalTickets;

            const today = new Date();

            res.render('pages/parent/tickets/calendar', {
                title: `Calendrier des repas - ${student.firstName}`,
                student: student,
                currentMonth: today.getMonth(),
                currentYear: today.getFullYear(),
                reservations: student.MealReservation,
                user: req.session.user,
                success: req.query.success,
                error: req.query.error
            });

        } catch (error) {
            console.error('❌ Erreur calendrier:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement du calendrier'
            });
        }
    },

    // Créer une réservation
    createReservation: async (req, res) => {
        try {

            const { studentId, mealDate } = req.body;
            const parentId = req.session.user.id;

            // SIMULATION POUR LE COMPTE TEST
            if (req.session.user.email === 'sebcecg@gmail.com') {
                return res.redirect(`/parent/tickets/calendar/${studentId}?success=` +
                    encodeURIComponent(`Repas réservé pour le ${new Date(mealDate).toLocaleDateString('fr-FR')} ! (Mode test)`));
            }

            // Vérifier que l'enfant appartient au parent
            const student = await prisma.student.findFirst({
                where: {
                    id: parseInt(studentId),
                    parentId: parentId
                },
                include: {
                    TicketBooklet: {
                        where: {
                            status: 'ACTIVE',
                            ticketsRemaining: { gt: 0 }
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });

            if (!student) {
                return res.redirect(`/parent/tickets/calendar/${studentId}?error=` +
                    encodeURIComponent('Enfant non trouvé'));
            }

            // Vérifier qu'il y a des tickets disponibles
            if (!student.TicketBooklet.length || student.TicketBooklet[0].ticketsRemaining <= 0) {
                return res.redirect(`/parent/tickets/calendar/${studentId}?error=` +
                    encodeURIComponent('Aucun ticket disponible. Veuillez en acheter.'));
            }

            // Vérifier que la date n'est pas déjà réservée
            const existingReservation = await prisma.mealReservation.findUnique({
                where: {
                    studentId_mealDate: {
                        studentId: parseInt(studentId),
                        mealDate: new Date(mealDate)
                    }
                }
            });

            if (existingReservation) {
                return res.redirect(`/parent/tickets/calendar/${studentId}?error=` +
                    encodeURIComponent('Ce jour est déjà réservé'));
            }

            // Créer la réservation
            const reservation = await prisma.mealReservation.create({
                data: {
                    studentId: parseInt(studentId),
                    mealDate: new Date(mealDate),
                    ticketBookletId: student.TicketBooklet[0].id,
                    status: 'RESERVED'
                }
            });

            // Décrémenter le nombre de tickets
            await prisma.ticketBooklet.update({
                where: { id: student.TicketBooklet[0].id },
                data: {
                    ticketsRemaining: { decrement: 1 }
                }
            });

            res.redirect(`/parent/tickets/calendar/${studentId}?success=` +
                encodeURIComponent(`Repas réservé pour le ${new Date(mealDate).toLocaleDateString('fr-FR')} !`));

        } catch (error) {
            console.error('❌ Erreur création réservation:', error);
            res.redirect(`/parent/tickets/calendar/${req.body.studentId}?error=` +
                encodeURIComponent('Erreur lors de la réservation'));
        }
    },

    // Annuler une réservation
    cancelReservation: async (req, res) => {
        try {
            const reservationId = parseInt(req.params.reservationId);
            const parentId = req.session.user.id;

            // SIMULATION POUR LE COMPTE TEST
            if (req.session.user.email === 'sebcecg@gmail.com') {
                return res.json({ success: true, message: 'Réservation annulée (Mode test)' });
            }

            // Vérifier que la réservation appartient au parent
            const reservation = await prisma.mealReservation.findFirst({
                where: { id: reservationId },
                include: {
                    student: true,
                    ticketBooklet: true
                }
            });

            if (!reservation || reservation.student.parentId !== parentId) {
                return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
            }

            // Vérifier que la réservation peut être annulée (pas encore consommée, et pas le jour même)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const mealDate = new Date(reservation.mealDate);
            mealDate.setHours(0, 0, 0, 0);

            if (mealDate <= today) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible d\'annuler une réservation le jour même ou passée'
                });
            }

            if (reservation.status === 'CONSUMED') {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible d\'annuler un repas déjà consommé'
                });
            }

            // Annuler la réservation
            await prisma.mealReservation.update({
                where: { id: reservationId },
                data: { status: 'CANCELLED' }
            });

            // Rendre le ticket
            await prisma.ticketBooklet.update({
                where: { id: reservation.ticketBookletId },
                data: {
                    ticketsRemaining: { increment: 1 }
                }
            });

            res.json({ success: true, message: 'Réservation annulée et ticket remboursé' });

        } catch (error) {
            console.error('❌ Erreur annulation réservation:', error);
            res.status(500).json({ success: false, message: 'Erreur lors de l\'annulation' });
        }
    }
};

module.exports = reservationController;
