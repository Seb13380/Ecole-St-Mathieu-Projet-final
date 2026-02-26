const spamDetector = require('./spamDetector');
const LoggingService = require('../services/loggingService');

const toIntOrNull = (value) => {
    if (value === null || value === undefined) return null;
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : null;
};

const safeBodySnapshot = (body) => {
    if (!body || typeof body !== 'object') return {};

    const snapshot = {
        parentEmail: body.parentEmail || body.email || null,
        parentFirstName: body.parentFirstName || body.firstName || null,
        parentLastName: body.parentLastName || body.lastName || null,
        parentPhone: body.parentPhone || body.phone || null,
        anneeScolaire: body.anneeScolaire || null
    };

    if (body.children) {
        if (Array.isArray(body.children)) snapshot.childrenCount = body.children.length;
        else if (typeof body.children === 'object') snapshot.childrenCount = Object.keys(body.children).length;
    }

    return snapshot;
};

const shouldBlockFromReasons = (reasons) => {
    const text = (reasons || []).join(' | ').toLowerCase();

    // Raisons « fortes » => blocage
    return (
        text.includes('honeypot') ||
        text.includes('trop de requêtes') ||
        text.includes('rempli trop rapidement') ||
        text.includes('email suspect')
    );
};

const createSpamProtection = ({ endpoint, mode, redirectTo }) => {
    return (req, res, next) => {
        const formStartTime =
            toIntOrNull(req.body?.formStartTime) ??
            toIntOrNull(req.body?.formStart) ??
            toIntOrNull(req.body?.formStartTimeMs);

        const detection = spamDetector.detectSpam(req, formStartTime);
        req.spamDetection = detection;

        if (!detection.isSpam) return next();

        const bodySnapshot = safeBodySnapshot(req.body);

        setImmediate(() => {
            LoggingService.logAction(req, 'spam_detected', {
                route: endpoint,
                errorMessage: JSON.stringify({
                    riskLevel: detection.riskLevel,
                    reasons: detection.reasons,
                    body: bodySnapshot
                }),
                userEmail: bodySnapshot.parentEmail || null
            }).catch(console.error);
        });

        if (!shouldBlockFromReasons(detection.reasons)) {
            return next();
        }

        const message = 'Votre demande a été temporairement bloquée (protection anti-bot). Veuillez réessayer dans quelques minutes.';

        setImmediate(() => {
            LoggingService.logAction(req, 'spam_blocked', {
                route: endpoint,
                errorMessage: JSON.stringify({
                    riskLevel: detection.riskLevel,
                    reasons: detection.reasons,
                    body: bodySnapshot
                }),
                userEmail: bodySnapshot.parentEmail || null
            }).catch(console.error);
        });

        if (mode === 'query' && redirectTo) {
            const sep = redirectTo.includes('?') ? '&' : '?';
            return res.status(429).redirect(`${redirectTo}${sep}error=${encodeURIComponent(message)}`);
        }

        if (req.flash && redirectTo) {
            req.flash('error', message);
            return res.status(429).redirect(redirectTo);
        }

        return res.status(429).send(message);
    };
};

module.exports = {
    createSpamProtection
};
