const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const twig = require('twig');

// Import des routes
const homeRoutes = require('./src/routes/homeRoutes');
const authRoutes = require('./src/routes/authRoutes');
const actualitesRoutes = require('./src/routes/actualiteRoutes');
const travauxRoutes = require('./src/routes/travauxRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const parentRoutes = require('./src/routes/parentRoutes');
const enseignantRoutes = require('./src/routes/enseignantRoutes');
const directeurRoutes = require('./src/routes/directeurRoutes');
const heroCarouselRoutes = require('./src/routes/heroCarouselRoutes');
const carouselRoutes = require('./src/routes/carouselRoutes');
const userManagementRoutes = require('./src/routes/userManagementRoutes');

require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// Configuration du moteur de template Twig
app.set('view engine', 'twig');
app.set('views', path.join(__dirname, 'src/views'));

// Configuration Twig avec options
app.set('twig options', {
    allowAsync: true,
    strict_variables: false
});

// Configuration Twig
twig.extendFilter('dateFormat', function(value, format) {
    if (!value) return '';
    const date = new Date(value);
    
    switch(format) {
        case 'dd/mm/yyyy':
            return date.toLocaleDateString('fr-FR');
        case 'dd/mm/yyyy HH:mm':
            return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
        default:
            return date.toLocaleDateString('fr-FR');
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

app.use(flash());

// Limitation de taux pour éviter les abus
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limite chaque IP à 100 requêtes par fenêtre
});

app.use(limiter);

// Variables globales
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/actualites', actualitesRoutes);
app.use('/travaux', travauxRoutes);
app.use('/admin', adminRoutes);
app.use('/parent', parentRoutes);
app.use('/enseignant', enseignantRoutes);
app.use('/directeur', directeurRoutes);
app.use('/hero-carousel', heroCarouselRoutes);
app.use('/carousel', carouselRoutes);
app.use('/user-management', userManagementRoutes);

// Page 404
app.use((req, res) => {
    res.status(404).render('pages/error', {
        message: 'Page non trouvée',
        title: 'Erreur 404'
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).render('pages/error', {
        message: 'Erreur interne du serveur',
        title: 'Erreur 500'
    });
});

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

// Gestion de la déconnexion
app.get('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/?error=Erreur lors de la déconnexion');
        }
        res.clearCookie('connect.sid');
        res.redirect('/?success=Vous êtes déconnecté');
    });
});

module.exports = app;