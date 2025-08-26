const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const directeurController = {
    // Afficher le tableau de bord du directeur
    dashboard: async (req, res) => {
        try {
            console.log('🏫 Accès au tableau de bord directeur');

            // Vérifier que l'utilisateur est bien directeur
            if (req.session.user.role !== 'DIRECTION') {
                return res.status(403).render('pages/error.twig', {
                    message: 'Accès refusé - Réservé au directeur'
                });
            }

            // Récupérer les statistiques
            const stats = await Promise.all([
                prisma.user.count(),
                prisma.student.count(),
                prisma.classe.count(),
                prisma.message.count(),
                prisma.actualite.count(),
                prisma.travaux.count()
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

            res.render('pages/directeur/dashboard.twig', {
                title: 'Tableau de bord - Directeur',
                user: req.session.user,
                stats: {
                    totalUsers: stats[0],
                    totalStudents: stats[1],
                    totalClasses: stats[2],
                    totalMessages: stats[3],
                    totalActualites: stats[4],
                    totalTravaux: stats[5]
                },
                recentUsers,
                recentMessages
            });

        } catch (error) {
            console.error('❌ Erreur dashboard directeur:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement du tableau de bord'
            });
        }
    }
};

module.exports = directeurController;
