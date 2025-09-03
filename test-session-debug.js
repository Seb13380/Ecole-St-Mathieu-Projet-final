const express = require('express');
const session = require('express-session');

const app = express();

// Configuration de session (comme dans app.js)
app.use(session({
    secret: process.env.SESSION_SECRET || 'votre-secret-session-ici-changez-le-en-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Test API pour vérifier la session
app.get('/test-session', (req, res) => {
    console.log('🔍 Session complète:', req.session);
    console.log('👤 Session user:', req.session.user);

    res.json({
        sessionExists: !!req.session,
        user: req.session.user || null,
        sessionId: req.sessionID
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🧪 Test serveur session sur port ${PORT}`);
    console.log('📱 Testez: http://localhost:3001/test-session');
});
