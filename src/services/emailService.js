const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Configuration du transporteur email
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Ou votre service email
            auth: {
                user: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
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
            from: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
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
                                Pour toute question : <a href="mailto:ecole@saint-mathieu.fr" style="color: #304a4d;">ecole@saint-mathieu.fr</a><br>
                                Téléphone : 01 23 45 67 89
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
            from: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
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
            from: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
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
                                Email : <a href="mailto:ecole@saint-mathieu.fr" style="color: #304a4d;">ecole@saint-mathieu.fr</a>
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
            from: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
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
                                Pour toute question : <a href="mailto:ecole@saint-mathieu.fr" style="color: #304a4d;">ecole@saint-mathieu.fr</a><br>
                                Téléphone : 01 23 45 67 89
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
            from: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
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
            from: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
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
            from: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
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
            from: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
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
                                Pour toute question : <a href="mailto:ecole@saint-mathieu.fr" style="color: #304a4d;">ecole@saint-mathieu.fr</a><br>
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
}

module.exports = new EmailService();
