const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * DIAGNOSTIC COMPLET EMAIL
 * VÃ©rification de la configuration et test d'envoi
 */

async function diagnosticEmail() {
    console.log('ðŸ” === DIAGNOSTIC EMAIL COMPLET ===');
    console.log('');

    // 1. VÃ©rification configuration
    console.log('ðŸ“‹ 1. CONFIGURATION ACTUELLE:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '***configurÃ©***' : 'âŒ MANQUANT'}`);
    console.log(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
    console.log(`   TEST_MODE: ${process.env.TEST_MODE}`);
    console.log(`   TEST_EMAIL: ${process.env.TEST_EMAIL}`);
    console.log('');

    // 2. CrÃ©ation du transporteur
    console.log('ðŸ”§ 2. CRÃ‰ATION TRANSPORTEUR...');

    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    console.log('   âœ… Transporteur crÃ©Ã©');

    // 3. Test de connexion
    console.log('ðŸ”— 3. TEST CONNEXION SMTP...');

    try {
        await transporter.verify();
        console.log('   âœ… Connexion SMTP rÃ©ussie !');
    } catch (error) {
        console.log('   âŒ Erreur connexion SMTP:', error.message);
        return;
    }

    // 4. Test envoi simple
    console.log('ðŸ“§ 4. TEST ENVOI SIMPLE...');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'sebcecg@gmail.com',
        subject: 'ðŸ”¥ TEST EMAIL Ã‰COLE SAINT-MATHIEU',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">âœ… Test Email RÃ©ussi !</h2>
                <p>Ce message confirme que le systÃ¨me d'email fonctionne.</p>
                <p><strong>Heure d'envoi:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p><strong>Configuration:</strong> Gmail SMTP</p>
                <p><strong>Ã‰cole:</strong> Saint-Mathieu</p>
            </div>
        `
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('   ðŸŽ‰ EMAIL ENVOYÃ‰ AVEC SUCCÃˆS !');
        console.log(`   ðŸ“¬ Message ID: ${result.messageId}`);
        console.log(`   ðŸ“¨ Destinataire: sebcecg@gmail.com`);
        console.log('   ðŸ’¡ VÃ©rifiez votre boÃ®te email (et dossier spam)');
    } catch (error) {
        console.log('   âŒ Erreur envoi:', error.message);
        console.log('   ðŸ“‹ DÃ©tails:', error);
    }

    // 5. Test envoi admin
    console.log('\nðŸ“§ 5. TEST ENVOI ADMIN...');

    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: 'sgdigitalweb13@gmail.com',
        subject: 'ðŸ”¥ TEST EMAIL ADMIN Ã‰COLE SAINT-MATHIEU',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #16a34a;">âœ… Test Email Admin RÃ©ussi !</h2>
                <p>Ce message confirme que les notifications admin fonctionnent.</p>
                <p><strong>Heure d'envoi:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p><strong>Type:</strong> Notification administrative</p>
                <p><strong>Ã‰cole:</strong> Saint-Mathieu</p>
            </div>
        `
    };

    try {
        const adminResult = await transporter.sendMail(adminMailOptions);
        console.log('   ðŸŽ‰ EMAIL ADMIN ENVOYÃ‰ AVEC SUCCÃˆS !');
        console.log(`   ðŸ“¬ Message ID: ${adminResult.messageId}`);
        console.log(`   ðŸ“¨ Destinataire: sgdigitalweb13@gmail.com`);
        console.log('   ðŸ’¡ VÃ©rifiez votre boÃ®te email admin (et dossier spam)');
    } catch (error) {
        console.log('   âŒ Erreur envoi admin:', error.message);
    }

    console.log('\nðŸ† === DIAGNOSTIC TERMINÃ‰ ===');
    console.log('');
    console.log('ðŸ“¬ VÃ©rifiez vos deux boÃ®tes email:');
    console.log('   ðŸ“¨ sebcecg@gmail.com');
    console.log('   ðŸ“¨ sgdigitalweb13@gmail.com');
    console.log('ðŸ’¡ N\'oubliez pas de vÃ©rifier le dossier SPAM !');
}

diagnosticEmail().catch(console.error);

