const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Route pour le dashboard de Frank - avec vraies données
router.get('/dashboard', requireAuth, async (req, res) => {
    try {

        // Vérifier que l'utilisateur est bien Frank (DIRECTION ou GESTIONNAIRE_SITE)
        // Frank a maintenant le rôle DIRECTION mais doit garder l'accès à son dashboard spécifique
        if (!['GESTIONNAIRE_SITE', 'DIRECTION'].includes(req.session.user.role) ||
            !['frank.quaracino@orange.fr', 'frank@ecolestmathieu.com'].includes(req.session.user.email)) {
            return res.status(403).render('pages/error.twig', {
                message: 'Accès refusé - Réservé au gestionnaire',
                title: 'Accès refusé'
            });
        }

        // Récupérer les vraies statistiques
        const [totalUsers, totalStudents, totalClasses, totalMessages, totalActualites] = await Promise.all([
            prisma.user.count(),
            prisma.student.count(),
            prisma.classe.count(),
            prisma.message.count(),
            prisma.actualite.count()
        ]);

        // Récupérer les dernières actualités visibles pour Frank
        const recentActualites = await prisma.actualite.findMany({
            where: { visible: true },
            include: {
                auteur: {
                    select: { firstName: true, lastName: true, role: true }
                }
            },
            orderBy: { datePublication: 'desc' },
            take: 5
        });

        // Récupérer les derniers utilisateurs créés
        const recentUsers = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Récupérer les derniers messages
        const recentMessages = await prisma.message.findMany({
            include: {
                auteur: {
                    select: { firstName: true, lastName: true, role: true }
                },
                destinataire: {
                    select: { firstName: true, lastName: true, role: true }
                }
            },
            orderBy: { dateEnvoi: 'desc' },
            take: 5
        });

        res.render('pages/frank/dashboard.twig', {
            title: 'Tableau de bord - Frank',
            user: req.session.user,
            stats: {
                totalUsers,
                totalStudents,
                totalClasses,
                totalMessages,
                totalActualites
            },
            recentUsers,
            recentMessages,
            recentActualites
        });

    } catch (error) {
        console.error('❌ Erreur dashboard Frank:', error);
        res.status(500).render('pages/error.twig', {
            message: 'Erreur lors du chargement du dashboard',
            title: 'Erreur'
        });
    }
});

module.exports = router;
