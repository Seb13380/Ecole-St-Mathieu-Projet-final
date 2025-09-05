const LoggingService = require('../services/loggingService');

/**
 * 🔍 MIDDLEWARE DE LOGGING AUTOMATIQUE
 * Enregistre automatiquement toutes les requêtes HTTP
 */

const loggingMiddleware = (req, res, next) => {
    const startTime = Date.now();

    // Intercepter la réponse pour calculer le temps de traitement
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    res.send = function (body) {
        const responseTime = Date.now() - startTime;

        // Log de la requête de manière asynchrone pour ne pas bloquer
        setImmediate(() => {
            LoggingService.logRequest(req, res, responseTime).catch(console.error);
        });

        return originalSend.call(this, body);
    };

    res.json = function (body) {
        const responseTime = Date.now() - startTime;

        setImmediate(() => {
            LoggingService.logRequest(req, res, responseTime).catch(console.error);
        });

        return originalJson.call(this, body);
    };

    res.end = function (chunk, encoding) {
        const responseTime = Date.now() - startTime;

        setImmediate(() => {
            LoggingService.logRequest(req, res, responseTime).catch(console.error);
        });

        return originalEnd.call(this, chunk, encoding);
    };

    next();
};

/**
 * Middleware pour logger des actions spécifiques
 */
const logAction = (action, getDetails = null) => {
    return (req, res, next) => {
        setImmediate(() => {
            const details = getDetails ? getDetails(req, res) : {};
            LoggingService.logAction(req, action, details).catch(console.error);
        });
        next();
    };
};

/**
 * Middleware pour logger les erreurs
 */
const errorLoggingMiddleware = (err, req, res, next) => {
    const responseTime = Date.now() - (req.startTime || Date.now());

    setImmediate(() => {
        LoggingService.logRequest(req, res, responseTime, err).catch(console.error);
    });

    next(err);
};

module.exports = {
    loggingMiddleware,
    logAction,
    errorLoggingMiddleware
};
