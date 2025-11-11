const express = require("express");
const twig = require('twig');
const dotenv = require('dotenv');
const session = require("express-session");
const flash = require('connect-flash');
const methodOverride = require('method-override');
const { loggingMiddleware, errorLoggingMiddleware } = require('./src/middleware/loggingMiddleware');

dotenv.config();
const app = express();

// Configuration pour faire confiance au proxy Nginx
app.enable("trust proxy");

// Configuration CSP complète et correcte
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// DEBUG: Logger pour toutes les requêtes POST - DÉSACTIVÉ POUR PRODUCTION
// app.use((req, res, next) => {
//   if (req.method === 'POST') {
//     console.log('🔍 POST REQUEST:', req.originalUrl);
//     console.log('📝 Body keys:', req.body ? Object.keys(req.body) : 'undefined');
//     console.log('📝 Body size:', req.body ? Object.keys(req.body).length : 0);
//   }
//   next();
// });
app.use(methodOverride('_method'));

// Logger de requêtes - DÉSACTIVÉ POUR PRODUCTION
// app.use((req, res, next) => {
//   console.log(`📥 ${req.method} ${req.url}`);
//   next();
// });

// ⚡ OPTIMISATION PERFORMANCE - Cache statique agressif
// Cache optimisé pour images WebP et ressources statiques avec headers appropriés
app.use('/uploads', express.static(__dirname + '/public/uploads', {
  maxAge: '30d',           // Cache 30 jours pour images
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable'); // 30 jours
      res.setHeader('Vary', 'Accept-Encoding');
    } else if (/\.(jpg|jpeg|png|gif)$/i.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 jours pour anciennes images
    }
  }
}));

// Cache pour CSS/JS (7 jours)
app.use('/css', express.static(__dirname + '/public/css', {
  maxAge: '7d',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800');
  }
}));

app.use('/js', express.static(__dirname + '/public/js', {
  maxAge: '7d',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800');
  }
}));

// Cache pour assets (fonts, icons - 1 mois)
app.use('/assets', express.static(__dirname + '/public/assets', {
  maxAge: '30d',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
}));

// Fallback pour autres fichiers statiques (cache court)
app.use(express.static(__dirname + '/public', { maxAge: '1d' }));

// Protection spéciale pour les PDF de documents avec accès restreint
app.use('/uploads/documents', async (req, res, next) => {
  try {
    const documentPath = req.path;

    // Si ce n'est pas un PDF, laisser passer
    if (!documentPath.endsWith('.pdf')) {
      return next();
    }

    // Chercher le document dans la base de données par pdfUrl
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const document = await prisma.document.findFirst({
      where: {
        OR: [
          { pdfUrl: { contains: require('path').basename(documentPath) } },
          { pdfUrl: { endsWith: documentPath } }
        ]
      }
    });

    if (!document) {
      return next(); // Document non trouvé en base, laisser express.static gérer
    }

    // Types de documents publics (accès libre)
    const publicDocumentTypes = [
      'PROJET_EDUCATIF',
      'PROJET_ETABLISSEMENT',
      'REGLEMENT_INTERIEUR',
      'DOSSIER_INSCRIPTION',
      'PASTORALE_AXE',
      'PASTORALE_TEMPS_PRIANT',
      'PASTORALE_ENSEMBLE'
    ];

    // Si le document est public, laisser passer
    if (publicDocumentTypes.includes(document.type)) {
      return next();
    }

    // Sinon, vérifier l'authentification
    if (!req.session.user) {
      return res.status(401).json({
        error: 'Connexion requise pour accéder à ce document'
      });
    }

    next();

  } catch (error) {
    console.error('Erreur dans la protection PDF:', error);
    next(); // En cas d'erreur, laisser passer pour éviter de casser le site
  }
});

app.use('/uploads', express.static(__dirname + '/uploads'));

// ⚡ MONITORING PERFORMANCE - Détection des requêtes lentes
// Middleware pour identifier bottlenecks et optimiser performances
const performanceMonitoring = (req, res, next) => {
  const start = Date.now();
  const method = req.method;
  const url = req.originalUrl;

  // Hook sur la fin de la réponse
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (data) {
    logPerformance();
    return originalSend.call(this, data);
  };

  res.json = function (data) {
    logPerformance();
    return originalJson.call(this, data);
  };

  function logPerformance() {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const contentLength = res.get('Content-Length') || 0;

    // 🐌 Requêtes TRÈS lentes (> 3000ms)
    if (duration > 3000) {
      console.error(`🚨 CRITIQUE: ${method} ${url} - ${duration}ms - Status: ${status} - Size: ${contentLength}b`);
    }
    // ⚠️ Requêtes lentes (> 1000ms) - GARDER POUR MONITORING PRODUCTION
    else if (duration > 1000) {
      console.warn(`🐌 LENT: ${method} ${url} - ${duration}ms - Status: ${status} - Size: ${contentLength}b`);
    }
    // ⏰ Requêtes moyennes - DÉSACTIVÉ POUR PRODUCTION  
    // else if (duration > 500) {
    //   console.log(`⏰ MOYEN: ${method} ${url} - ${duration}ms - Status: ${status}`);
    // }
    // ✅ Requêtes rapides - DÉSACTIVÉ POUR PRODUCTION
    // else if (process.env.NODE_ENV === 'development' && duration > 100) {
    //   console.log(`✅ OK: ${method} ${url} - ${duration}ms`);
    // }

    // Alertes spécifiques pour images
    if (url.includes('/uploads/') && duration > 2000) {
      console.error(`📸 IMAGE TRÈS LENTE: ${url} - ${duration}ms - Convertir en WebP recommandé!`);
    }

    // Alertes pour menus restaurant
    if (url.includes('/menus') && duration > 1500) {
      console.warn(`🍽️ MENUS LENTS: ${url} - ${duration}ms - Vérifier base de données`);
    }
  }

  next();
};

