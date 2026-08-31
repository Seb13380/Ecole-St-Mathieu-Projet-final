const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Configuration du transporteur email
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Ou votre service email
            auth: {
                user: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
                pass: process.env.EMAIL_PASS || 'votre_mot_de_passe_email'
            }
        });
    }

    /**
     * Envoyer un email de confirmation de demande d'inscription
     * @param {Object} inscriptionData - Données de la demande d'inscription
     */
    async sendConfirmationEmail(inscriptionData) {
        const { parentFirstName, parentLastName, parentEmail, children } = inscriptionData;

        const childrenList = children.map(child =>
            `• ${child.firstName} ${child.lastName} (né(e) le ${new Date(child.birthDate).toLocaleDateString('fr-FR')})`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '✅ Confirmation de votre demande d\'inscription - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fdfc;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <h2 style="color: #304a4d; border-bottom: 2px solid #a7e3dd; padding-bottom: 10px;">
                            Demande d'inscription reçue
                        </h2>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous avons bien reçu votre demande d'inscription pour :
                        </p>
                        
                        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">👶 Enfant(s) concerné(s) :</h3>
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap;">${childrenList}</pre>
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border: 2px solid #f59e0b; margin: 20px 0;">
                            <h3 style="color: #92400e; margin-top: 0;">⚠️ Information importante :</h3>
                            <p style="color: #92400e; line-height: 1.6; margin: 0; font-size: 15px;">
                                Nous vous remercions pour l'intérêt porté à notre établissement et confirmons la bonne réception de votre demande d'inscription. <strong>Celle-ci n'est qu'une étape préalable avant l'attribution d'un rendez-vous avec le chef d'établissement qui sera proposé selon l'évolution de nos effectifs.</strong>
                            </p>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">⏳ Prochaines étapes :</h3>
                            <ol style="color: #856404; margin: 0; padding-left: 20px;">
                                <li>Votre demande est en cours d'examen par notre équipe</li>
                                <li>Nous vous contacterons selon l'évolution de nos effectifs pour un rendez-vous avec le chef d'établissement</li>
                                <li>Vous recevrez un email de confirmation ou de demande de complément</li>
                            </ol>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📧 Contact :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                Pour toute question : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a><br>
                                Téléphone : 04 91 07 07 18
                            </p>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; margin-top: 30px;">
                            Merci pour votre confiance,<br>
                            <strong>L'équipe de l'École Saint-Mathieu</strong>
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                            <p style="color: #666; font-size: 12px;">
                                Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email de confirmation envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer les identifiants de connexion au parent après création de compte
     * @param {Object} parentData - Données du parent
     * @param {Object} accountData - Données du compte créé
     */
    async sendAccountCreatedEmail(parentData, accountData) {
        const { parentFirstName, parentLastName, parentEmail, children } = parentData;
        const { parentId, studentIds } = accountData;

        const childrenList = children.map(child =>
            `• ${child.firstName} ${child.lastName}`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '🔑 Vos identifiants de connexion - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 30px;">
                            <h2 style="color: #155724; margin-top: 0; text-align: center;">
                                🔑 Votre compte a été créé !
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Votre compte parent a été créé avec succès ! Vous pouvez maintenant accéder à l'espace parent pour suivre la scolarité de :
                        </p>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">👶 Vos enfants inscrits :</h3>
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap;">${childrenList}</pre>
                        </div>

                        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
                            <h3 style="color: #004085; margin-top: 0;">🔐 Vos identifiants de connexion :</h3>
                            <div style="background-color: white; padding: 15px; border-radius: 5px; font-family: monospace;">
                                <p style="margin: 5px 0; color: #004085;"><strong>Email :</strong> ${parentEmail}</p>
                                <p style="margin: 5px 0; color: #004085;"><strong>Mot de passe :</strong> Celui que vous avez choisi lors de l'inscription</p>
                                <p style="margin: 5px 0; color: #004085;"><strong>URL de connexion :</strong> <a href="${process.env.BASE_URL}/auth/login" style="color: #304a4d;">${process.env.BASE_URL}/auth/login</a></p>
                            </div>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">📋 Dans votre espace parent, vous pourrez :</h3>
                            <ul style="color: #856404; margin: 0; padding-left: 20px;">
                                <li>Voir les actualités de l'école</li>
                                <li>Consulter les menus de la cantine</li>
                                <li>Accéder aux informations importantes</li>
                            </ul>
                            <p style="color: #856404; margin: 10px 0 0 0; font-style: italic; font-size: 14px;">
                                📝 <strong>Prochainement :</strong> Gestion des tickets de restauration et autres fonctionnalités en cours de développement.
                            </p>
                        </div>
                        
                        <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                            <h3 style="color: #721c24; margin-top: 0;">🔒 Sécurité :</h3>
                            <p style="color: #721c24; margin: 0;">
                                ⚠️ <strong>Important :</strong> Ne partagez jamais vos identifiants avec un tiers.<br>
                                Si vous avez oublié votre mot de passe, utilisez la fonction "Mot de passe oublié" sur la page de connexion.
                            </p>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📞 Support :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                Besoin d'aide pour vous connecter ?<br>
                                📧 Email : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a><br>
                                📞 Téléphone : 04 91 07 07 18
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.BASE_URL}/auth/login" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                🚀 Accéder à mon espace parent
                            </a>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; margin-top: 30px;">
                            Bienvenue dans la famille de l'École Saint-Mathieu !<br><br>
                            Cordialement,<br>
                            <strong>L'équipe de l'École Saint-Mathieu</strong>
                        </p>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email des identifiants envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi des identifiants:', error);
            return { success: false, error: error.message };
        }
    }



    /**
     * Envoyer un email de rejet de demande d'inscription
     * @param {Object} inscriptionData - Données de la demande d'inscription
     * @param {string} reviewComment - Raison du rejet
     */
    async sendRejectionEmail(inscriptionData, reviewComment) {
        const { parentFirstName, parentLastName, parentEmail, children } = inscriptionData;

        const childrenList = children.map(child =>
            `• ${child.firstName} ${child.lastName}`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: 'Réponse à votre demande d\'inscription - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <h2 style="color: #304a4d; border-bottom: 2px solid #a7e3dd; padding-bottom: 10px;">
                            Réponse à votre demande d'inscription
                        </h2>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous vous remercions pour votre demande d'inscription concernant :
                        </p>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap;">${childrenList}</pre>
                        </div>

                        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                            <p style="color: #721c24; margin: 0; line-height: 1.6;">
                                Après examen attentif de votre dossier, nous ne pouvons malheureusement pas donner une suite favorable à votre demande pour cette année scolaire.
                            </p>
                        </div>

                        ${reviewComment ? `
                        <div style="background-color: #e2e3e5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #383d41; margin-top: 0;">💬 Explications :</h3>
                            <p style="color: #383d41; margin: 0; font-style: italic;">"${reviewComment}"</p>
                        </div>
                        ` : ''}
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">🔄 Possibilités futures :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                • Vous pouvez renouveler votre demande l'année prochaine<br>
                                • N'hésitez pas à nous contacter pour plus d'informations<br>
                                • Nous vous invitons à vous inscrire sur notre liste d'attente
                            </p>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📞 Contact :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                Pour toute question : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a><br>
                                Téléphone : 04 91 07 07 18
                            </p>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; margin-top: 30px;">
                            Nous vous remercions pour l'intérêt que vous portez à notre établissement.<br><br>
                            Cordialement,<br>
                            <strong>L'équipe de l'École Saint-Mathieu</strong>
                        </p>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email de rejet envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de rejet:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer une notification au directeur pour une nouvelle demande d'inscription
     * @param {Object} inscriptionData - Données de la demande d'inscription
     */
    async sendNewRequestNotification(inscriptionData) {
        const { parentFirstName, parentLastName, parentEmail, parentPhone, children } = inscriptionData;
        const directorEmail = 'sgdigitalweb13@gmail.com'; // Votre email

        const childrenList = children.map(child =>
            `• ${child.firstName} ${child.lastName} (né(e) le ${new Date(child.birthDate).toLocaleDateString('fr-FR')})`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: directorEmail,
            subject: '🔔 Nouvelle demande d\'inscription à valider - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 30px;">
                            <h2 style="color: #856404; margin-top: 0; text-align: center;">
                                🔔 Nouvelle demande d'inscription en attente
                            </h2>
                        </div>
                        
                        <h3 style="color: #304a4d; border-bottom: 2px solid #a7e3dd; padding-bottom: 10px;">
                            👨‍👩‍👧‍👦 Informations du parent
                        </h3>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Nom :</strong> ${parentFirstName} ${parentLastName}</p>
                            <p style="margin: 5px 0;"><strong>Email :</strong> <a href="mailto:${parentEmail}">${parentEmail}</a></p>
                            <p style="margin: 5px 0;"><strong>Téléphone :</strong> ${parentPhone || 'Non renseigné'}</p>
                        </div>

                        <h3 style="color: #304a4d; border-bottom: 2px solid #a7e3dd; padding-bottom: 10px;">
                            👶 Enfant(s) à inscrire
                        </h3>
                        
                        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <pre style="color: #004085; font-family: Arial; white-space: pre-wrap; margin: 0;">${childrenList}</pre>
                        </div>
                        
                        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                            <h3 style="color: #155724; margin-top: 0;">✅ Actions requises :</h3>
                            <ol style="color: #155724; margin: 0; padding-left: 20px;">
                                <li>Connectez-vous à votre espace directeur</li>
                                <li>Accédez à la section "Demandes d'inscription"</li>
                                <li>Examinez la demande et validez ou rejetez</li>
                            </ol>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.BASE_URL || 'http://localhost:3007'}/directeur/inscriptions" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                🚀 Voir les demandes en attente
                            </a>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #0c5460; margin: 0;">
                                <strong>📅 Date de la demande :</strong> ${new Date().toLocaleString('fr-FR')}<br>
                                <strong>📊 Action recommandée :</strong> Traiter sous 48-72h
                            </p>
                        </div>
                        
                        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
                            Cet email est une notification automatique du système de gestion de l'École Saint-Mathieu.
                        </p>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Notification directeur envoyée:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification au directeur:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer un email de reset de mot de passe
     * @param {Object} user - Données de l'utilisateur
     * @param {string} resetToken - Token de reset
     */
    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${process.env.BASE_URL || 'http://localhost:3007'}/auth/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : user.email,
            subject: '🔐 Réinitialisation de votre mot de passe - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 30px;">
                            <h2 style="color: #856404; margin-top: 0; text-align: center;">
                                🔐 Réinitialisation de mot de passe
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${user.firstName} ${user.lastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Vous avez demandé la réinitialisation de votre mot de passe pour votre compte École Saint-Mathieu.
                        </p>
                        
                        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
                            <h3 style="color: #004085; margin-top: 0;">🔑 Pour créer un nouveau mot de passe :</h3>
                            <p style="color: #004085; margin: 0;">
                                Cliquez sur le bouton ci-dessous dans les <strong>60 prochaines minutes</strong>.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                🔄 Réinitialiser mon mot de passe
                            </a>
                        </div>
                        
                        <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                            <h3 style="color: #721c24; margin-top: 0;">⚠️ Important :</h3>
                            <ul style="color: #721c24; margin: 0; padding-left: 20px;">
                                <li>Ce lien expire dans <strong>1 heure</strong></li>
                                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                                <li>Votre mot de passe actuel reste inchangé tant que vous ne créez pas un nouveau</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #e2e3e5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #383d41; margin-top: 0;">🔗 Problème avec le bouton ?</h3>
                            <p style="color: #383d41; margin: 5px 0;">Copiez et collez cette adresse dans votre navigateur :</p>
                            <p style="color: #007bff; margin: 0; word-break: break-all; font-size: 12px;">${resetUrl}</p>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📞 Besoin d'aide ?</h3>
                            <p style="color: #0c5460; margin: 0;">
                                Support technique : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a><br>
                                Téléphone : 04 91 07 07 18
                            </p>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; margin-top: 30px;">
                            Cordialement,<br>
                            <strong>L'équipe technique de l'École Saint-Mathieu</strong>
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                            <p style="color: #666; font-size: 12px;">
                                Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email de reset de mot de passe envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de reset:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer une confirmation de changement de mot de passe
     * @param {Object} user - Données de l'utilisateur
     */
    async sendPasswordChangedConfirmation(user) {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : user.email,
            subject: '✅ Mot de passe modifié avec succès - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 30px;">
                            <h2 style="color: #155724; margin-top: 0; text-align: center;">
                                ✅ Mot de passe modifié avec succès
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${user.firstName} ${user.lastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Votre mot de passe a été modifié avec succès le <strong>${new Date().toLocaleString('fr-FR')}</strong>.
                        </p>
                        
                        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #004085; margin-top: 0;">🔐 Sécurité :</h3>
                            <p style="color: #004085; margin: 0;">
                                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                            </p>
                        </div>
                        
                        <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
                            <h3 style="color: #721c24; margin-top: 0;">⚠️ Vous n'avez pas fait cette modification ?</h3>
                            <p style="color: #721c24; margin: 0;">
                                Si vous n'êtes pas à l'origine de ce changement, contactez immédiatement notre support technique.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.BASE_URL || 'http://localhost:3007'}/auth/login" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                🚀 Se connecter
                            </a>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📞 Support :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                Email : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a><br>
                                Téléphone : 04 91 07 07 18
                            </p>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; margin-top: 30px;">
                            Cordialement,<br>
                            <strong>L'équipe de l'École Saint-Mathieu</strong>
                        </p>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email de confirmation changement mot de passe envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la confirmation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer une notification de nouvelle actualité aux parents
     * @param {Object} actualiteData - Données de l'actualité
     * @param {Array} parentEmails - Liste des emails des parents
     */
    async sendNewActualiteNotification(actualiteData, parentEmails) {
        const { titre, contenu, auteur, datePublication, important, mediaUrl } = actualiteData;

        // Créer un extrait du contenu (max 200 caractères)
        const contenuExtrait = contenu.length > 200 ?
            contenu.substring(0, 200) + '...' : contenu;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            bcc: process.env.TEST_MODE === 'true' ? [process.env.TEST_EMAIL] : parentEmails,
            subject: `📰 ${important ? '🚨 IMPORTANT - ' : ''}Nouvelle actualité - École Saint-Mathieu`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fdfc;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        ${important ? `
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                            <h2 style="color: #856404; margin: 0; text-align: center;">🚨 ACTUALITÉ IMPORTANTE</h2>
                        </div>
                        ` : ''}
                        
                        <h2 style="color: #304a4d; border-bottom: 2px solid #a7e3dd; padding-bottom: 10px;">
                            📰 Nouvelle actualité publiée
                        </h2>
                        
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0; font-size: 20px;">${titre}</h3>
                            <p style="color: #333; line-height: 1.6; margin: 15px 0;">${contenuExtrait}</p>
                            
                            ${mediaUrl ? `
                            <div style="margin: 15px 0;">
                                <p style="color: #666; font-size: 14px;">📎 Cette actualité contient une image ou une vidéo.</p>
                            </div>
                            ` : ''}
                            
                            <div style="background-color: #e7f3ff; padding: 10px; border-radius: 5px; margin-top: 15px;">
                                <p style="color: #004085; margin: 5px 0; font-size: 14px;">
                                    <strong>📝 Publié par :</strong> ${auteur.firstName} ${auteur.lastName}
                                </p>
                                <p style="color: #004085; margin: 5px 0; font-size: 14px;">
                                    <strong>📅 Date :</strong> ${new Date(datePublication).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
                                </p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.BASE_URL || 'http://localhost:3007'}/actualites" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                📖 Lire l'actualité complète
                            </a>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">💻 Votre espace parent :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                Connectez-vous à votre espace parent pour consulter toutes les actualités, 
                                suivre la scolarité de vos enfants et communiquer avec l'équipe pédagogique.
                            </p>
                            <div style="text-align: center; margin-top: 10px;">
                                <a href="${process.env.BASE_URL || 'http://localhost:3007'}/auth/login" 
                                   style="color: #0c5460; font-weight: bold; text-decoration: none;">
                                    👉 Se connecter à l'espace parent
                                </a>
                            </div>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #495057; margin-top: 0;">📧 Contact :</h3>
                            <p style="color: #495057; margin: 0; font-size: 14px;">
                                Pour toute question : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a><br>
                                Téléphone : 04 91 07 07 18
                            </p>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; margin-top: 30px;">
                            Cordialement,<br>
                            <strong>L'équipe de l'École Saint-Mathieu</strong>
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                            <p style="color: #666; font-size: 12px;">
                                Vous recevez cet email car vous êtes parent d'élève à l'École Saint-Mathieu.<br>
                                Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`📧 Notification d'actualité envoyée à ${parentEmails.length} parents:`, info.messageId);
            return { success: true, messageId: info.messageId, recipientCount: parentEmails.length };
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de la notification d\'actualité:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer un email d'approbation avec demande de rendez-vous
     * @param {Object} inscriptionData - Données de la demande d'inscription
     * @param {String} comment - Commentaire du directeur
     */
    async sendApprovalEmailWithCredentials(inscriptionData, comment = '') {
        const { parentFirstName, parentLastName, parentEmail, children, createdStudents } = inscriptionData;

        const childrenList = createdStudents ? createdStudents.map(student =>
            `• ${student.firstName} ${student.lastName} - Classe: ${student.classe?.nom || 'Non assigné'}`
        ).join('\n') : 'Enfants inscrits';

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '🎉 Demande d\'inscription approuvée - Prise de rendez-vous - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #16a34a; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 30px;">
                            <h2 style="color: #16a34a; margin: 0; font-size: 24px;">
                                ✅ Demande d'inscription approuvée
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; font-size: 16px;">
                            Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous sommes ravis de vous informer que votre demande d'inscription a été approuvée ! Nous allons prendre contact avec vous pour convenir d'un rendez-vous selon les places disponibles.
                        </p>

                        ${comment ? `
                        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                            <h3 style="color: #3b82f6; margin-top: 0;">💬 Message de la direction :</h3>
                            <p style="color: #333; margin: 0; font-style: italic;">"${comment}"</p>
                        </div>
                        ` : ''}
                        
                        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #92400e; margin-top: 0;">👶 Enfant(s) concerné(s) :</h3>
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap; margin: 0;">${childrenList}</pre>
                        </div>
                        
                        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1e40af; margin-top: 0;">📞 Prochaines étapes :</h3>
                            <ul style="color: #333; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
                                <li><strong>Nous vous contacterons</strong> dans les prochains jours pour fixer un rendez-vous</li>
                                <li><strong>Lors du rendez-vous</strong>, nous finaliserons l'inscription et vous fournirons toutes les informations nécessaires</li>
                                <li><strong>Vous pourrez à ce moment-là</strong> demander vos identifiants d'accès à l'espace parent</li>
                                <li><strong>Préparez</strong> les documents requis (nous vous préciserons la liste lors de notre appel)</li>
                            </ul>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">⚠️ Information importante :</h3>
                            <p style="color: #856404; margin: 0;">
                                L'accès à l'espace parent numérique sera configuré lors de votre rendez-vous avec la secrétaire ou la direction de l'école.
                            </p>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📞 Contact :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                Si vous avez des questions en attendant notre appel :<br>
                                📧 Email : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a><br>
                                📞 Téléphone : 04 91 07 07 18
                            </p>
                        </div>
                        
                        <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
                            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                📧 École Saint-Mathieu - ${process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr'}
                            </p>
                            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                📍 22 Place des Héros, 13013 Marseille - 📞 04 91 07 07 18
                            </p>
                            <p style="color: #16a34a; font-weight: bold; margin-top: 15px;">
                                Bienvenue dans la famille Saint-Mathieu ! 🎓
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email d\'approbation avec identifiants envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email d\'approbation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Notifier Yamina des nouveaux élèves inscrits
     * @param {Object} notificationData - Données pour la notification
     */
    async sendNewStudentsNotificationToYamina(notificationData) {
        const { yamimaEmail, yamimaFirstName, students } = notificationData;

        const studentsList = students.map(student =>
            `• ${student.nom} - Classe: ${student.classe} (${student.niveau})`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : yamimaEmail,
            subject: '👶 Nouveaux élèves inscrits - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #7c3aed; text-align: center; margin-bottom: 30px;">
                            🏫 École Saint-Mathieu - Secrétariat
                        </h1>
                        
                        <div style="background-color: #ede9fe; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin-bottom: 30px;">
                            <h2 style="color: #7c3aed; margin: 0; font-size: 20px;">
                                👶 Nouveaux élèves inscrits
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; font-size: 16px;">
                            Bonjour <strong>${yamimaFirstName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            De nouveaux élèves viennent d'être inscrits suite à l'approbation d'une demande d'inscription par la direction.
                        </p>
                        
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1e40af; margin-top: 0;">📋 Nouveaux élèves :</h3>
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap; margin: 0;">${studentsList}</pre>
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #92400e; margin: 0;">
                                💡 <strong>Action requise :</strong> Veuillez mettre à jour vos listes de classes et vérifier que tous les documents administratifs sont complets.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3007/secretaire/dashboard" 
                               style="background-color: #7c3aed; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                📊 Accéder au tableau de bord
                            </a>
                        </div>
                        
                        <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
                            <p style="color: #666; font-size: 14px;">
                                Cette notification a été générée automatiquement par le système de gestion scolaire.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Notification Yamina envoyée:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de la notification Yamina:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer les listes de classes à Yamina
     * @param {Object} classListData - Données des listes de classes
     */
    async sendClassListsToYamina(classListData) {
        const { yamimaEmail, yamimaFirstName, classes } = classListData;

        let classesHTML = '';
        let totalStudents = 0;

        classes.forEach(classe => {
            totalStudents += classe.studentCount;
            classesHTML += `
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6;">
                    <h3 style="color: #1e40af; margin: 0 0 10px 0;">${classe.nom} (${classe.niveau}) - ${classe.studentCount} élève(s)</h3>
                    ${classe.students.length > 0 ? `
                        <div style="margin-left: 15px;">
                            ${classe.students.map(student => `
                                <div style="margin: 5px 0; padding: 5px; background-color: white; border-radius: 4px;">
                                    <strong>${student.nom}</strong><br>
                                    <small style="color: #666;">
                                        Parent: ${student.parent} | Email: ${student.email} | Tél: ${student.telephone}
                                    </small>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: #666; margin: 5px 0;">Aucun élève inscrit</p>'}
                </div>
            `;
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : yamimaEmail,
            subject: '📋 Listes complètes des classes - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #7c3aed; text-align: center; margin-bottom: 30px;">
                            🏫 École Saint-Mathieu - Listes de Classes
                        </h1>
                        
                        <div style="background-color: #ede9fe; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin-bottom: 30px;">
                            <h2 style="color: #7c3aed; margin: 0; font-size: 20px;">
                                📊 Rapport complet des inscriptions
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; font-size: 16px;">
                            Bonjour <strong>${yamimaFirstName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Voici les listes complètes de toutes les classes avec les coordonnées des familles.
                        </p>
                        
                        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <h3 style="color: #1e40af; margin: 0;">
                                📈 Total: ${totalStudents} élève(s) inscrits dans ${classes.length} classe(s)
                            </h3>
                        </div>
                        
                        <div style="margin: 30px 0;">
                            ${classesHTML}
                        </div>
                        
                        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #92400e; margin: 0;">
                                💡 <strong>Ces informations sont confidentielles</strong> et destinées uniquement à l'usage administratif de l'école.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3007/secretaire/dashboard" 
                               style="background-color: #7c3aed; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                📊 Tableau de bord secrétaire
                            </a>
                        </div>
                        
                        <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
                            <p style="color: #666; font-size: 14px;">
                                Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Listes de classes envoyées à Yamina:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi des listes à Yamina:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer email de confirmation d'inscription au parent
     */
    async sendInscriptionConfirmation(inscriptionData) {
        const { parentEmail, parentFirstName, children } = inscriptionData;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: parentEmail,
            subject: '✅ Confirmation de votre demande d\'inscription - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #304a4d;">🎓 École Saint-Mathieu</h1>
                    <h2>Demande d'inscription reçue</h2>
                    <p>Bonjour <strong>${parentFirstName}</strong>,</p>
                    <p>Nous avons bien reçu votre demande d'inscription pour ${children.length} enfant(s).</p>
                    <p>Vous recevrez une réponse sous 48h.</p>
                    <p>Cordialement,<br>L'équipe de l'École Saint-Mathieu</p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de confirmation envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi confirmation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ✉️ NOUVELLE FONCTION - Envoyer un email de validation d'inscription
     * @param {Object} data - { parentEmail, parentFirstName, validationToken, children }
     */
    async sendValidationEmail(data) {
        const { parentEmail, parentFirstName, validationToken, children } = data;

        // Construire l'URL de validation
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const validationUrl = `${baseUrl}/pre-inscription/validate-email/${validationToken}`;

        const childrenList = children.map(child =>
            `• ${child.firstName} ${child.lastName} (né(e) le ${new Date(child.birthDate).toLocaleDateString('fr-FR')}) - Classe demandée: ${child.requestedClass}`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '✉️ Validez votre demande d\'inscription - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fdfc;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <h2 style="color: #304a4d; border-bottom: 2px solid #a7e3dd; padding-bottom: 10px;">
                            📧 Validation de votre demande d'inscription
                        </h2>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${parentFirstName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Merci pour votre demande d'inscription pour ${children.length} enfant(s) :
                        </p>
                        
                        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">👶 Enfant(s) concerné(s) :</h3>
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap; font-size: 14px;">${childrenList}</pre>
                        </div>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffecb5; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #856404; margin-top: 0; display: flex; align-items: center;">
                                ⚠️ Action requise
                            </h3>
                            <p style="color: #856404; margin-bottom: 15px; font-weight: bold;">
                                Pour finaliser votre demande d'inscription, vous devez valider votre adresse email en cliquant sur le lien ci-dessous :
                            </p>
                            
                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${validationUrl}" 
                                   style="display: inline-block; background: linear-gradient(135deg, #5fb3ac, #4a9b94); 
                                          color: white; padding: 15px 30px; text-decoration: none; 
                                          border-radius: 8px; font-weight: bold; font-size: 16px;
                                          box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
                                    ✉️ VALIDER MON EMAIL
                                </a>
                            </div>
                            
                            <p style="color: #856404; font-size: 12px; margin-bottom: 0;">
                                ⏰ Ce lien expire dans <strong>24 heures</strong>.<br>
                                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                                <span style="font-family: monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px;">${validationUrl}</span>
                            </p>
                        </div>
                        
                        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #2d5a2d; margin-top: 0;">📋 Prochaines étapes :</h3>
                            <ol style="color: #2d5a2d; margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 5px;">Cliquez sur le lien de validation ci-dessus</li>
                                <li style="margin-bottom: 5px;">Votre demande sera automatiquement transmise à la direction</li>
                                <li style="margin-bottom: 5px;">Vous recevrez une réponse par email sous 48h</li>
                            </ol>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                        
                        <div style="text-align: center; color: #666; font-size: 12px;">
                            <p style="margin: 5px 0;">
                                <strong>École Saint-Mathieu</strong><br>
                                📧 ${process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr'}<br>
                                🌐 ${baseUrl}
                            </p>
                            <p style="margin: 10px 0; color: #999;">
                                Si vous n'avez pas fait cette demande d'inscription, vous pouvez ignorer cet email.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de validation envoyé:', info.messageId, 'à', parentEmail);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi validation email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer notification d'inscription au directeur
     */
    async sendInscriptionNotificationToDirector(inscriptionData) {
        const { parentFirstName, parentLastName, parentEmail, children, requestId } = inscriptionData;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: 'sgdigitalweb13@gmail.com', // Email admin pour tests
            subject: '🎓 Nouvelle demande d\'inscription - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #304a4d;">📝 Nouvelle demande d'inscription</h1>
                    <h3>👨‍👩‍👧‍👦 Parent:</h3>
                    <p><strong>Nom:</strong> ${parentLastName}</p>
                    <p><strong>Prénom:</strong> ${parentFirstName}</p>
                    <p><strong>Email:</strong> ${parentEmail}</p>
                    <h3>👶 Enfant(s):</h3>
                    ${children.map(child => `
                        <div style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px;">
                            <p><strong>${child.firstName} ${child.lastName}</strong></p>
                            <p>Né(e) le: ${child.birthDate}</p>
                            <p>Classe demandée: ${child.grade || 'Non spécifiée'}</p>
                        </div>
                    `).join('')}
                    <p><strong>ID de la demande:</strong> ${requestId}</p>
                    <p>Email envoyé automatiquement le ${new Date().toLocaleString('fr-FR')}</p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Notification directeur envoyée:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur notification directeur:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Tester la configuration email
     */
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Configuration email valide');
            return true;
        } catch (error) {
            console.error('❌ Erreur de configuration email:', error);
            return false;
        }
    }

    /**
     * Envoyer un email de confirmation d'activation du compte
     * @param {Object} parentData - Données du parent
     */
    async sendAccountActivatedEmail(parentData) {
        const { parentFirstName, parentLastName, parentEmail } = parentData;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '✅ Votre compte a été activé - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 30px;">
                            <h2 style="color: #155724; margin-top: 0; text-align: center;">
                                ✅ Votre compte a été activé !
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour ${parentFirstName} ${parentLastName},
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Excellente nouvelle ! Votre demande d'inscription a été approuvée et votre compte d'accès au portail parents de l'École Saint-Mathieu est maintenant <strong>actif</strong>.
                        </p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #304a4d;">
                            <h3 style="color: #004085; margin-top: 0;">🔐 Pour vous connecter :</h3>
                            <p style="margin: 10px 0; color: #004085;">
                                <strong>Email :</strong> ${parentEmail}<br>
                                <strong>Mot de passe :</strong> Celui que vous avez choisi lors de votre inscription
                            </p>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">🔒 Mot de passe oublié ?</h3>
                            <p style="color: #856404; margin: 0;">
                                Si vous avez oublié votre mot de passe, utilisez le lien <strong>"Mot de passe oublié"</strong> sur la page de connexion.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.BASE_URL || 'http://localhost:3007'}/auth/login" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                🚀 Se connecter maintenant
                            </a>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📞 Besoin d'aide ?</h3>
                            <p style="color: #0c5460; margin: 0;">
                                En cas de problème de connexion :<br>
                                Email : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a><br>
                                Téléphone : 04 91 07 07 18
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 12px;">
                                © École Saint-Mathieu - Portail Parents<br>
                                Cet email est automatique, merci de ne pas y répondre.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email d\'activation envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email d\'activation:', error);
            throw error;
        }
    }

    /**
     * Envoyer les identifiants de connexion au parent après création de compte
     * @param {Object} parentData - Données du parent avec mot de passe temporaire
     */
    async sendCredentials(parentData) {
        const { parentFirstName, parentLastName, parentEmail, tempPassword } = parentData;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '🔑 Vos identifiants de connexion - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 30px;">
                            <h2 style="color: #155724; margin-top: 0; text-align: center;">
                                🔑 Votre compte a été créé !
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour ${parentFirstName} ${parentLastName},
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Votre demande d'inscription a été approuvée ! Nous avons créé votre compte d'accès au portail parents de l'École Saint-Mathieu.
                        </p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #304a4d;">
                            <h3 style="color: #004085; margin-top: 0;">🔐 Vos identifiants de connexion :</h3>
                            <p style="margin: 10px 0; color: #004085; font-family: monospace; font-size: 16px; background: white; padding: 10px; border-radius: 4px;">
                                <strong>Email :</strong> ${parentEmail}<br>
                                <strong>Mot de passe temporaire :</strong> <span style="color: #e74c3c; font-weight: bold;">${tempPassword}</span>
                            </p>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">⚠️ Important :</h3>
                            <p style="color: #856404; margin: 0;">
                                <strong>Changez votre mot de passe</strong> lors de votre première connexion pour des raisons de sécurité.<br>
                                Ce mot de passe temporaire ne doit être utilisé que pour votre première connexion.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.BASE_URL || 'http://localhost:3007'}/auth/login" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                🚀 Se connecter maintenant
                            </a>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📞 Besoin d'aide ?</h3>
                            <p style="color: #0c5460; margin: 0;">
                                En cas de problème de connexion :<br>
                                Email : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a><br>
                                Téléphone : 04 91 07 07 18
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 12px;">
                                © École Saint-Mathieu - Portail Parents<br>
                                Cet email est automatique, merci de ne pas y répondre.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email des identifiants envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi des identifiants:', error);
            throw error;
        }
    }

    /**
     * Envoyer une notification à l'admin lors d'une nouvelle demande d'inscription
     * @param {Object} requestData - Données de la demande
     */
    async sendAdminNotification(requestData) {
        const { requestId, parentFirstName, parentLastName, parentEmail, children, adminEmail } = requestData;

        const childrenList = children.map(child =>
            `• ${child.firstName} ${child.lastName} (né(e) le ${new Date(child.birthDate).toLocaleDateString('fr-FR')})`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: adminEmail || 'sgdigitalweb13@gmail.com',
            subject: '🚨 Nouvelle demande d\'inscription - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff3cd;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu - Administration
                        </h1>
                        
                        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 30px;">
                            <h2 style="color: #856404; margin-top: 0; text-align: center;">
                                🚨 Nouvelle demande d'inscription
                            </h2>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">👨‍👩‍👧‍👦 Informations parent :</h3>
                            <p style="color: #333; margin: 5px 0;"><strong>Nom :</strong> ${parentFirstName} ${parentLastName}</p>
                            <p style="color: #333; margin: 5px 0;"><strong>Email :</strong> ${parentEmail}</p>
                            <p style="color: #333; margin: 5px 0;"><strong>ID Demande :</strong> #${requestId}</p>
                        </div>
                        
                        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">👶 Enfant(s) à inscrire :</h3>
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap;">${childrenList}</pre>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.BASE_URL || 'http://localhost:3007'}/admin/inscriptions/requests" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                📋 Gérer les demandes
                            </a>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">⚡ Action requise :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                Cette demande attend votre validation dans l'interface d'administration.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 12px;">
                                © École Saint-Mathieu - Système de gestion<br>
                                Notification automatique du ${new Date().toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Notification admin envoyée:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification admin:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer un email avec identifiants temporaires
     * @param {Object} data - Données pour l'envoi d'identifiants
     */
    async sendCredentialsEmail(data) {
        const { parentFirstName, parentLastName, parentEmail, temporaryPassword } = data;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: parentEmail,
            subject: '🔑 Demande d\'identifiants traitée - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>

                        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 30px;">
                            <h2 style="color: #16a34a; margin: 0; font-size: 20px;">
                                ✅ Votre demande d'identifiants a été traitée
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous avons bien reçu votre demande d'identifiants de connexion. 
                            Voici vos codes d'accès à l'espace parent :
                        </p>
                        
                        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
                            <h3 style="color: #004085; margin-top: 0;">🔐 Vos codes d'accès à l'espace parent :</h3>
                            <div style="background-color: white; padding: 15px; border-radius: 5px; font-family: monospace;">
                                <p style="margin: 5px 0; color: #004085;"><strong>Email :</strong> ${parentEmail}</p>
                                <p style="margin: 5px 0; color: #004085;"><strong>Mot de passe temporaire :</strong> ${temporaryPassword}</p>
                                <p style="margin: 5px 0; color: #004085;"><strong>URL :</strong> <a href="${process.env.BASE_URL}/auth/login">${process.env.BASE_URL}/auth/login</a></p>
                            </div>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                            <p style="color: #856404; margin: 0;">
                                <strong>⚠️ Important :</strong> Vous devrez changer ce mot de passe temporaire lors de votre première connexion pour des raisons de sécurité.
                            </p>
                        </div>

                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #495057; margin: 0; font-size: 14px;">
                                📚 <strong>Rappel :</strong> Cet espace vous permet de consulter les informations de vos enfants, 
                                les actualités de l'école, et de rester en contact avec l'équipe éducative.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.BASE_URL}/auth/login" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                🚀 Se connecter
                            </a>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email d\'identifiants envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi des identifiants:', error);
            throw error;
        }
    }

    /**
     * Envoyer une notification d'inscription à l'admin (méthode unifiée)
     * @param {Object} inscriptionData - Données de la demande d'inscription
     */
    async sendNewInscriptionNotification(inscriptionData) {
        const {
            requestId,
            parentName,
            parentEmail,
            parentPhone,
            parentAddress,
            children,
            submittedAt,
            adminEmail
        } = inscriptionData;

        const childrenList = children.map(child =>
            `• ${child.firstName} ${child.lastName} (né(e) le ${child.birthDate})`
        ).join('\n');

        const finalAdminEmail = adminEmail || process.env.TEST_EMAIL || 'sgdigitalweb13@gmail.com';

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: finalAdminEmail,
            subject: '🔔 Nouvelle demande d\'inscription - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff3cd;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu - Administration
                        </h1>
                        
                        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 30px;">
                            <h2 style="color: #856404; margin-top: 0; text-align: center;">
                                🔔 Nouvelle demande d'inscription
                            </h2>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">👨‍👩‍👧‍👦 Informations parent :</h3>
                            <p style="color: #333; margin: 5px 0;"><strong>Nom :</strong> ${parentName}</p>
                            <p style="color: #333; margin: 5px 0;"><strong>Email :</strong> <a href="mailto:${parentEmail}">${parentEmail}</a></p>
                            <p style="color: #333; margin: 5px 0;"><strong>Téléphone :</strong> ${parentPhone || 'Non renseigné'}</p>
                            <p style="color: #333; margin: 5px 0;"><strong>Adresse :</strong> ${parentAddress || 'Non renseignée'}</p>
                            <p style="color: #333; margin: 5px 0;"><strong>ID Demande :</strong> #${requestId}</p>
                        </div>
                        
                        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">👶 Enfant(s) à inscrire :</h3>
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap;">${childrenList}</pre>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📅 Détails de la demande :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                <strong>Reçue le :</strong> ${new Date(submittedAt).toLocaleString('fr-FR')}<br>
                                <strong>Statut :</strong> En attente de validation<br>
                                <strong>Action requise :</strong> Examiner et approuver/rejeter
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.BASE_URL || 'http://localhost:3007'}/admin/inscriptions" 
                               style="background-color: #304a4d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                📋 Gérer les demandes d'inscription
                            </a>
                        </div>
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">⚡ Recommandation :</h3>
                            <p style="color: #856404; margin: 0;">
                                Traitez cette demande sous <strong>48-72 heures</strong> pour maintenir une bonne expérience parent.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 12px;">
                                © École Saint-Mathieu - Système de gestion des inscriptions<br>
                                Notification automatique du ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Notification admin d\'inscription envoyée:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de la notification admin:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer un email de validation de dossier d'inscription
     * @param {Object} dossierData - Données du dossier validé
     * @param {string} comment - Commentaire administratif
     */
    async sendDossierValidationEmail(dossierData, comment = '') {
        const { parentFirstName, parentLastName, parentEmail, enfantPrenom, enfantNom, enfantClasseDemandee } = dossierData;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '✅ Dossier d\'inscription accepté - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fdfc;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 5px solid #ffc107; margin-bottom: 30px;">
                            <h2 style="color: #856404; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                                ✅ Dossier d'inscription accepté
                            </h2>
                            <p style="color: #856404; margin: 0; font-size: 16px;">
                                Votre demande d'inscription a été acceptée. L'inscription sera actée suite au rendez-vous par courrier.
                            </p>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous avons le plaisir de vous informer que la demande d'inscription de <strong>${enfantPrenom} ${enfantNom}</strong> 
                            pour la classe <strong>${enfantClasseDemandee}</strong> a été <strong>acceptée</strong> par notre équipe pédagogique.
                        </p>

                        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #2196F3;">
                            <h3 style="color: #0d47a1; margin-top: 0;">⚠️ Important :</h3>
                            <p style="color: #1565c0; margin: 0; font-size: 15px; font-weight: bold;">
                                L'inscription sera définitivement actée lors du rendez-vous avec la direction, suite à la confirmation par courrier officiel.
                            </p>
                        </div>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #0d47a1; margin-top: 0;">📋 Prochaines étapes :</h3>
                            <ol style="color: #495057; padding-left: 20px; line-height: 1.8;">
                                <li style="margin-bottom: 10px;">Vous recevrez un courrier officiel confirmant l'acceptation</li>
                                <li style="margin-bottom: 10px;">Un rendez-vous sera programmé avec la direction pour finaliser l'inscription</li>
                                <li style="margin-bottom: 10px;">Lors du rendez-vous, vous recevrez les identifiants d'accès au portail parents</li>
                                <li style="margin-bottom: 10px;">Les documents administratifs vous seront remis</li>
                                <li>La classe définitive sera confirmée selon les effectifs</li>
                            </ol>
                        </div>

                        ${comment ? `
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">💬 Message de l'équipe :</h3>
                            <p style="color: #856404; margin: 0;">${comment}</p>
                        </div>
                        ` : ''}

                        <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; margin: 25px 0; border: 2px solid #ffc107;">
                            <h3 style="color: #f57c00; margin-top: 0;">⏳ En attente de finalisation :</h3>
                            <p style="color: #e65100; margin: 0; font-size: 14px; line-height: 1.6;">
                                <strong>Attention :</strong> Ce message confirme l'<strong>acceptation</strong> de votre demande d'inscription. 
                                L'inscription ne sera <strong>définitivement validée</strong> qu'après le rendez-vous avec la direction 
                                et la réception du courrier officiel de confirmation.
                            </p>
                        </div>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">📞 Contact :</h3>
                            <p style="color: #333; margin: 5px 0;">
                                Pour toute question, n'hésitez pas à nous contacter :
                            </p>
                            <ul style="color: #333; padding-left: 20px;">
                                <li>📧 Email : ecole-saint-mathieu@wanadoo.fr</li>
                                <li>📞 Téléphone : [Numéro de téléphone]</li>
                                <li>🏫 Secrétariat : [Horaires d'ouverture]</li>
                            </ul>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous sommes ravis d'avoir accepté la demande d'inscription de <strong>${enfantPrenom}</strong> et nous réjouissons 
                            de pouvoir l'accueillir dans notre établissement après finalisation de l'inscription.
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Cordialement,<br>
                            <strong>L'équipe de direction<br>
                            École Saint-Mathieu</strong>
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 12px;">
                                © École Saint-Mathieu - Notification automatique<br>
                                Envoyé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de validation de dossier envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email de validation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Envoyer un email d'acceptation de demande (pour rendez-vous)
     * @param {Object} requestData - Données de la demande acceptée
     * @param {string} comment - Commentaire administratif
     */
    async sendAppointmentAcceptanceEmail(requestData, comment = '') {
        const { parentFirstName, parentLastName, parentEmail, children } = requestData;

        // Préparer la liste des enfants
        let childrenList = '';
        if (children && Array.isArray(children)) {
            childrenList = children.map(child =>
                `<li><strong>${child.prenom} ${child.nom}</strong> - ${child.classeDemandee || 'Classe à déterminer'}</li>`
            ).join('');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '✅ Demande d\'inscription acceptée - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fdfc;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 5px solid #ffc107; margin-bottom: 30px;">
                            <h2 style="color: #856404; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                                ✅ Demande d'inscription acceptée
                            </h2>
                            <p style="color: #856404; margin: 0; font-size: 16px;">
                                Votre demande a été acceptée. L'inscription sera actée suite au rendez-vous par courrier.
                            </p>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous avons le plaisir de vous informer que votre demande d'inscription a été <strong>acceptée</strong> par notre équipe pédagogique.
                        </p>

                        ${childrenList ? `
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">👶 Enfant(s) concerné(s) :</h3>
                            <ul style="color: #333; padding-left: 20px;">
                                ${childrenList}
                            </ul>
                        </div>
                        ` : ''}

                        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #2196F3;">
                            <h3 style="color: #0d47a1; margin-top: 0;">⚠️ Important :</h3>
                            <p style="color: #1565c0; margin: 0; font-size: 15px; font-weight: bold;">
                                L'inscription sera définitivement actée lors du rendez-vous avec la direction, suite à la confirmation par courrier officiel.
                            </p>
                        </div>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #0d47a1; margin-top: 0;">📋 Prochaines étapes :</h3>
                            <ol style="color: #495057; padding-left: 20px; line-height: 1.8;">
                                <li style="margin-bottom: 10px;">Vous recevrez un <strong>courrier officiel</strong> confirmant l'acceptation de votre demande</li>
                                <li style="margin-bottom: 10px;">Un <strong>rendez-vous</strong> sera programmé avec la direction pour finaliser l'inscription</li>
                                <li style="margin-bottom: 10px;">Lors du rendez-vous, vous recevrez les <strong>identifiants d'accès</strong> au portail parents</li>
                                <li style="margin-bottom: 10px;">Les <strong>documents administratifs</strong> vous seront remis</li>
                                <li>La <strong>classe définitive</strong> sera confirmée selon les effectifs</li>
                            </ol>
                        </div>

                        ${comment ? `
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">💬 Message de l'équipe :</h3>
                            <p style="color: #856404; margin: 0;">${comment}</p>
                        </div>
                        ` : ''}

                        <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; margin: 25px 0; border: 2px solid #ffc107;">
                            <h3 style="color: #f57c00; margin-top: 0;">⏳ En attente de finalisation :</h3>
                            <p style="color: #e65100; margin: 0; font-size: 14px; line-height: 1.6;">
                                <strong>Attention :</strong> Ce message confirme l'<strong>acceptation</strong> de votre demande d'inscription. 
                                L'inscription ne sera <strong>définitivement validée</strong> qu'après le rendez-vous avec la direction 
                                et la réception du courrier officiel de confirmation.
                            </p>
                        </div>

                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">📞 Contact :</h3>
                            <p style="color: #333; margin: 5px 0;">
                                Pour toute question, n'hésitez pas à nous contacter :
                            </p>
                            <ul style="color: #333; padding-left: 20px;">
                                <li>📧 Email : ecole-saint-mathieu@wanadoo.fr</li>
                                <li>📞 Téléphone : [Numéro de téléphone]</li>
                                <li>🏫 Secrétariat : [Horaires d'ouverture]</li>
                            </ul>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous sommes ravis d'avoir accepté votre demande et nous réjouissons 
                            de pouvoir accueillir votre/vos enfant(s) dans notre établissement après finalisation de l'inscription.
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Cordialement,<br>
                            <strong>L'équipe de direction<br>
                            École Saint-Mathieu</strong>
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #666; font-size: 12px;">
                                © École Saint-Mathieu - Notification automatique<br>
                                Envoyé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email d\'acceptation de rendez-vous envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email d\'acceptation:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
