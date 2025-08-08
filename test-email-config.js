const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

async function testEmailConfiguration() {
    console.log('📧 Test de la configuration email...\n');

    // Vérifier les variables d'environnement
    console.log('🔍 Variables d\'environnement :');
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NON DÉFINI'}`);
    console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'DÉFINI (' + process.env.EMAIL_PASSWORD.length + ' caractères)' : 'NON DÉFINI'}`);
    console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'NON DÉFINI'}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NON DÉFINI'}\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('❌ Configuration email manquante !');
        console.log('\n📝 Pour configurer Gmail :');
        console.log('1. Allez sur https://myaccount.google.com/');
        console.log('2. Cliquez sur "Sécurité"');
        console.log('3. Cherchez "Mots de passe des applications" (App passwords)');
        console.log('4. Générez un mot de passe pour "Mail" > "Autre" > "École St Mathieu"');
        console.log('5. Copiez le mot de passe de 16 caractères');
        console.log('6. Remplacez VOTRE_MOT_DE_PASSE_APPLICATION_ICI dans le fichier .env');
        return;
    }

    try {
        // Configuration du transporteur
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        }); console.log('🔄 Test de connexion au serveur Gmail...');

        // Vérifier la connexion
        await transporter.verify();
        console.log('✅ Connexion Gmail réussie !');

        // Envoyer un email de test
        console.log('📤 Envoi d\'un email de test...');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // S'envoyer à soi-même pour tester
            subject: 'Test - Système de pré-inscription École St Mathieu',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">✅ Configuration email réussie !</h2>
          <p>Ce message confirme que la configuration email pour le système de pré-inscription de l'École St Mathieu fonctionne correctement.</p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Détails du test :</strong></p>
            <ul>
              <li>Date : ${new Date().toLocaleDateString('fr-FR')}</li>
              <li>Heure : ${new Date().toLocaleTimeString('fr-FR')}</li>
              <li>Email utilisé : ${process.env.EMAIL_USER}</li>
              <li>Service : Gmail</li>
            </ul>
          </div>
          <p style="color: #16a34a; font-weight: bold;">Le système de notifications par email est maintenant opérationnel ! 🎉</p>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email de test envoyé avec succès !');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`📬 Vérifiez votre boîte mail : ${process.env.EMAIL_USER}`);

        console.log('\n🎉 Configuration email terminée avec succès !');
        console.log('Le système de pré-inscription peut maintenant envoyer des notifications.');

    } catch (error) {
        console.log('❌ Erreur lors du test email :');
        console.error(error.message);

        if (error.message.includes('Invalid login')) {
            console.log('\n🔧 Solutions possibles :');
            console.log('1. Vérifiez que l\'authentification à 2 facteurs est activée');
            console.log('2. Générez un nouveau mot de passe d\'application');
            console.log('3. Vérifiez que le mot de passe dans .env est correct (16 caractères sans espaces)');
        }
    }
}

testEmailConfiguration();
