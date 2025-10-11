const LoggingService = require('../services/loggingService');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

/**
 * Statistiques additionnelles spécifiques à l'école
 */
async function getAdditionalStats(startDate, endDate) {
    const whereClause = {};
    if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp.gte = new Date(startDate);
        if (endDate) whereClause.timestamp.lte = new Date(endDate);
    }

    // Connexions par rôle
    const loginsByRole = await prisma.siteLog.groupBy({
        by: ['userRole'],
        where: {
            ...whereClause,
            action: 'login_attempt',
            statusCode: 200,
            userRole: { not: '' }
        },
        _count: { userRole: true }
    });

    // Documents les plus téléchargés (filtrer uniquement les fichiers existants)
    const allDownloads = await prisma.siteLog.groupBy({
        by: ['url'],
        where: {
            ...whereClause,
            action: 'download',
            url: { not: '' }
        },
        _count: { url: true },
        orderBy: { _count: { url: 'desc' } },
        take: 20 // Prendre plus pour pouvoir filtrer
    });

    // Filtrer uniquement les fichiers qui existent vraiment
    const topDownloads = [];
    for (const download of allDownloads) {
        if (topDownloads.length >= 10) break;

        try {
            // Construire le chemin vers le fichier
            const filePath = path.join(process.cwd(), 'public', download.url);

            // Vérifier si le fichier existe
            if (fs.existsSync(filePath)) {
                topDownloads.push(download);
            }
        } catch (error) {
            // Si erreur, ne pas inclure ce fichier
        }
    }

    // Recherches les plus fréquentes
    const topSearches = await prisma.siteLog.groupBy({
        by: ['searchQuery'],
        where: {
            ...whereClause,
            searchQuery: { not: '' }
        },
        _count: { searchQuery: true },
        orderBy: { _count: { searchQuery: 'desc' } },
        take: 10
    });

    // Heures de pointe
    const hourlyTraffic = await prisma.$queryRaw`
        SELECT HOUR(timestamp) as hour, COUNT(*) as visits
        FROM SiteLog 
        WHERE timestamp >= ${startDate} AND timestamp <= ${endDate}
        GROUP BY HOUR(timestamp)
        ORDER BY hour
    `;

    // Appareils utilisés (mobile vs desktop)
    const deviceTypes = await prisma.siteLog.groupBy({
        by: ['userAgent'],
        where: {
            ...whereClause,
            userAgent: { not: '' }
        },
        _count: { userAgent: true }
    });

    // Analyser les types d'appareils
    const deviceStats = analyzeDeviceTypes(deviceTypes);

    return {
        loginsByRole: loginsByRole.map(l => ({
            role: l.userRole,
            logins: l._count.userRole
        })),
        topDownloads: topDownloads.map(d => ({
            url: d.url,
            downloads: d._count.url
        })),
        topSearches: topSearches.map(s => ({
            query: s.searchQuery,
            count: s._count.searchQuery
        })),
        hourlyTraffic: hourlyTraffic.map(h => ({
            hour: h.hour,
            visits: Number(h.visits)
        })),
        deviceStats
    };
}

/**
 * Analyser les types d'appareils à partir des User Agents
 */
function analyzeDeviceTypes(deviceTypes) {
    let mobile = 0;
    let desktop = 0;
    let tablet = 0;
    let other = 0;

    deviceTypes.forEach(device => {
        const ua = device.userAgent.toLowerCase();
        const count = device._count.userAgent;

        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            mobile += count;
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
            tablet += count;
        } else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari')) {
            desktop += count;
        } else {
            other += count;
        }
    });

    const total = mobile + desktop + tablet + other;

    return {
        mobile: { count: mobile, percentage: total > 0 ? Math.round((mobile / total) * 100) : 0 },
        desktop: { count: desktop, percentage: total > 0 ? Math.round((desktop / total) * 100) : 0 },
        tablet: { count: tablet, percentage: total > 0 ? Math.round((tablet / total) * 100) : 0 },
        other: { count: other, percentage: total > 0 ? Math.round((other / total) * 100) : 0 }
    };
}

/**
 * Générer un fichier CSV à partir des logs
 */
function generateCSV(logs) {
    const headers = [
        'Date/Heure',
        'Utilisateur',
        'Rôle',
        'Action',
        'URL',
        'Méthode',
        'Code Statut',
        'Temps Réponse (ms)',
        'IP',
        'Pays',
        'Ville'
    ];

    const csvLines = [headers.join(',')];

    logs.forEach(log => {
        const line = [
            log.timestamp.toISOString(),
            log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Anonyme',
            log.userRole || 'N/A',
            log.action || 'N/A',
            `"${log.url}"`,
            log.method,
            log.statusCode || 'N/A',
            log.responseTime || 'N/A',
            log.ip,
            log.country || 'N/A',
            log.city || 'N/A'
        ];
        csvLines.push(line.join(','));
    });

    return csvLines.join('\n');
}

/**
 * Contrôleur pour les Analytics et Statistiques
 */
const analyticsController = {
    /**
     * Page principale du dashboard Analytics
     */
    async getAnalyticsDashboard(req, res) {
        try {
            // Période par défaut : 30 derniers jours
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            // Récupérer les statistiques générales
            const stats = await LoggingService.getStatistics(startDate, endDate);

            // Statistiques additionnelles spécifiques
            const additionalStats = await getAdditionalStats(startDate, endDate);

            res.render('pages/directeur/analytics.twig', {
                title: 'Analytics et Statistiques',
                user: req.session.user,
                stats,
                additionalStats,
                period: '30 derniers jours'
            });

        } catch (error) {
            console.error('❌ Erreur analytics dashboard:', error);
            res.status(500).render('pages/error.twig', {
                message: 'Erreur lors du chargement des statistiques'
            });
        }
    },

    /**
     * API pour récupérer les statistiques (pour AJAX)
     */
    async getAnalyticsData(req, res) {
        try {
            const { startDate, endDate, period } = req.query;

            const stats = await LoggingService.getStatistics(startDate, endDate);
            const additionalStats = await getAdditionalStats(startDate, endDate);

            res.json({
                success: true,
                data: {
                    stats,
                    additionalStats
                }
            });

        } catch (error) {
            console.error('❌ Erreur API analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques'
            });
        }
    },

    /**
     * Statistiques détaillées par période
     */
    async getDetailedStats(req, res) {
        try {
            const { type, period } = req.params;

            let startDate = new Date();

            switch (period) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
                default:
                    startDate.setDate(startDate.getDate() - 7);
            }

            const stats = await LoggingService.getStatistics(startDate, new Date());

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('❌ Erreur stats détaillées:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques détaillées'
            });
        }
    },

    /**
     * Export des logs en CSV
     */
    async exportLogsCSV(req, res) {
        try {
            const { startDate, endDate } = req.query;

            // Construire la clause WHERE pour la période
            const whereClause = {};
            if (startDate || endDate) {
                whereClause.timestamp = {};
                if (startDate) whereClause.timestamp.gte = new Date(startDate);
                if (endDate) whereClause.timestamp.lte = new Date(endDate);
            }

            const logs = await prisma.siteLog.findMany({
                where: whereClause,
                orderBy: { timestamp: 'desc' },
                take: 10000, // Limiter à 10k entrées pour éviter les gros exports
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: true
                        }
                    }
                }
            });

            // Générer le CSV
            const csv = generateCSV(logs);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="logs_ecole_saint_mathieu.csv"');
            res.send(csv);

        } catch (error) {
            console.error('❌ Erreur export logs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'export des logs'
            });
        }
    }
};

module.exports = analyticsController;
