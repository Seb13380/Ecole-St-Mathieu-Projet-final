require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== TEST VARIABLES EMAIL ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'DÉFINI' : 'NON DÉFINI');
console.log('BASE_URL:', process.env.BASE_URL);
console.log('TEST_MODE:', process.env.TEST_MODE);

// Configuration du transporteur email avec la bonne syntaxe
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log('=== TEST CONNEXION GMAIL ===');

// Test 1: Vérification de la connexion
transporter.verify(function(error, success) {
    if (error) {
        console.log('❌ Erreur de connexion Gmail:', error);
    } else {
        console.log('✅ Connexion Gmail OK, prêt à envoyer des emails');
        
        // Test 2: Envoi d'un email test
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'sgdigitalweb13@gmail.com', // Email de test
            subject: 'Test Email VPS École Saint-Mathieu - ' + new Date().toLocaleString(),
            html: `
                <h2>🎓 Test Email depuis VPS École Saint-Mathieu</h2>
                <p>✅ Ce test confirme que l'envoi d'emails fonctionne depuis le VPS.</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Base URL:</strong> ${process.env.BASE_URL}</p>
                <p><strong>Mode Test:</strong> ${process.env.TEST_MODE}</p>
                <p><strong>Service Email:</strong> Fonctionnel 🚀</p>
                <hr>
                <p><em>Test réalisé depuis le système de notification d'actualités</em></p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('❌ Erreur envoi email:', error);
            } else {
                console.log('✅ Email envoyé avec succès!');
                console.log('Message ID:', info.messageId);
                console.log('Response:', info.response);
            }
            // Fermer proprement le processus
            process.exit(0);
        });
    }
});
