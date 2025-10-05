// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
    console.log('🔐 Vérification auth');
    console.log('📋 Session ID:', req.sessionID);
    console.log('📋 Session complète:', req.session);
    console.log('👤 Session user:', req.session.user ? 'Présent' : 'Absent');
    console.log('📋 Headers reçus:', {
        'accept': req.headers.accept,
        'content-type': req.headers['content-type'],
        'x-requested-with': req.headers['x-requested-with'],
        'cookie': req.headers.cookie,
        'xhr': req.xhr
    });

    if (!req.session.user) {
        console.log('❌ Redirection vers login - pas de session');

        // Si c'est une requête AJAX/API, renvoyer du JSON
        if (req.xhr ||
            req.headers.accept && req.headers.accept.indexOf('json') > -1 ||
            req.headers['content-type'] && req.headers['content-type'].indexOf('json') > -1 ||
            req.headers['x-requested-with'] === 'XMLHttpRequest') {
            console.log('🔄 Requête AJAX détectée - retour JSON');
            return res.status(401).json({
                success: false,
                error: 'Non authentifié',
                message: 'Vous devez être connecté pour accéder à cette page'
            });
        }

        console.log('🌐 Requête normale - redirection');
        return res.redirect('/auth/login?message=Vous devez être connecté pour accéder à cette page');
    }
    console.log('✅ Authentification OK pour:', req.session.user.email);
    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            // Si c'est une requête AJAX/API, renvoyer du JSON
            if (req.xhr ||
                req.headers.accept && req.headers.accept.indexOf('json') > -1 ||
                req.headers['content-type'] && req.headers['content-type'].indexOf('json') > -1 ||
                req.headers['x-requested-with'] === 'XMLHttpRequest') {
                return res.status(401).json({
                    success: false,
                    error: 'Non authentifié',
                    message: 'Vous devez être connecté pour accéder à cette page'
                });
            }
            return res.redirect('/auth/login?message=Vous devez être connecté pour accéder à cette page');
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.session.user.role)) {
            // Si c'est une requête AJAX/API, renvoyer du JSON
            if (req.xhr ||
                req.headers.accept && req.headers.accept.indexOf('json') > -1 ||
                req.headers['content-type'] && req.headers['content-type'].indexOf('json') > -1 ||
                req.headers['x-requested-with'] === 'XMLHttpRequest') {
                return res.status(403).json({
                    success: false,
                    error: 'Accès refusé',
                    message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page'
                });
            }
            return res.status(403).render('pages/error', {
                message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page',
                title: 'Accès refusé'
            });
        }

        next();
    };
};

const requireAdmin = (req, res, next) => {
    console.log('👑 Vérification admin - Session user:', req.session.user ? req.session.user.email : 'Absent');
    if (!req.session.user) {
        console.log('❌ Redirection vers login - pas de session admin');
        return res.redirect('/auth/login?message=Vous devez être connecté pour accéder à cette page');
    }

    const allowedRoles = ['ADMIN', 'DIRECTION', 'GESTIONNAIRE_SITE'];
    console.log('🎭 Rôle utilisateur:', req.session.user.role, 'Rôles autorisés:', allowedRoles);

    if (!allowedRoles.includes(req.session.user.role)) {
        console.log('❌ Accès refusé - rôle insuffisant');
        return res.status(403).render('pages/error', {
            message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page',
            title: 'Accès refusé',
            user: req.session.user
        });
    }

    console.log('✅ Accès admin autorisé');
    next();
};

const requireEnseignant = requireRole(['ENSEIGNANT', 'ADMIN', 'DIRECTION']);

const requireParent = requireRole(['PARENT', 'ADMIN', 'DIRECTION']);

const requireDirection = (req, res, next) => {
    console.log('🏢 Vérification DIRECTION - Session user:', req.session.user ? req.session.user.email : 'Absent');
    if (!req.session.user) {
        console.log('❌ Redirection vers login - pas de session direction');
        return res.redirect('/auth/login');
    }

    console.log('🎭 Rôle utilisateur:', req.session.user.role);
    const allowedRoles = ['DIRECTEUR', 'DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE', 'SECRETAIRE_DIRECTION'];
    if (!allowedRoles.includes(req.session.user.role)) {
        console.log('❌ Accès refusé - rôle insuffisant pour direction');
        return res.status(403).render('pages/error', {
            message: 'Accès refusé. Réservé aux directeurs, secrétaires et gestionnaires.',
            user: req.session.user
        });
    }

    console.log('✅ Accès direction autorisé');
    next();
};

const requireSecretary = (req, res, next) => {
    console.log('📋 Vérification SECRÉTAIRE - Session user:', req.session.user ? req.session.user.email : 'Absent');
    if (!req.session.user) {
        console.log('❌ Redirection vers login - pas de session secrétaire');
        return res.redirect('/auth/login');
    }

    console.log('🎭 Rôle utilisateur:', req.session.user.role);
    const allowedRoles = ['SECRETAIRE_DIRECTION', 'DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'];
    if (!allowedRoles.includes(req.session.user.role)) {
        console.log('❌ Accès refusé - rôle insuffisant pour secrétariat');
        return res.status(403).render('pages/error', {
            message: 'Accès refusé. Réservé au secrétariat de direction.',
            user: req.session.user
        });
    }

    console.log('✅ Accès secrétariat autorisé');
    next();
};

const requireAPEL = requireRole(['APEL', 'ADMIN', 'DIRECTION']);

module.exports = {
    requireAuth,
    requireRole,
    requireAdmin,
    requireEnseignant,
    requireParent,
    requireDirection,
    requireSecretary,
    requireAPEL
};
