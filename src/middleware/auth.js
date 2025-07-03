// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login?message=Vous devez être connecté pour accéder à cette page');
  }
  next();
};

// Middleware pour vérifier le rôle
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/auth/login?message=Vous devez être connecté pour accéder à cette page');
    }
    
    // roles peut être une string ou un array
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

// Middleware pour vérifier si c'est un admin
const requireAdmin = requireRole(['ADMIN', 'DIRECTION']);

// Middleware pour vérifier si c'est un enseignant
const requireEnseignant = requireRole(['ENSEIGNANT', 'ADMIN', 'DIRECTION']);

// Middleware pour vérifier si c'est un parent
const requireParent = requireRole(['PARENT', 'ADMIN', 'DIRECTION']);

// Middleware pour vérifier si c'est la direction ou admin
const requireDirection = requireRole(['DIRECTION', 'ADMIN']);

// Middleware pour vérifier si c'est APEL
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
