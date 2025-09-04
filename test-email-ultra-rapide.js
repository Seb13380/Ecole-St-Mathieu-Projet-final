const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 DIAGNOSTIC EMAIL RAPIDE');
console.log('===========================');

// Afficher la configuration
console.log('📋 Configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configuré' : '❌ Manquant');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('TEST_MODE:', process.env.TEST_MODE);

async function testEmailRapide() {
    try {
        console.log('\n🔧 Création du transporteur...');

        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('✅ Transporteur créé');

        console.log('\n🔗 Test de connexion...');
        await transporter.verify();
        console.log('✅ Connexion SMTP OK');

        console.log('\n📧 Envoi email test...');

        const result = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'sebcecg@gmail.com',
            subject: '🔥 TEST RAPIDE - École Saint-Mathieu',
            text: 'Si vous recevez cet email, la configuration fonctionne !',
            html: `
                <h2>✅ Test réussi !</h2>
                <p>Les emails fonctionnent parfaitement.</p>
                <p>Heure: ${new Date().toLocaleString('fr-FR')}</p>
            `
        });

        console.log('🎉 EMAIL ENVOYÉ !');
        console.log('📬 Message ID:', result.messageId);
        console.log('📨 Vérifiez: sebcecg@gmail.com');

        // Test admin aussi
        console.log('\n📧 Envoi email admin...');

        const adminResult = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'sgdigitalweb13@gmail.com',
            subject: '🔥 TEST ADMIN - École Saint-Mathieu',
            text: 'Test admin réussi !',
            html: `
                <h2>✅ Test admin réussi !</h2>
                <p>Les emails admin fonctionnent.</p>
                <p>Heure: ${new Date().toLocaleString('fr-FR')}</p>
            `
        });

        console.log('🎉 EMAIL ADMIN ENVOYÉ !');
        console.log('📬 Message ID:', adminResult.messageId);
        console.log('📨 Vérifiez: sgdigitalweb13@gmail.com');

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        console.error('Stack:', error.stack);
    }
}

testEmailRapide();
