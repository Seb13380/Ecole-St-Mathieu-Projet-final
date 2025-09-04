const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * DIAGNOSTIC COMPLET EMAIL
 * Vérification de la configuration et test d'envoi
 */

async function diagnosticEmail() {
    console.log('🔍 === DIAGNOSTIC EMAIL COMPLET ===');
    console.log('===================================');

    // 1. Vérification configuration
    console.log('📋 1. CONFIGURATION ACTUELLE:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '***configuré***' : '❌ MANQUANT'}`);
    console.log(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
    console.log(`   TEST_MODE: ${process.env.TEST_MODE}`);
    console.log(`   TEST_EMAIL: ${process.env.TEST_EMAIL}`);
    console.log('');

    // 2. Création du transporteur
    console.log('🔧 2. CRÉATION TRANSPORTEUR...');

    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    console.log('   ✅ Transporteur créé');

    // 3. Test de connexion
    console.log('🔗 3. TEST CONNEXION SMTP...');

    try {
        await transporter.verify();
        console.log('   ✅ Connexion SMTP réussie !');
    } catch (error) {
        console.log('   ❌ Erreur connexion SMTP:', error.message);
        return;
    }

    // 4. Test envoi simple
    console.log('📧 4. TEST ENVOI SIMPLE...');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'sebcecg@gmail.com',
        subject: '🔥 TEST EMAIL ÉCOLE SAINT-MATHIEU',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">✅ Test Email Réussi !</h2>
                <p>Ce message confirme que le système d'email fonctionne.</p>
                <p><strong>Heure d'envoi:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p><strong>Configuration:</strong> Gmail SMTP</p>
                <p><strong>École:</strong> Saint-Mathieu</p>
            </div>
        `
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('   🎉 EMAIL ENVOYÉ AVEC SUCCÈS !');
        console.log(`   📬 Message ID: ${result.messageId}`);
        console.log(`   📨 Destinataire: sebcecg@gmail.com`);
        console.log('   💡 Vérifiez votre boîte email (et dossier spam)');
    } catch (error) {
        console.log('   ❌ Erreur envoi:', error.message);
        console.log('   📋 Détails:', error);
    }

    // 5. Test envoi admin
    console.log('\n📧 5. TEST ENVOI ADMIN...');

    const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: 'sgdigitalweb13@gmail.com',
        subject: '🔥 TEST EMAIL ADMIN ÉCOLE SAINT-MATHIEU',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #16a34a;">✅ Test Email Admin Réussi !</h2>
                <p>Ce message confirme que les notifications admin fonctionnent.</p>
                <p><strong>Heure d'envoi:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <p><strong>Type:</strong> Notification administrative</p>
                <p><strong>École:</strong> Saint-Mathieu</p>
            </div>
        `
    };

    try {
        const adminResult = await transporter.sendMail(adminMailOptions);
        console.log('   🎉 EMAIL ADMIN ENVOYÉ AVEC SUCCÈS !');
        console.log(`   📬 Message ID: ${adminResult.messageId}`);
        console.log(`   📨 Destinataire: sgdigitalweb13@gmail.com`);
        console.log('   💡 Vérifiez votre boîte email admin (et dossier spam)');
    } catch (error) {
        console.log('   ❌ Erreur envoi admin:', error.message);
    }

    console.log('\n🏆 === DIAGNOSTIC TERMINÉ ===');
    console.log('============================');
    console.log('📬 Vérifiez vos deux boîtes email:');
    console.log('   📨 sebcecg@gmail.com');
    console.log('   📨 sgdigitalweb13@gmail.com');
    console.log('💡 N\'oubliez pas de vérifier le dossier SPAM !');
}

diagnosticEmail().catch(console.error);
