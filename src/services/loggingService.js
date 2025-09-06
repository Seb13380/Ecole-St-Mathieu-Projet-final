const { PrismaClient } = require('@prisma/client');
const geoip = require('geoip-lite');

const prisma = new PrismaClient();

/**
 * 📊 SERVICE DE LOGGING POUR ANALYTICS
 * Enregistre toutes les activités du site pour statistiques
 */

class LoggingService {

    /**
     * Log une requête HTTP
     */
    static async logRequest(req, res, responseTime, error = null) {
        try {
            const startTime = Date.now();

            // Informations de base de la requête
            const logData = {
                method: req.method,
                url: req.originalUrl || req.url,
                route: req.route?.path || null,
                ip: this.getClientIP(req),
                userAgent: req.get('User-Agent') || null,
                referer: req.get('Referer') || null,
                responseTime: responseTime,
                statusCode: res.statusCode,
                timestamp: new Date()
            };

            // Informations utilisateur si connecté
            if (req.session?.user) {
                logData.userId = req.session.user.id;
                logData.userRole = req.session.user.role;
                logData.userEmail = req.session.user.email;
                logData.sessionId = req.sessionID;
            }

            // Déterminer le type d'action
            logData.action = this.determineAction(req);

            // Déterminer le type de ressource et son ID
            const resourceInfo = this.extractResourceInfo(req);
            if (resourceInfo) {
                logData.resourceType = resourceInfo.type;
                logData.resourceId = resourceInfo.id;
            }

            // Requête de recherche si applicable
            if (req.query.search || req.query.q) {
                logData.searchQuery = req.query.search || req.query.q;
            }

            // Message d'erreur si applicable
            if (error) {
                logData.errorMessage = error.message || error.toString();
            }

            // Géolocalisation approximative
            const geo = geoip.lookup(logData.ip);
            if (geo) {
                logData.country = geo.country;
                logData.city = geo.city;
            }

            // Enregistrer en base
            await prisma.siteLog.create({
                data: logData
            });

            console.log(`📊 Log: ${logData.method} ${logData.url} - ${logData.statusCode} (${responseTime}ms)`);

        } catch (logError) {
            // Ne pas faire échouer l'application si le logging échoue
            console.error('❌ Erreur logging:', logError);
        }
    }

    /**
     * Log une action spécifique (login, download, etc.)
     */
    static async logAction(req, action, details = {}) {
        try {
            const logData = {
                method: 'ACTION',
                url: req.originalUrl || req.url,
                action: action,
                ip: this.getClientIP(req),
                userAgent: req.get('User-Agent') || null,
                timestamp: new Date(),
                ...details
            };

            if (req.session?.user) {
                logData.userId = req.session.user.id;
                logData.userRole = req.session.user.role;
                logData.userEmail = req.session.user.email;
                logData.sessionId = req.sessionID;
            }

            await prisma.siteLog.create({
                data: logData
            });

            console.log(`📊 Action: ${action} par ${logData.userEmail || 'anonyme'}`);

        } catch (error) {
            console.error('❌ Erreur log action:', error);
        }
    }

    /**
     * Obtenir l'IP réelle du client
     */
    static getClientIP(req) {
        return req.ip ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['x-real-ip'] ||
            '127.0.0.1';
    }

    /**
     * Déterminer le type d'action basé sur la requête
     */
    static determineAction(req) {
        const url = req.originalUrl || req.url;
        const method = req.method;

        // Pages de connexion/déconnexion
        if (url.includes('/login')) return 'login_attempt';
        if (url.includes('/logout')) return 'logout';

        // Pages d'administration
        if (url.includes('/admin') || url.includes('/directeur')) return 'admin_access';

        // Téléchargements
        if (url.includes('/download') || url.includes('.pdf')) return 'download';

        // APIs
        if (url.includes('/api/')) return 'api_call';

        // Uploads
        if (method === 'POST' && url.includes('/upload')) return 'file_upload';

        // Pages spécifiques
        if (url.includes('/actualites')) return 'view_actualites';
        if (url.includes('/documents')) return 'view_documents';
        if (url.includes('/menus')) return 'view_menus';
        if (url.includes('/inscription')) return 'view_inscription';
        if (url.includes('/contact')) return 'view_contact';
        if (url.includes('/galerie')) return 'view_gallery';

        // Page d'accueil
        if (url === '/' || url === '/home') return 'view_home';

        // Défaut
        return method === 'GET' ? 'page_view' : 'form_submit';
    }

