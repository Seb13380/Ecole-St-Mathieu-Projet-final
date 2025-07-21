const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const frankController = {
    // Afficher le tableau de bord de Frank
    dashboard: async (req, res) => {
        try {
            console.log('🏫 Accès au tableau de bord Frank');

            // Vérifier que l'utilisateur est bien Frank (MAINTENANCE_SITE)
            if (req.session.user.role !== 'MAINTENANCE_SITE') {
                return res.status(403).render('pages/error.twig', {
                    message: 'Accès refusé - Réservé au gestionnaire'
                });
            }

            // Récupérer les statistiques
            const stats = await Promise.all([
                prisma.user.count(),
                prisma.student.count(),
                prisma.classe.count(),
                prisma.message.count(),
                prisma.actualite.count()
            ]);

            // Récupérer les utilisateurs récents
            const recentUsers = await prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });

            // Récupérer les messages de contact non traités
            const recentMessages = await prisma.contact.findMany({
                where: { traite: false },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    nom: true,
                    email: true,
                    sujet: true,
                    createdAt: true
                }
            });

            res.render('pages/frank/dashboard.twig', {
                title: 'Tableau de bord - Frank',
                user: req.session.user,
                stats: {
                    totalUsers: stats[0],
                    totalStudents: stats[1],
                    totalClasses: stats[2],
                    totalMessages: stats[3],
                    totalActualites: stats[4]
                },
                recentUsers,
                recentMessages
            });

        } catch (error) {
            console.error('❌ Erreur dashboard Frank:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Une erreur est survenue lors du chargement du tableau de bord'
            });
        }
    }
};

module.exports = frankController;