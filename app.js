const express = require("express");
const twig = require('twig');
const dotenv = require('dotenv');
const session = require("express-session");

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // mettre à true en production avec HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

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

const homeRoutes = require("./src/routes/homeRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const directeurRoutes = require("./src/routes/directeurRoutes");
const parentRoutes = require("./src/routes/parentRoutes");
const enseignantRoutes = require("./src/routes/enseignantRoutes");
const actualiteRoutes = require("./src/routes/actualiteRoutes");
const restaurationRoutes = require("./src/routes/restaurationRoutes");
const menuPdfRoutes = require("./src/routes/menuPdfRoutes");
const contactRoutes = require('./src/routes/contactRoutes');
const frankRoutes = require("./src/routes/frankRoutes_new");
const ticketRoutes = require("./src/routes/ticketRoutes");
const restaurantRoutes = require("./src/routes/restaurantRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const parentInvitationRoutes = require("./src/routes/parentInvitationRoutes");

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/directeur', directeurRoutes);
app.use('/parent', parentRoutes);
app.use('/enseignant', enseignantRoutes);
app.use('/actualites', actualiteRoutes);
app.use('/restauration', restaurationRoutes);
app.use('/', menuPdfRoutes);
app.use('/frank', frankRoutes);
app.use('/parent', ticketRoutes);
app.use('/', restaurantRoutes);
app.use('/', profileRoutes);
app.use('/contact', contactRoutes);
app.use('/parent-invitations', parentInvitationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
