const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

const parentInvitationController = {
    // Afficher la page de gestion des invitations (pour le directeur)
    async showInvitationManagement(req, res) {
        try {
            if (req.session.user.role !== 'DIRECTION' && req.session.user.role !== 'ADMIN') {
                return res.status(403).render('pages/error', {
                    message: 'Accès refusé. Réservé aux directeurs.'
                });
            }

            // Récupérer toutes les invitations
            const invitations = await prisma.parentInvitation.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50 // Limiter à 50 résultats
            });

            // Récupérer les classes disponibles
            const classes = await prisma.classe.findMany({
                orderBy: { nom: 'asc' }
            });

            res.render('pages/direction/parent-invitations', {
                title: 'Gestion des Invitations Parents',
                invitations,
                classes
            });

        } catch (error) {
            console.error('Erreur affichage gestion invitations:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de l\'affichage de la gestion des invitations'
            });
        }
    },

    // Créer et envoyer une invitation
    async createAndSendInvitation(req, res) {
        try {
            if (req.session.user.role !== 'DIRECTION' && req.session.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Accès refusé' });
            }

            const {
                parentEmail,
                parentFirstName,
                parentLastName,
                childFirstName,
                childLastName,
                childDateNaissance,
                classeId
            } = req.body;

            // Vérifier si le parent existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: parentEmail }
            });

            if (existingUser) {
                return res.status(400).json({
                    error: 'Un compte avec cet email existe déjà'
                });
            }

            // Vérifier si une invitation existe déjà pour cet email
            const existingInvitation = await prisma.parentInvitation.findFirst({
                where: {
                    parentEmail: parentEmail,
                    used: false
                }
            });

            if (existingInvitation) {
                return res.status(400).json({
                    error: 'Une invitation non utilisée existe déjà pour cet email'
                });
            }

            // Générer un token unique
            const token = crypto.randomBytes(32).toString('hex');

            // Calculer la date d'expiration (7 jours)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            // Créer l'invitation
            const invitation = await prisma.parentInvitation.create({
                data: {
                    token,
                    parentEmail,
                    parentFirstName,
                    parentLastName,
                    childFirstName,
                    childLastName,
                    childDateNaissance: childDateNaissance ? new Date(childDateNaissance) : null,
                    classeId: classeId ? parseInt(classeId) : null,
                    createdBy: req.session.user.id,
                    expiresAt
                }
            });

            // Envoyer l'email
            const emailSent = await this.sendInvitationEmail(invitation);

            if (emailSent) {
                // Marquer l'email comme envoyé
                await prisma.parentInvitation.update({
                    where: { id: invitation.id },
                    data: { emailSent: true }
                });
            }

            res.json({
                success: true,
                message: emailSent ? 'Invitation créée et email envoyé avec succès' : 'Invitation créée mais erreur d\'envoi d\'email',
                invitation: {
                    id: invitation.id,
                    token: invitation.token,
                    parentEmail: invitation.parentEmail,
                    emailSent
                }
            });

        } catch (error) {
            console.error('Erreur création invitation:', error);
            res.status(500).json({
                error: 'Erreur lors de la création de l\'invitation'
            });
        }
    },

    // Envoyer l'email d'invitation
    async sendInvitationEmail(invitation) {
        try {
            // Configuration du transporteur email (à adapter selon votre service)
            const transporter = nodemailer.createTransporter({
                // Exemple avec Gmail - à adapter selon votre configuration
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
                    pass: process.env.EMAIL_PASS || 'votre_mot_de_passe'
                }
            });

            const invitationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/register/${invitation.token}`;

            const mailOptions = {
                from: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
                to: invitation.parentEmail,
                subject: 'Invitation à créer votre compte - École Saint-Mathieu',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #0d9488;">École Saint-Mathieu</h2>
                        
                        <p>Bonjour ${invitation.parentFirstName} ${invitation.parentLastName},</p>
                        
                        <p>Nous avons le plaisir de vous inviter à créer votre compte parent sur notre plateforme numérique pour suivre la scolarité de votre enfant <strong>${invitation.childFirstName} ${invitation.childLastName}</strong>.</p>
                        
                        <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Pour créer votre compte, cliquez sur le lien ci-dessous :</strong></p>
                            <p style="margin: 10px 0;">
                                <a href="${invitationUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Créer mon compte
                                </a>
                            </p>
                        </div>
                        
                        <p><strong>Important :</strong> Ce lien est valide pendant 7 jours à compter de sa réception.</p>
                        
                        <p>Une fois votre compte créé, vous pourrez :</p>
                        <ul>
                            <li>Consulter les notes et absences de votre enfant</li>
                            <li>Acheter et gérer les tickets de cantine</li>
                            <li>Communiquer avec l'équipe pédagogique</li>
                            <li>Suivre les actualités de l'école</li>
                        </ul>
                        
                        <p>Si vous rencontrez des difficultés, n'hésitez pas à nous contacter.</p>
                        
                        <p>Cordialement,<br>
                        L'équipe de l'École Saint-Mathieu</p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px;">
                            Si le lien ne fonctionne pas, copiez et collez cette URL dans votre navigateur :<br>
                            ${invitationUrl}
                        </p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('Email d\'invitation envoyé à:', invitation.parentEmail);
            return true;

        } catch (error) {
            console.error('Erreur envoi email:', error);
            return false;
        }
    },

    // Afficher le formulaire d'inscription avec token
    async showRegistrationForm(req, res) {
        try {
            const { token } = req.params;

            // Vérifier que le token est valide
            const invitation = await prisma.parentInvitation.findUnique({
                where: { token },
                include: {
                    classeId: {
                        include: {
                            classe: true
                        }
                    }
                }
            });

            if (!invitation) {
                return res.status(404).render('pages/error', {
                    message: 'Lien d\'invitation invalide ou expiré'
                });
            }

            if (invitation.used) {
                return res.status(400).render('pages/error', {
                    message: 'Cette invitation a déjà été utilisée'
                });
            }

            if (invitation.expiresAt && new Date() > invitation.expiresAt) {
                return res.status(400).render('pages/error', {
                    message: 'Cette invitation a expiré. Veuillez contacter l\'école.'
                });
            }

            // Pré-remplir les données du formulaire
            const formData = {
                parentFirstName: invitation.parentFirstName,
                parentLastName: invitation.parentLastName,
                email: invitation.parentEmail,
                childFirstName: invitation.childFirstName,
                childLastName: invitation.childLastName,
                childDateNaissance: invitation.childDateNaissance ? invitation.childDateNaissance.toISOString().split('T')[0] : ''
            };

            res.render('pages/auth/register-with-invitation', {
                title: 'Création de votre compte - École Saint-Mathieu',
                invitation,
                formData
            });

        } catch (error) {
            console.error('Erreur affichage formulaire invitation:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de l\'affichage du formulaire'
            });
        }
    },

    // Traiter l'inscription avec invitation
    async processInvitationRegistration(req, res) {
        try {
            const { token } = req.params;
            const { password, confirmPassword, phone, adress } = req.body;

            // Vérifier les mots de passe
            if (password !== confirmPassword) {
                return res.status(400).json({
                    error: 'Les mots de passe ne correspondent pas'
                });
            }

            // Validation de la complexité du mot de passe
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    error: 'Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
                });
            }

            // Récupérer l'invitation
            const invitation = await prisma.parentInvitation.findUnique({
                where: { token }
            });

            if (!invitation || invitation.used || (invitation.expiresAt && new Date() > invitation.expiresAt)) {
                return res.status(400).json({
                    error: 'Invitation invalide ou expirée'
                });
            }

            // Vérifier si l'email n'est pas déjà utilisé
            const existingUser = await prisma.user.findUnique({
                where: { email: invitation.parentEmail }
            });

            if (existingUser) {
                return res.status(400).json({
                    error: 'Un compte avec cet email existe déjà'
                });
            }

            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);

            // Transaction pour créer l'utilisateur et l'enfant
            const result = await prisma.$transaction(async (tx) => {
                // Créer l'utilisateur parent
                const user = await tx.user.create({
                    data: {
                        firstName: invitation.parentFirstName,
                        lastName: invitation.parentLastName,
                        email: invitation.parentEmail,
                        password: hashedPassword,
                        phone: phone || '',
                        adress: adress || '',
                        role: 'PARENT'
                    }
                });

                // Créer l'enfant si les informations sont disponibles
                let student = null;
                if (invitation.childFirstName && invitation.childLastName) {
                    student = await tx.student.create({
                        data: {
                            firstName: invitation.childFirstName,
                            lastName: invitation.childLastName,
                            dateNaissance: invitation.childDateNaissance || new Date(),
                            parentId: user.id,
                            classeId: invitation.classeId || 1 // Classe par défaut si non spécifiée
                        }
                    });
                }

                // Marquer l'invitation comme utilisée
                await tx.parentInvitation.update({
                    where: { id: invitation.id },
                    data: {
                        used: true,
                        usedAt: new Date()
                    }
                });

                return { user, student };
            });

            res.json({
                success: true,
                message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName
                }
            });

        } catch (error) {
            console.error('Erreur traitement inscription invitation:', error);
            res.status(500).json({
                error: 'Erreur lors de la création du compte'
            });
        }
    },

    // Supprimer une invitation
    async deleteInvitation(req, res) {
        try {
            if (req.session.user.role !== 'DIRECTION' && req.session.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Accès refusé' });
            }

            const { id } = req.params;

            await prisma.parentInvitation.delete({
                where: { id: parseInt(id) }
            });

            res.json({
                success: true,
                message: 'Invitation supprimée avec succès'
            });

        } catch (error) {
            console.error('Erreur suppression invitation:', error);
            res.status(500).json({
                error: 'Erreur lors de la suppression'
            });
        }
    },

    // Renvoyer un email d'invitation
    async resendInvitation(req, res) {
        try {
            if (req.session.user.role !== 'DIRECTION' && req.session.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Accès refusé' });
            }

            const { id } = req.params;

            const invitation = await prisma.parentInvitation.findUnique({
                where: { id: parseInt(id) }
            });

            if (!invitation) {
                return res.status(404).json({ error: 'Invitation non trouvée' });
            }

            if (invitation.used) {
                return res.status(400).json({ error: 'Cette invitation a déjà été utilisée' });
            }

            // Envoyer l'email
            const emailSent = await this.sendInvitationEmail(invitation);

            if (emailSent) {
                await prisma.parentInvitation.update({
                    where: { id: invitation.id },
                    data: { emailSent: true }
                });
            }

            res.json({
                success: true,
                message: emailSent ? 'Email renvoyé avec succès' : 'Erreur lors de l\'envoi de l\'email'
            });

        } catch (error) {
            console.error('Erreur renvoi invitation:', error);
            res.status(500).json({
                error: 'Erreur lors du renvoi'
            });
        }
    }
};

module.exports = parentInvitationController;
