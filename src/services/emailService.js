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
                        
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">⏳ Prochaines étapes :</h3>
                            <ol style="color: #856404; margin: 0; padding-left: 20px;">
                                <li>Votre demande est en cours d'examen par notre équipe</li>
                                <li>Nous vous contacterons dans les <strong>2-3 jours ouvrables</strong></li>
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
                                📧 Email : <a href="mailto:support@saint-mathieu.fr" style="color: #304a4d;">support@saint-mathieu.fr</a><br>
                                📞 Téléphone : 01 23 45 67 89
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
     * Envoyer un email d'approbation de demande d'inscription
     * @param {Object} inscriptionData - Données de la demande d'inscription
     * @param {string} reviewComment - Commentaire de l'admin
     */
    async sendApprovalEmail(inscriptionData, reviewComment) {
        const { parentFirstName, parentLastName, parentEmail, children } = inscriptionData;

        const childrenList = children.map(child =>
            `• ${child.firstName} ${child.lastName}`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '🎉 Demande d\'inscription approuvée - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #304a4d; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 30px;">
                            <h2 style="color: #155724; margin-top: 0; text-align: center;">
                                ✅ Félicitations ! Votre demande est acceptée
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous avons le plaisir de vous informer que votre demande d'inscription a été <strong>approuvée</strong> pour :
                        </p>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #304a4d; margin-top: 0;">👶 Enfant(s) accepté(s) :</h3>
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap;">${childrenList}</pre>
                        </div>

                        ${reviewComment ? `
                        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #004085; margin-top: 0;">💬 Message de l'équipe :</h3>
                            <p style="color: #004085; margin: 0; font-style: italic;">"${reviewComment}"</p>
                        </div>
                        ` : ''}
                        
                        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                            <h3 style="color: #856404; margin-top: 0;">📋 Prochaines étapes :</h3>
                            <ol style="color: #856404; margin: 0; padding-left: 20px;">
                                <li><strong>Votre compte parent sera créé automatiquement</strong></li>
                                <li>Vous recevrez vos identifiants de connexion par email</li>
                                <li>Vous pourrez accéder à l'espace parent pour suivre la scolarité</li>
                                <li>Notre secrétariat vous contactera pour finaliser l'inscription</li>
                            </ol>
                        </div>
                        
                        <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #0c5460; margin-top: 0;">📞 Contact :</h3>
                            <p style="color: #0c5460; margin: 0;">
                                Secrétariat : <strong>01 23 45 67 89</strong><br>
                                Email : <a href="mailto:ecole-saint-mathieu@wanadoo.fr" style="color: #304a4d;">ecole-saint-mathieu@wanadoo.fr</a>
                            </p>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; margin-top: 30px;">
                            Nous sommes ravis d'accueillir votre famille dans notre établissement !<br><br>
                            Cordialement,<br>
                            <strong>L'équipe de l'École Saint-Mathieu</strong>
                        </p>
                    </div>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email d\'approbation envoyé:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email d\'approbation:', error);
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
                                Support technique : <a href="mailto:support@saint-mathieu.fr" style="color: #304a4d;">support@saint-mathieu.fr</a><br>
                                Téléphone : 01 23 45 67 89
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
                                Email : <a href="mailto:support@saint-mathieu.fr" style="color: #304a4d;">support@saint-mathieu.fr</a><br>
                                Téléphone : 01 23 45 67 89
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
                                Téléphone : 01 23 45 67 89
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
     * Envoyer un email d'approbation avec identifiants de connexion
     * @param {Object} inscriptionData - Données de la demande d'inscription
     * @param {String} tempPassword - Mot de passe temporaire généré
     * @param {String} comment - Commentaire du directeur
     */
    async sendApprovalEmailWithCredentials(inscriptionData, comment = '') {
        const { parentFirstName, parentLastName, parentEmail, children, tempPassword, createdStudents } = inscriptionData;

        const childrenList = createdStudents ? createdStudents.map(student =>
            `• ${student.firstName} ${student.lastName} - Classe: ${student.classe?.nom || 'Non assigné'}`
        ).join('\n') : 'Enfants inscrits';

        const mailOptions = {
            from: process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr',
            to: process.env.TEST_MODE === 'true' ? process.env.TEST_EMAIL : parentEmail,
            subject: '🎉 Inscription approuvée - Vos identifiants de connexion - École Saint-Mathieu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h1 style="color: #16a34a; text-align: center; margin-bottom: 30px;">
                            🎓 École Saint-Mathieu
                        </h1>
                        
                        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 30px;">
                            <h2 style="color: #16a34a; margin: 0; font-size: 24px;">
                                ✅ Félicitations ! Votre demande d'inscription a été approuvée
                            </h2>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; font-size: 16px;">
                            Bonjour <strong>${parentFirstName} ${parentLastName}</strong>,
                        </p>
                        
                        <p style="color: #333; line-height: 1.6;">
                            Nous sommes ravis de vous informer que votre demande d'inscription a été acceptée. 
                            Votre/vos enfant(s) sont désormais officiellement inscrits à l'École Saint-Mathieu !
                        </p>

                        ${comment ? `
                        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                            <h3 style="color: #3b82f6; margin-top: 0;">💬 Message de la direction :</h3>
                            <p style="color: #333; margin: 0; font-style: italic;">"${comment}"</p>
                        </div>
                        ` : ''}
                        
                        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #92400e; margin-top: 0;">👶 Enfant(s) inscrit(s) :</h3>
                            <pre style="color: #333; font-family: Arial; white-space: pre-wrap; margin: 0;">${childrenList}</pre>
                        </div>
                        
                        <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 30px 0; border: 2px solid #0284c7;">
                            <h3 style="color: #0284c7; margin-top: 0;">🔑 Vos identifiants de connexion</h3>
                            <p style="color: #333; margin: 10px 0;"><strong>Email :</strong> ${parentEmail}</p>
                            <p style="color: #333; margin: 10px 0;"><strong>Mot de passe temporaire :</strong> 
                                <span style="background-color: #f1f5f9; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold;">${tempPassword}</span>
                            </p>
                            <p style="color: #dc2626; font-size: 14px; margin-top: 15px;">
                                ⚠️ <strong>Important :</strong> Changez ce mot de passe dès votre première connexion pour votre sécurité.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3007/auth/login" 
                               style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                🚀 Se connecter à l'espace parent
                            </a>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #495057; margin-top: 0;">📋 Prochaines étapes :</h3>
                            <ul style="color: #333; line-height: 1.6;">
                                <li>Connectez-vous à votre espace parent avec les identifiants ci-dessus</li>
                                <li>Modifiez votre mot de passe temporaire</li>
                                <li>Consultez les informations de votre/vos enfant(s)</li>
                                <li>Vérifiez les coordonnées et mettez-les à jour si nécessaire</li>
                                <li>Prenez connaissance du calendrier scolaire et des actualités</li>
                            </ul>
                        </div>
                        
                        <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
                            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                📧 École Saint-Mathieu - ${process.env.EMAIL_USER || 'ecole-saint-mathieu@wanadoo.fr'}
                            </p>
                            <p style="color: #666; font-size: 14px; margin: 5px 0;">
                                📍 Adresse de l'école - 📞 Téléphone de l'école
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
                                Email : <a href="mailto:support@saint-mathieu.fr" style="color: #304a4d;">support@saint-mathieu.fr</a><br>
                                Téléphone : 01 23 45 67 89
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
                                Email : <a href="mailto:support@saint-mathieu.fr" style="color: #304a4d;">support@saint-mathieu.fr</a><br>
                                Téléphone : 01 23 45 67 89
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
}

module.exports = new EmailService();
