const rateLimit = require('express-rate-limit');
const LoggingService = require('../services/loggingService');

const createFormLimiter = ({
    endpoint,
    windowMs,
    max,
    message,
    mode,
    redirectTo
}) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req, res) => rateLimit.ipKeyGenerator(req, res),
        handler: (req, res) => {
            setImmediate(() => {
                LoggingService.logAction(req, 'rate_limited', {
                    route: endpoint,
                    errorMessage: `Rate limit hit: ${max} per ${Math.round(windowMs / 1000)}s`,
                    userEmail: req.body?.parentEmail || req.body?.email || null
                }).catch(console.error);
            });

            const safeMessage = message || 'Trop de requêtes. Veuillez réessayer dans quelques minutes.';

            if (mode === 'query' && redirectTo) {
                const sep = redirectTo.includes('?') ? '&' : '?';
                return res.status(429).redirect(`${redirectTo}${sep}error=${encodeURIComponent(safeMessage)}`);
            }

            if (req.flash && redirectTo) {
                req.flash('error', safeMessage);
                return res.status(429).redirect(redirectTo);
            }

            return res.status(429).send(safeMessage);
        }
    });
};

const inscriptionEleveBurstLimiter = createFormLimiter({
    endpoint: 'POST /inscription-eleve (burst)',
    windowMs: 5 * 60 * 1000,
    max: 8,
    mode: 'flash',
    redirectTo: '/inscription-eleve'
});

const inscriptionEleveHourlyLimiter = createFormLimiter({
    endpoint: 'POST /inscription-eleve (hourly)',
    windowMs: 60 * 60 * 1000,
    max: 25,
    mode: 'flash',
    redirectTo: '/inscription-eleve'
});

const preInscriptionBurstLimiter = createFormLimiter({
    endpoint: 'POST /pre-inscription (burst)',
    windowMs: 5 * 60 * 1000,
    max: 8,
    mode: 'flash',
    redirectTo: '/pre-inscription'
});

const preInscriptionHourlyLimiter = createFormLimiter({
    endpoint: 'POST /pre-inscription (hourly)',
    windowMs: 60 * 60 * 1000,
    max: 25,
    mode: 'flash',
    redirectTo: '/pre-inscription'
});

const authRegisterBurstLimiter = createFormLimiter({
    endpoint: 'POST /auth/register (burst)',
    windowMs: 5 * 60 * 1000,
    max: 6,
    mode: 'query',
    redirectTo: '/auth/register'
});

const authRegisterHourlyLimiter = createFormLimiter({
    endpoint: 'POST /auth/register (hourly)',
    windowMs: 60 * 60 * 1000,
    max: 20,
    mode: 'query',
    redirectTo: '/auth/register'
});

module.exports = {
    inscriptionEleveBurstLimiter,
    inscriptionEleveHourlyLimiter,
    preInscriptionBurstLimiter,
    preInscriptionHourlyLimiter,
    authRegisterBurstLimiter,
    authRegisterHourlyLimiter
};
