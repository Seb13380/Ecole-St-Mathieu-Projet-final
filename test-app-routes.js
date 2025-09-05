// Test progressif de toutes les routes de app.js

console.log("Démarrage test progressif...");

try {
    const express = require('express');
    const app = express();

    console.log("Import des routes...");
    const authRoutes = require('./src/routes/authRoutes');
    console.log("✓ authRoutes");

    const adminRoutes = require('./src/routes/adminRoutes');
    console.log("✓ adminRoutes");

    const enseignantRoutes = require('./src/routes/enseignantRoutes');
    console.log("✓ enseignantRoutes");

    const secretaireRoutes = require('./src/routes/secretaireRoutes');
    console.log("✓ secretaireRoutes");

    const directeurRoutes = require('./src/routes/directeurRoutes');
    console.log("✓ directeurRoutes");

    const parentRoutes = require('./src/routes/parentRoutes');
    console.log("✓ parentRoutes");

    console.log("Test des app.use...");

    app.use('/auth', authRoutes);
    console.log("✓ /auth");

    app.use('/admin', adminRoutes);
    console.log("✓ /admin");

    app.use('/enseignant', enseignantRoutes);
    console.log("✓ /enseignant");

    app.use('/secretaire', secretaireRoutes);
    console.log("✓ /secretaire");

    app.use('/directeur', directeurRoutes);
    console.log("✓ /directeur");

    app.use('/parent', parentRoutes);
    console.log("✓ /parent");

    console.log("Toutes les routes de base fonctionnent !");

} catch (error) {
    console.error("❌ Erreur:", error.message);
    console.error("Stack:", error.stack);
}