// Activer le monitoring en développement et production
if (process.env.NODE_ENV !== 'test') {
  app.use(performanceMonitoring);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

app.use(loggingMiddleware);

app.set('views', __dirname + '/src/views');
app.set('view engine', 'twig');

twig.cache(false);
app.set('twig options', {
  allowAsync: true,
  strict_variables: false,
  cache: false
});

// Middleware pour rendre les variables de session disponibles dans les vues
app.use((req, res, next) => {
  // Debug temporaire - DÉSACTIVÉ POUR PRODUCTION
  // console.log('🔍 DEBUG SESSION:', {
  //   hasSession: !!req.session,
  //   hasUser: !!req.session?.user,
  //   user: req.session?.user,
  //   sessionID: req.sessionID,
  //   url: req.url
  // });
  
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  // Rendre les messages flash disponibles dans toutes les vues
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
});

// Routes
const homeRoutes = require("./src/routes/homeRoutes");
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const directeurRoutes = require('./src/routes/directeurRoutes');
const secretaireRoutes = require('./src/routes/secretaireRoutes');
const parentRoutes = require("./src/routes/parentRoutes");
const enseignantRoutes = require("./src/routes/enseignantRoutes");
const actualiteRoutes = require("./src/routes/actualiteRoutes");
const travauxRoutes = require("./src/routes/travauxRoutes");
const restaurationRoutes = require("./src/routes/restaurationRoutes");
const menuPdfRoutes = require("./src/routes/menuPdfRoutes");
const contactRoutes = require('./src/routes/contactRoutes');
const frankRoutes = require("./src/routes/frankRoutes_new");
const ticketRoutes = require("./src/routes/ticketRoutes");
const restaurantRoutes = require("./src/routes/restaurantRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const parentInvitationRoutes = require("./src/routes/parentInvitationRoutes");
const carouselRoutes = require("./src/routes/carouselRoutes");
const heroCarouselRoutes = require("./src/routes/heroCarouselRoutes");
const inscriptionsRoutes = require('./src/routes/inscriptions');
const galleryRoutes = require('./src/routes/galleryRoutes');
const credentialsController = require('./src/controllers/credentialsController');
const documentRoutes = require('./src/routes/documentRoutes');
const preInscriptionRoutes = require('./src/routes/preInscriptionRoutes');
const dossierInscriptionRoutes = require('./src/routes/dossierInscriptionRoutes');
const userManagementRoutes = require('./src/routes/userManagementRoutes');
const agendaRoutes = require('./src/routes/agendaRoutes');
const inscriptionManagementRoutes = require('./src/routes/inscriptionManagementRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/directeur', directeurRoutes);
app.use('/secretaire', secretaireRoutes);
app.use('/parent', parentRoutes);
app.use('/enseignant', enseignantRoutes);
app.use('/actualites', actualiteRoutes);
app.use('/travaux', travauxRoutes);
app.use('/restauration', restaurationRoutes);
app.use('/', menuPdfRoutes);
app.use('/frank', frankRoutes);
app.use('/parent', ticketRoutes);
app.use('/', restaurantRoutes);
app.use('/', profileRoutes);
app.use('/contact', contactRoutes);
app.use('/parent-invitations', parentInvitationRoutes);
app.use('/carousel', carouselRoutes);
app.use('/hero-carousel', heroCarouselRoutes);
app.use('/inscriptions', inscriptionsRoutes);
app.use('/gallery', galleryRoutes);
app.use('/documents', documentRoutes);
app.use('/pre-inscription', preInscriptionRoutes);
app.use('/dossier-inscription', dossierInscriptionRoutes);
app.use('/user-management', userManagementRoutes);
app.use('/agenda', agendaRoutes);
app.use('/inscription-management', inscriptionManagementRoutes);
app.use('/directeur/analytics', analyticsRoutes);

// Redirection de /inscription vers /inscription-eleve
app.get('/inscription', (req, res) => {
  res.redirect('/inscription-eleve');
});

// Routes pour demande d'identifiants (système séparé)
app.get('/demande-identifiants', credentialsController.showCredentialsForm);
app.post('/demande-identifiants', credentialsController.processCredentialsRequest);

// Route optionnelle pour /inscriptions qui redirige vers /admin/inscriptions
app.get('/inscriptions/manage', (req, res) => {
  if (req.session.user.role === 'DIRECTION' || req.session.user.role === 'ADMIN') {
    res.redirect('/admin/inscriptions');
  } else {
    res.status(403).render('pages/error', {
      message: 'Accès non autorisé',
      user: req.session.user
    });
  }
});

// Route de test pour le header responsive
app.get('/test-responsive', (req, res) => {
  res.sendFile(__dirname + '/test-responsive.html');
});

// 📊 Middleware de gestion des erreurs avec logging
app.use(errorLoggingMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
