const LoggingService = require('../services/loggingService');
const analyticsDataService = require('../services/analyticsDataService');
const { PrismaClient } = require('@prisma/client');
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
            userRole: { not: null }
        },
        _count: { userRole: true }
    });

    // Documents les plus téléchargés
    const topDownloads = await prisma.siteLog.groupBy({
        by: ['url'],
        where: {
            ...whereClause,
            action: 'download'
        },
        _count: { url: true },
        orderBy: { _count: { url: 'desc' } },
        take: 10
    });

    // Recherches les plus fréquentes
    const topSearches = await prisma.siteLog.groupBy({
        by: ['searchQuery'],
        where: {
            ...whereClause,
            searchQuery: { not: null }
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
            userAgent: { not: null }
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
     * Page principale du dashboard Analytics (NOUVELLE VERSION DYNAMIQUE)
     */
    async getAnalyticsDashboard(req, res) {
        try {
            console.log('📊 Chargement de la page analytics dynamique...');

            // Récupérer toutes les données dynamiques
            const [
                generalStats,
                dailyVisits,
                deviceTypes,
                popularPages,
                hourlyTraffic
            ] = await Promise.all([
                analyticsDataService.getGeneralStats(30),
                analyticsDataService.getDailyVisits(30),
                analyticsDataService.getDeviceTypes(30),
                analyticsDataService.getPopularPages(30, 10),
                analyticsDataService.getHourlyTraffic(7)
            ]);

            console.log('📊 Données récupérées:', {
                visites: generalStats.totalVisits,
                visiteurs: generalStats.uniqueVisitors,
                pages: popularPages.length
            });

            res.render('pages/directeur/analytics', {
                title: 'Analytics et Statistiques',
                user: req.session.user,
                generalStats,
                dailyVisits: JSON.stringify(dailyVisits),
                deviceTypes,
                popularPages,
                hourlyTraffic: JSON.stringify(hourlyTraffic)
            });

        } catch (error) {
            console.error('❌ Erreur analytics dashboard:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du chargement des analytics',
                user: req.session.user
            });
        }
    },

    /**
     * API pour récupérer les statistiques (pour AJAX) - VERSION AMÉLIORÉE
     */
    async getAnalyticsData(req, res) {
        try {
            const { period = 30, type = 'all' } = req.query;
            console.log(`📊 Récupération données analytics: période=${period}, type=${type}`);

            let data = {};

            switch (type) {
                case 'general':
                    data = await analyticsDataService.getGeneralStats(period);
                    break;
                case 'daily':
                    data = await analyticsDataService.getDailyVisits(period);
                    break;
                case 'devices':
                    data = await analyticsDataService.getDeviceTypes(period);
                    break;
                case 'pages':
                    data = await analyticsDataService.getPopularPages(period, 10);
                    break;
                case 'hourly':
                    data = await analyticsDataService.getHourlyTraffic(7);
                    break;
                default:
                    data = {
                        general: await analyticsDataService.getGeneralStats(period),
                        daily: await analyticsDataService.getDailyVisits(period),
                        devices: await analyticsDataService.getDeviceTypes(period),
                        pages: await analyticsDataService.getPopularPages(period, 10),
                        hourly: await analyticsDataService.getHourlyTraffic(7)
                    };
            }

            res.json({ success: true, data });

        } catch (error) {
            console.error('❌ Erreur API analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des données'
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
            const { startDate, endDate, format = 'csv' } = req.query;
            console.log(`📤 Export demandé: ${startDate} -> ${endDate} (${format})`);

            // Récupérer les données pour la période
            const data = await analyticsDataService.getAnalyticsForExport(startDate, endDate);

            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=analytics_ecole_saint_mathieu.csv');

                // Convertir en CSV
                const csv = this.convertToCSV(data);
                res.send(csv);
            } else {
                res.json(data);
            }

        } catch (error) {
            console.error('❌ Erreur export:', error);
            res.status(500).json({ message: 'Erreur lors de l\'export' });
        }
    },

    convertToCSV(data) {
        if (!data.length) return 'Aucune donnée à exporter';

        const headers = ['Date', 'Heure', 'Route', 'IP', 'User Agent', 'Statut', 'Temps Réponse'];
        const rows = data.map(row => [
            row.timestamp.toISOString().split('T')[0],
            row.timestamp.toISOString().split('T')[1].split('.')[0],
            row.route || '',
            row.ip || '',
            row.userAgent || '',
            row.statusCode || '',
            row.responseTime || ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
};

module.exports = analyticsController;