    /**
     * Extraire les informations de ressource de l'URL
     */
    static extractResourceInfo(req) {
        const url = req.originalUrl || req.url;

        // Actualités
        const actualiteMatch = url.match(/\/actualites\/(\d+)/);
        if (actualiteMatch) {
            return { type: 'actualite', id: parseInt(actualiteMatch[1]) };
        }

        // Documents
        const documentMatch = url.match(/\/documents\/(\d+)/);
        if (documentMatch) {
            return { type: 'document', id: parseInt(documentMatch[1]) };
        }

        // Menus
        const menuMatch = url.match(/\/menus\/(\d+)/);
        if (menuMatch) {
            return { type: 'menu', id: parseInt(menuMatch[1]) };
        }

        return null;
    }

    /**
     * Obtenir les statistiques du site
     */
    static async getStatistics(startDate = null, endDate = null) {
        try {
            const whereClause = {};

            if (startDate || endDate) {
                whereClause.timestamp = {};
                if (startDate) whereClause.timestamp.gte = new Date(startDate);
                if (endDate) whereClause.timestamp.lte = new Date(endDate);
            }

            // Statistiques générales
            const totalVisits = await prisma.siteLog.count({ where: whereClause });

            const uniqueVisitors = await prisma.siteLog.groupBy({
                by: ['ip'],
                where: whereClause,
                _count: { ip: true }
            });

            // Pages les plus visitées
            const topPages = await prisma.siteLog.groupBy({
                by: ['url'],
                where: { ...whereClause, method: 'GET' },
                _count: { url: true },
                orderBy: { _count: { url: 'desc' } },
                take: 10
            });

            // Actions les plus fréquentes
            const topActions = await prisma.siteLog.groupBy({
                by: ['action'],
                where: whereClause,
                _count: { action: true },
                orderBy: { _count: { action: 'desc' } },
                take: 10
            });

            // Utilisateurs les plus actifs
            const activeUsers = await prisma.siteLog.groupBy({
                by: ['userId', 'userEmail'],
                where: { ...whereClause, userId: { not: null } },
                _count: { userId: true },
                orderBy: { _count: { userId: 'desc' } },
                take: 10
            });

            // Répartition par rôle
            const userRoles = await prisma.siteLog.groupBy({
                by: ['userRole'],
                where: { ...whereClause, userRole: { not: null } },
                _count: { userRole: true }
            });

            // Erreurs les plus fréquentes
            const topErrors = await prisma.siteLog.groupBy({
                by: ['statusCode'],
                where: { ...whereClause, statusCode: { gte: 400 } },
                _count: { statusCode: true },
                orderBy: { _count: { statusCode: 'desc' } }
            });

            // Temps de réponse moyen
            const avgResponseTime = await prisma.siteLog.aggregate({
                where: { ...whereClause, responseTime: { not: null } },
                _avg: { responseTime: true }
            });

            // Visites par jour (7 derniers jours)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const dailyVisits = await prisma.siteLog.groupBy({
                by: ['timestamp'],
                where: {
                    timestamp: { gte: sevenDaysAgo },
                    method: 'GET'
                },
                _count: { timestamp: true }
            });

            return {
                totalVisits,
                uniqueVisitors: uniqueVisitors.length,
                topPages: topPages.map(p => ({ url: p.url, visits: p._count.url })),
                topActions: topActions.map(a => ({ action: a.action, count: a._count.action })),
                activeUsers: activeUsers.map(u => ({
                    userId: u.userId,
                    email: u.userEmail,
                    visits: u._count.userId
                })),
                userRoles: userRoles.map(r => ({ role: r.userRole, count: r._count.userRole })),
                topErrors: topErrors.map(e => ({ statusCode: e.statusCode, count: e._count.statusCode })),
                avgResponseTime: Math.round(avgResponseTime._avg.responseTime || 0),
                dailyVisits: this.formatDailyVisits(dailyVisits)
            };

        } catch (error) {
            console.error('❌ Erreur statistiques:', error);
            throw error;
        }
    }

    /**
     * Formater les visites quotidiennes pour les graphiques
     */
    static formatDailyVisits(dailyVisits) {
        const visitsByDay = {};
        const last7Days = [];

        // Créer les 7 derniers jours
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            last7Days.push(dateKey);
            visitsByDay[dateKey] = 0;
        }

        // Compter les visites par jour
        dailyVisits.forEach(visit => {
            const dateKey = visit.timestamp.toISOString().split('T')[0];
            if (visitsByDay[dateKey] !== undefined) {
                visitsByDay[dateKey] += visit._count.timestamp;
            }
        });

        return last7Days.map(date => ({
            date,
            visits: visitsByDay[date]
        }));
    }
}

module.exports = LoggingService;
