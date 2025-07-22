const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ticketController = {    // Afficher la page d'achat de tickets
    showPurchasePage: async (req, res) => {
        try {
            console.log('Accès à la page d\'achat de tickets');

            // DONNÉES DE TEST TEMPORAIRES - À supprimer quand MySQL sera configuré
            if (req.session.user.email === 'sebcecg@gmail.com') {
                const testChildren = [
                    {
                        id: 1,
                        firstName: 'Paul',
                        lastName: 'Test',
                        classe: { nom: 'CP-A' },
                        totalTicketsRemaining: 3 // Pour tester les alertes
                    },
                    {
                        id: 2,
                        firstName: 'Emma',
                        lastName: 'Test',
                        classe: { nom: 'CE1-B' },
                        totalTicketsRemaining: 12
                    }
                ];

                return res.render('pages/parent/tickets/purchase', {
                    title: 'Acheter des tickets de cantine',
                    children: testChildren,
                    user: req.session.user,
                    ticketPrice: 7.30,
                    bookletPrice: 73.00,
                    success: req.query.success,
                    error: req.query.error
                });
            }

            // Récupérer les enfants du parent connecté (version normale avec BDD)
            const children = await prisma.student.findMany({
                where: { parentId: req.session.user.id },
                include: {
                    classe: true,
                    TicketBooklet: {
                        where: { status: 'ACTIVE' },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            // Calculer les tickets restants pour chaque enfant
            const childrenWithTickets = children.map(child => {
                const totalTickets = child.TicketBooklet.reduce((sum, booklet) => sum + booklet.ticketsRemaining, 0);
                return {
                    ...child,
                    totalTicketsRemaining: totalTickets
                };
            });

            res.render('pages/parent/tickets/purchase', {
                title: 'Acheter des tickets de cantine',
                children: childrenWithTickets,
                user: req.session.user,
                ticketPrice: 7.30, // Prix par ticket
                bookletPrice: 73.00, // Prix d'un carnet de 10 tickets
                success: req.query.success,
                error: req.query.error
            });

        } catch (error) {
            console.error('❌ Erreur page achat tickets:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement de la page d\'achat'
            });
        }
    },    // Traiter l'achat de tickets
    processPurchase: async (req, res) => {
        try {
            console.log('Traitement achat tickets:', req.body);

            // SIMULATION POUR LE COMPTE TEST
            if (req.session.user.email === 'sebcecg@gmail.com') {
                const { studentId, quantity } = req.body;
                console.log('✅ Simulation achat réussi pour enfant ID:', studentId, 'Quantité:', quantity);
                return res.redirect('/parent/tickets/purchase?success=' + encodeURIComponent(`${quantity} tickets achetés avec succès ! (Mode test)`));
            }

            const { studentId, quantity } = req.body;
            const parentId = req.session.user.id;

            // Vérifier que l'enfant appartient bien au parent
            const student = await prisma.student.findFirst({
                where: {
                    id: parseInt(studentId),
                    parentId: parentId
                }
            });

            if (!student) {
                return res.redirect('/parent/tickets/purchase?error=' + encodeURIComponent('Enfant non trouvé'));
            }

            const ticketsQuantity = parseInt(quantity);
            const pricePerBooklet = 35.00;
            const totalAmount = (ticketsQuantity / 10) * pricePerBooklet;

            // Créer la transaction d'achat
            const purchase = await prisma.ticketPurchase.create({
                data: {
                    parentId: parentId,
                    studentId: parseInt(studentId),
                    amount: totalAmount,
                    ticketsQuantity: ticketsQuantity,
                    paymentMethod: 'STRIPE',
                    paymentStatus: 'PENDING'
                }
            });

            // Pour l'instant, simuler un paiement réussi
            // Plus tard, on intégrera Stripe ici

            // Créer le carnet de tickets
            const booklet = await prisma.ticketBooklet.create({
                data: {
                    parentId: parentId,
                    studentId: parseInt(studentId),
                    ticketsTotal: ticketsQuantity,
                    ticketsRemaining: ticketsQuantity,
                    price: totalAmount,
                    status: 'ACTIVE'
                }
            });

            // Mettre à jour le statut du paiement
            await prisma.ticketPurchase.update({
                where: { id: purchase.id },
                data: { paymentStatus: 'COMPLETED' }
            });

            console.log('✅ Achat tickets réussi:', booklet);
            res.redirect('/parent/tickets/purchase?success=' + encodeURIComponent(`${ticketsQuantity} tickets achetés avec succès !`));

        } catch (error) {
            console.error('❌ Erreur achat tickets:', error);
            res.redirect('/parent/tickets/purchase?error=' + encodeURIComponent('Erreur lors de l\'achat'));
        }
    },

    // Afficher les tickets de l'enfant
    showChildTickets: async (req, res) => {
        try {
            const studentId = parseInt(req.params.studentId);
            const parentId = req.session.user.id;

            // Vérifier que l'enfant appartient au parent
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
                        orderBy: { mealDate: 'desc' },
                        take: 10,
                        include: { ticketBooklet: true }
                    }
                }
            });

            if (!student) {
                return res.status(404).render('pages/error', {
                    message: 'Enfant non trouvé'
                });
            }

            const totalTickets = student.TicketBooklet.reduce((sum, booklet) => sum + booklet.ticketsRemaining, 0);

            res.render('pages/parent/tickets/child-tickets', {
                title: `Tickets de ${student.firstName}`,
                student: student,
                totalTicketsRemaining: totalTickets,
                user: req.session.user
            });

        } catch (error) {
            console.error('❌ Erreur affichage tickets enfant:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement des tickets'
            });
        }
    }
};

module.exports = ticketController;
