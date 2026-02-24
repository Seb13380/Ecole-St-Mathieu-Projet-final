const nodemailer = require('nodemailer');

class TestEmailService {
    constructor() {
        // Configuration pour mode test - pas d'envoi réel
        this.transporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: true
        });
        console.log('📧 Service email en mode TEST - Emails simulés');
    }

    async sendInscriptionConfirmation(inscriptionData) {
        const { parentEmail, parentFirstName, children } = inscriptionData;

        const mailOptions = {
            from: 'ecole-saint-mathieu@test.com',
            to: parentEmail,
            subject: '✅ Confirmation de votre demande d\'inscription - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #304a4d;">🎓 École Saint-Mathieu</h1>
                    <h2>Demande d'inscription reçue</h2>
                    <p>Bonjour <strong>${parentFirstName}</strong>,</p>
                    <p>Nous avons bien reçu votre demande d'inscription pour ${children.length} enfant(s).</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #304a4d; margin-top: 0;">📋 Prochaines étapes</h3>
                        <ol>
                            <li><strong>Examen de votre dossier</strong> par notre équipe administrative</li>
                            <li><strong>Notification de notre décision</strong> sous 48h maximum</li>
                            <li><strong>En cas d'acceptation</strong>, vous recevrez les instructions pour finaliser l'inscription</li>
                        </ol>
                    </div>
                    
                    <p><strong>Important :</strong> Cette demande d'inscription ne créé pas encore de compte d'accès. Si votre demande est acceptée, nous vous enverrons les informations pour créer vos identifiants d'accès à l'espace familles.</p>
                    
                    <p>Nous vous remercions pour votre confiance et restons à votre disposition pour toute question.</p>
                    <p>Cordialement,<br>L'équipe de l'École Saint-Mathieu</p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de confirmation simulé envoyé à:', parentEmail);
            return { success: true, messageId: 'test-' + Date.now() };
        } catch (error) {
            console.error('❌ Erreur simulation email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendNewInscriptionNotification(notificationData) {
        const { requestId, parentFirstName, parentLastName, parentEmail } = notificationData;

        console.log('✅ Notification directeur simulée pour:', {
            requestId,
            parent: `${parentFirstName} ${parentLastName}`,
            email: parentEmail
        });

        return { success: true, messageId: 'test-notification-' + Date.now() };
    }

    async sendAppointmentAcceptanceEmail(inscriptionData, comment) {
        const { parentEmail, parentFirstName, parentLastName, children } = inscriptionData;

        const mailOptions = {
            from: 'ecole-saint-mathieu@test.com',
            to: parentEmail,
            subject: '✅ Votre demande d\'inscription a été acceptée - Rendez-vous à programmer',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #304a4d;">🎓 École Saint-Mathieu</h1>
                    <h2 style="color: #22c55e;">Félicitations ! Votre demande a été acceptée</h2>
                    <p>Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,</p>
                    <p>Nous avons le plaisir de vous informer que votre demande d'inscription a été <strong style="color: #22c55e;">acceptée</strong>.</p>
                    
                    <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                        <h3 style="color: #15803d; margin-top: 0;">📅 Prochaine étape : Rendez-vous</h3>
                        <p>Notre secrétariat va prendre contact avec vous <strong>dans les prochains jours</strong> pour programmer un rendez-vous d'inscription.</p>
                        <p>Lors de ce rendez-vous, nous finaliserons l'inscription et créerons vos comptes d'accès à l'espace familles.</p>
                    </div>
                    
                    ${comment ? `
                    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                        <h4 style="color: #1d4ed8; margin-top: 0;">💬 Message de l'équipe</h4>
                        <p style="font-style: italic;">"${comment}"</p>
                    </div>
                    ` : ''}
                    
                    <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
                        <h4 style="color: #c2410c; margin-top: 0;">📋 À prévoir pour le rendez-vous</h4>
                        <ul>
                            <li>Livret de famille ou acte de naissance</li>
                            <li>Justificatif de domicile récent</li>
                            <li>Bulletins scolaires de l'année en cours</li>
                            <li>Certificat de radiation (si changement d'école)</li>
                        </ul>
                    </div>
                    
                    <p>Nous vous remercions pour votre confiance et avons hâte de vous accueillir dans notre communauté éducative.</p>
                    <p>Cordialement,<br>L'équipe de l'École Saint-Mathieu</p>
                </div>
            `
        };

        try {
            console.log('✅ Email acceptation rendez-vous simulé envoyé à:', parentEmail);
            console.log('   📝 Commentaire admin:', comment || 'Aucun commentaire');
            return { success: true, messageId: 'test-appointment-' + Date.now() };
        } catch (error) {
            console.error('❌ Erreur simulation email rendez-vous:', error);
            return { success: false, error: error.message };
        }
    }

    async sendApprovalEmailWithCredentials(inscriptionData, comment) {
        const { parentEmail, parentFirstName, parentLastName, tempPassword } = inscriptionData;

        const mailOptions = {
            from: 'ecole-saint-mathieu@test.com',
            to: parentEmail,
            subject: '🎉 Inscription finalisée - Vos identifiants d\'accès',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #304a4d;">🎓 École Saint-Mathieu</h1>
                    <h2 style="color: #22c55e;">Bienvenue dans notre communauté !</h2>
                    <p>Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,</p>
                    <p>Votre inscription a été <strong style="color: #22c55e;">finalisée avec succès</strong> suite à notre rendez-vous.</p>
                    
                    <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                        <h3 style="color: #15803d; margin-top: 0;">🔐 Vos identifiants d'accès</h3>
                        <p><strong>Adresse email :</strong> ${parentEmail}</p>
                        <p><strong>Mot de passe temporaire :</strong> <span style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</span></p>
                        <p style="color: #dc2626; font-weight: bold; margin-top: 15px;">⚠️ Veuillez changer ce mot de passe lors de votre première connexion</p>
                    </div>
                    
                    <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                        <h4 style="color: #1d4ed8; margin-top: 0;">🌐 Accès à l'espace familles</h4>
                        <p>Connectez-vous sur notre site web et cliquez sur "Se connecter" en haut à droite.</p>
                        <p>Vous pourrez consulter les informations de vos enfants, les actualités de l'école et bien plus encore.</p>
                    </div>
                    
                    ${comment ? `
                    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                        <h4 style="color: #1d4ed8; margin-top: 0;">💬 Notes de finalisation</h4>
                        <p style="font-style: italic;">"${comment}"</p>
                    </div>
                    ` : ''}
                    
                    <p>Nous sommes ravis de vous compter parmi les familles de l'École Saint-Mathieu et nous nous réjouissons de contribuer à l'épanouissement de vos enfants.</p>
                    <p>Cordialement,<br>L'équipe de l'École Saint-Mathieu</p>
                </div>
            `
        };

        try {
            console.log('✅ Email identifiants simulé envoyé à:', parentEmail);
            console.log('   🔑 Mot de passe temporaire:', tempPassword);
            console.log('   📝 Commentaire:', comment || 'Aucun commentaire');
            return { success: true, messageId: 'test-credentials-' + Date.now() };
        } catch (error) {
            console.error('❌ Erreur simulation email identifiants:', error);
            return { success: false, error: error.message };
        }
    }

    async testConnection() {
        console.log('✅ Test mode - Connexion simulée réussie');
        return true;
    }
}

module.exports = new TestEmailService();