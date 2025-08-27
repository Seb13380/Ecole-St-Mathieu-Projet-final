// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
    console.log('🔐 Vérification auth - Session user:', req.session.user ? 'Présent' : 'Absent');
    if (!req.session.user) {
        console.log('❌ Redirection vers login - pas de session');
        return res.redirect('/auth/login?message=Vous devez être connecté pour accéder à cette page');
    }
    console.log('✅ Authentification OK pour:', req.session.user.email);
    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/auth/login?message=Vous devez être connecté pour accéder à cette page');
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.session.user.role)) {
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
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const allowedRoles = ['DIRECTION', 'ADMIN', 'GESTIONNAIRE_SITE'];
    if (!allowedRoles.includes(req.session.user.role)) {
        return res.status(403).render('pages/error', {
            message: 'Accès refusé. Réservé aux directeurs et gestionnaires.',
            user: req.session.user
        });
    }

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
    requireAPEL
};
