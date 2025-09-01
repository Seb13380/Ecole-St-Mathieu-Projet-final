const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const secretaireController = {
    // Dashboard secrétaire
    dashboard: async (req, res) => {
        try {
            console.log('📋 Accès au tableau de bord secrétaire');

            // Vérifier que l'utilisateur a les droits
            if (!['SECRETAIRE_DIRECTION', 'DIRECTION', 'ADMIN'].includes(req.session.user.role)) {
                return res.status(403).render('pages/error.twig', {
                    message: 'Accès refusé - Réservé au secrétariat'
                });
            }

            // Récupérer les statistiques
            const stats = await Promise.all([
                prisma.classe.count(),
                prisma.student.count(),
                prisma.contact.count(),
                prisma.inscriptionRequest.count({ where: { status: 'PENDING' } })
            ]);

            res.render('pages/secretaire/dashboard.twig', {
                title: 'Secrétariat - Tableau de bord',
                user: req.session.user,
                stats: {
                    totalClasses: stats[0],
                    totalStudents: stats[1],
                    totalMessages: stats[2],
                    pendingInscriptions: stats[3]
                }
            });

        } catch (error) {
            console.error('❌ Erreur dashboard secrétaire:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement du tableau de bord'
            });
        }
    },

    // Consulter les listes d'élèves reçues
    async getClassLists(req, res) {
        try {
            const classes = await prisma.classe.findMany({
                include: {
                    students: {
                        include: {
                            parent: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        },
                        orderBy: { lastName: 'asc' }
                    }
                },
                orderBy: { nom: 'asc' }
            });

            res.render('pages/secretaire/class-lists.twig', {
                title: 'Listes d\'élèves',
                user: req.session.user,
                classes
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des listes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des listes',
                user: req.session.user
            });
        }
    }
};

module.exports = secretaireController;
