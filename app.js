const express = require("express");
const twig = require('twig');
const dotenv = require('dotenv');
const session = require("express-session");
const flash = require('connect-flash');
const methodOverride = require('method-override');

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use(express.static(__dirname + '/public'));

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

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // mettre à true en production avec HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Configuration du middleware flash pour les messages temporaires
app.use(flash());

app.set('views', __dirname + '/src/views');
app.set('view engine', 'twig');

// Désactiver complètement le cache Twig en développement
twig.cache(false);
app.set('twig options', {
  allowAsync: true,
  strict_variables: false,
  cache: false
});

// Middleware pour rendre les variables de session disponibles dans les vues
app.use((req, res, next) => {
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
const documentRoutes = require('./src/routes/documentRoutes');
const preInscriptionRoutes = require('./src/routes/preInscriptionRoutes');
const userManagementRoutes = require('./src/routes/userManagementRoutes');
const agendaRoutes = require('./src/routes/agendaRoutes');
const inscriptionManagementRoutes = require('./src/routes/inscriptionManagementRoutes');

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/directeur', directeurRoutes);
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
app.use('/user-management', userManagementRoutes);
app.use('/agenda', agendaRoutes);
app.use('/inscription-management', inscriptionManagementRoutes);

// Redirection de /inscription vers /inscription-eleve
app.get('/inscription', (req, res) => {
  res.redirect('/inscription-eleve');
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
