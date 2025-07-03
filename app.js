const express = require("express");
const twig = require('twig');
const dotenv = require('dotenv');
const session = require("express-session");

dotenv.config();
const app = express();

// Middleware pour parser les données de formulaire
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // mettre à true en production avec HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Configuration Twig
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
  next();
});

// Fichiers statiques
app.use(express.static(__dirname + '/public'));

// Routes
const homeRoutes = require("./src/routes/homeRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const parentRoutes = require("./src/routes/parentRoutes");
const enseignantRoutes = require("./src/routes/enseignantRoutes");
const actualiteRoutes = require("./src/routes/actualiteRoutes");

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/parent', parentRoutes);
app.use('/enseignant', enseignantRoutes);
app.use('/actualites', actualiteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});