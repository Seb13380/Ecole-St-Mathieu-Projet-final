// Test des imports un par un pour identifier la source de l'erreur path-to-regexp

console.log("Démarrage test imports...");

try {
    console.log("1. Import express...");
    const express = require('express');
    const app = express();

    console.log("2. Import routes auth...");
    const authRoutes = require('./src/routes/authRoutes');

    console.log("3. Import routes admin...");
    const adminRoutes = require('./src/routes/adminRoutes');

    console.log("4. Import routes actualite...");
    const actualiteRoutes = require('./src/routes/actualiteRoutes');

    console.log("5. Import routes documents...");
    const documentRoutes = require('./src/routes/documentRoutes');

    console.log("6. Import routes menu-pdf...");
    const menuPdfRoutes = require('./src/routes/menuPdfRoutes');

    console.log("7. Import routes hero-carousel...");
    const heroCarouselRoutes = require('./src/routes/heroCarouselRoutes');

    console.log("8. Import routes ticket...");
    const ticketRoutes = require('./src/routes/ticketRoutes');

    console.log("9. Import routes parent...");
    const parentRoutes = require('./src/routes/parentRoutes');

    console.log("10. Import routes password-reset...");
    const passwordResetRoutes = require('./src/routes/passwordResetRoutes');

    console.log("11. Test app.use...");
    app.use('/auth', authRoutes);
    app.use('/admin', adminRoutes);

    console.log("Tous les imports et uses réussis !");

} catch (error) {
    console.error("❌ Erreur lors de l'import:", error.message);
    console.error("Stack:", error.stack);
}
