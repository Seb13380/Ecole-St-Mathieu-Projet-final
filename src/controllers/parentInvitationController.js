const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const parentInvitationController = {
    // Afficher le formulaire d'inscription avec token
    async showRegistrationForm(req, res) {
        try {
            const { token } = req.params;

            // Vérifier si le token existe et est valide
            const invitation = await prisma.parentInvitation.findUnique({
                where: { token: token }
            });

            if (!invitation) {
                return res.status(404).render('pages/error', {
                    message: 'Lien d\'invitation invalide ou expiré',
                    user: null
                });
            }

            if (invitation.used) {
                return res.status(400).render('pages/error', {
                    message: 'Cette invitation a déjà été utilisée',
                    user: null
                });
            }

            // Vérifier si l'invitation n'est pas expirée
            if (invitation.expiresAt && new Date() > invitation.expiresAt) {
                return res.status(400).render('pages/error', {
                    message: 'Cette invitation a expiré',
                    user: null
                });
            }

            res.render('pages/auth/register-with-invitation', {
                title: 'Inscription avec invitation - École Saint-Mathieu',
                invitation: invitation,
                token: token,
                error: req.query.error,
                success: req.query.success
            });

        } catch (error) {
            console.error('Erreur affichage formulaire invitation:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de l\'affichage du formulaire',
                user: null
            });
        }
    },

    // Traiter l'inscription avec token d'invitation
    async processInvitationRegistration(req, res) {
        try {
            const { token } = req.params;
            const { password, confirmPassword, phone, address } = req.body;

            // Validation des mots de passe
            if (password !== confirmPassword) {
                return res.redirect(`/auth/register/${token}?error=Les mots de passe ne correspondent pas`);
            }

            if (password.length < 6) {
                return res.redirect(`/auth/register/${token}?error=Le mot de passe doit contenir au moins 6 caractères`);
            }

            // Vérifier le token d'invitation
            const invitation = await prisma.parentInvitation.findUnique({
                where: { token: token }
            });

            if (!invitation || invitation.used) {
                return res.redirect(`/auth/register/${token}?error=Invitation invalide ou déjà utilisée`);
            }

            if (invitation.expiresAt && new Date() > invitation.expiresAt) {
                return res.redirect(`/auth/register/${token}?error=Invitation expirée`);
            }

            // Vérifier si l'email existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: invitation.parentEmail }
            });

            if (existingUser) {
                return res.redirect(`/auth/register/${token}?error=Un compte avec cet email existe déjà`);
            }

            // Hacher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 12);

            // Transaction pour créer le compte et marquer l'invitation comme utilisée
            await prisma.$transaction(async (tx) => {
                // Créer le compte parent
                const parent = await tx.user.create({
                    data: {
                        firstName: invitation.parentFirstName,
                        lastName: invitation.parentLastName,
                        email: invitation.parentEmail,
                        password: hashedPassword,
                        phone: phone || '',
                        adress: address || '',
                        role: 'PARENT'
                    }
                });

                // Créer l'enfant si les informations sont disponibles
                if (invitation.childFirstName && invitation.childLastName && invitation.childDateNaissance) {
                    // Récupérer la classe ou créer une classe par défaut
                    let classe;
                    if (invitation.classeId) {
                        classe = await tx.classe.findUnique({
                            where: { id: invitation.classeId }
                        });
                    }

                    if (!classe) {
                        classe = await tx.classe.findFirst({
                            where: { nom: 'Non assigné' }
                        });

                        if (!classe) {
                            classe = await tx.classe.create({
                                data: {
                                    nom: 'Non assigné',
                                    niveau: 'A définir',
                                    anneeScolaire: new Date().getFullYear().toString()
                                }
                            });
                        }
                    }

                    await tx.student.create({
                        data: {
                            firstName: invitation.childFirstName,
                            lastName: invitation.childLastName,
                            dateNaissance: invitation.childDateNaissance,
                            parentId: parent.id,
                            classeId: classe.id
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
            });

            res.redirect('/auth/login?success=Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.');

        } catch (error) {
            console.error('Erreur traitement invitation:', error);
            res.redirect(`/auth/register/${token}?error=Une erreur est survenue lors de la création de votre compte`);
        }
    },

    // Afficher les demandes d'inscription pour le directeur
    async showInvitationManagement(req, res) {
        try {
            if (req.session.user.role !== 'DIRECTION' && req.session.user.role !== 'ADMIN') {
                return res.status(403).render('pages/error', {
                    message: 'Accès refusé. Réservé aux directeurs.',
                    user: req.session.user
                });
            }

            // Récupérer les demandes d'inscription
            const requests = await prisma.inscriptionRequest.findMany({
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'desc' }
            });

            // Calculer les statistiques
            const stats = {
                pending: await prisma.inscriptionRequest.count({ where: { status: 'PENDING' } }),
                approved: await prisma.inscriptionRequest.count({ where: { status: 'APPROVED' } }),
                rejected: await prisma.inscriptionRequest.count({ where: { status: 'REJECTED' } }),
                total: await prisma.inscriptionRequest.count()
            };

            res.render('pages/direction/parent-invitations', {
                title: 'Gestion des demandes d\'inscription',
                requests,
                stats,
                user: req.session.user
            });

        } catch (error) {
            console.error('Erreur affichage demandes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de l\'affichage des demandes',
                user: req.session.user
            });
        }
    },

    // Approuver une demande d'inscription
    async approveInscription(req, res) {
        try {
            if (req.session.user.role !== 'DIRECTION' && req.session.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Accès refusé' });
            }

            const { id } = req.params;

            // Récupérer la demande
            const request = await prisma.inscriptionRequest.findUnique({
                where: { id: parseInt(id) }
            });

            if (!request) {
                return res.status(404).json({ error: 'Demande non trouvée' });
            }

            if (request.status !== 'PENDING') {
                return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
            }

            // Générer un mot de passe temporaire
            const tempPassword = 'Parent' + Math.random().toString(36).slice(-8) + '!';
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            // Transaction pour créer le compte parent et l'enfant
            const result = await prisma.$transaction(async (tx) => {
                // Créer le compte parent
                const parent = await tx.user.create({
                    data: {
                        firstName: request.parentFirstName,
                        lastName: request.parentLastName,
                        email: request.parentEmail,
                        password: hashedPassword,
                        phone: request.parentPhone || '',
                        adress: request.parentAddress || '',
                        role: 'PARENT'
                    }
                });

                // Créer l'enfant
                const student = await tx.student.create({
                    data: {
                        firstName: request.childFirstName,
                        lastName: request.childLastName,
                        dateNaissance: new Date(request.childBirthDate),
                        parentId: parent.id,
                        classeId: 1 // Classe par défaut, à ajuster
                    }
                });

                // Mettre à jour le statut de la demande
                await tx.inscriptionRequest.update({
                    where: { id: request.id },
                    data: {
                        status: 'APPROVED',
                        reviewedAt: new Date(),
                        reviewedBy: req.session.user.id
                    }
                });

                return { parent, student, tempPassword };
            });

            // Envoyer l'email de confirmation avec les identifiants
            await this.sendApprovalEmail(request, result.tempPassword);

            res.json({
                success: true,
                message: 'Demande approuvée et compte créé'
            });

        } catch (error) {
            console.error('Erreur approbation:', error);
            res.status(500).json({ error: 'Erreur lors de l\'approbation' });
        }
    },

    // Refuser une demande d'inscription
    async rejectInscription(req, res) {
        try {
            if (req.session.user.role !== 'DIRECTION' && req.session.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Accès refusé' });
            }

            const { id } = req.params;
            const { reason } = req.body;

            const request = await prisma.inscriptionRequest.findUnique({
                where: { id: parseInt(id) }
            });

            if (!request || request.status !== 'PENDING') {
                return res.status(400).json({ error: 'Demande invalide' });
            }

            // Mettre à jour le statut
            await prisma.inscriptionRequest.update({
                where: { id: request.id },
                data: {
                    status: 'REJECTED',
                    reviewedAt: new Date(),
                    reviewedBy: req.session.user.id,
                    rejectionReason: reason || ''
                }
            });

            // Envoyer l'email de refus
            await this.sendRejectionEmail(request, reason);

            res.json({
                success: true,
                message: 'Demande refusée'
            });

        } catch (error) {
            console.error('Erreur refus:', error);
            res.status(500).json({ error: 'Erreur lors du refus' });
        }
    },

    // Envoyer l'email d'approbation
    async sendApprovalEmail(request, tempPassword) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
                    pass: process.env.EMAIL_PASS || 'password'
                }
            });

            const mailOptions = {
                from: 'ecole@saint-mathieu.fr',
                to: request.parentEmail,
                subject: 'Inscription approuvée - École Saint-Mathieu',
                html: `
                    <h2>Bienvenue à l'École Saint-Mathieu !</h2>
                    <p>Bonjour ${request.parentFirstName} ${request.parentLastName},</p>
                    <p>Votre demande d'inscription a été approuvée.</p>
                    <p><strong>Vos identifiants de connexion :</strong></p>
                    <ul>
                        <li>Email : ${request.parentEmail}</li>
                        <li>Mot de passe temporaire : ${tempPassword}</li>
                    </ul>
                    <p>Connectez-vous sur notre plateforme et changez votre mot de passe.</p>
                    <p>Cordialement,<br>L'École Saint-Mathieu</p>
                `
            };

            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Erreur envoi email:', error);
            return false;
        }
    },

    // Envoyer l'email de refus
    async sendRejectionEmail(request, reason) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
                    pass: process.env.EMAIL_PASS || 'password'
                }
            });

            const mailOptions = {
                from: 'ecole@saint-mathieu.fr',
                to: request.parentEmail,
                subject: 'Demande d\'inscription - École Saint-Mathieu',
                html: `
                    <p>Bonjour ${request.parentFirstName} ${request.parentLastName},</p>
                    <p>Nous avons examiné votre demande d'inscription.</p>
                    <p>Malheureusement, nous ne pouvons pas donner suite à votre demande pour le moment.</p>
                    ${reason ? `<p>Motif : ${reason}</p>` : ''}
                    <p>N'hésitez pas à nous contacter pour plus d'informations.</p>
                    <p>Cordialement,<br>L'École Saint-Mathieu</p>
                `
            };

            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Erreur envoi email:', error);
            return false;
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

            // Vérifier si l'email existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: parentEmail }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Un compte avec cet email existe déjà' });
            }

            // Vérifier si une invitation existe déjà pour cet email
            const existingInvitation = await prisma.parentInvitation.findUnique({
                where: { parentEmail: parentEmail }
            });

            if (existingInvitation && !existingInvitation.used) {
                return res.status(400).json({ error: 'Une invitation pour cet email existe déjà' });
            }

            // Générer un token unique
            const token = require('crypto').randomBytes(32).toString('hex');

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
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
                }
            });

            // Envoyer l'email d'invitation
            await this.sendInvitationEmail(invitation);

            res.json({
                success: true,
                message: 'Invitation créée et envoyée avec succès'
            });

        } catch (error) {
            console.error('Erreur création invitation:', error);
            res.status(500).json({ error: 'Erreur lors de la création de l\'invitation' });
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
                message: 'Invitation supprimée'
            });

        } catch (error) {
            console.error('Erreur suppression invitation:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression' });
        }
    },

    // Renvoyer une invitation
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

            // Générer un nouveau token et prolonger l'expiration
            const newToken = require('crypto').randomBytes(32).toString('hex');

            const updatedInvitation = await prisma.parentInvitation.update({
                where: { id: invitation.id },
                data: {
                    token: newToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
                    emailSent: false
                }
            });

            // Renvoyer l'email
            await this.sendInvitationEmail(updatedInvitation);

            res.json({
                success: true,
                message: 'Invitation renvoyée avec succès'
            });

        } catch (error) {
            console.error('Erreur renvoi invitation:', error);
            res.status(500).json({ error: 'Erreur lors du renvoi' });
        }
    },

    // Envoyer l'email d'invitation
    async sendInvitationEmail(invitation) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'ecole@saint-mathieu.fr',
                    pass: process.env.EMAIL_PASS || 'password'
                }
            });

            const registrationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/register/${invitation.token}`;

            const mailOptions = {
                from: 'ecole@saint-mathieu.fr',
                to: invitation.parentEmail,
                subject: 'Invitation à rejoindre l\'École Saint-Mathieu',
                html: `
                    <h2>Invitation à rejoindre l'École Saint-Mathieu</h2>
                    <p>Bonjour ${invitation.parentFirstName} ${invitation.parentLastName},</p>
                    <p>Vous êtes invité(e) à créer votre compte parent sur notre plateforme.</p>
                    ${invitation.childFirstName ? `<p>Pour votre enfant : ${invitation.childFirstName} ${invitation.childLastName}</p>` : ''}
                    <p><a href="${registrationUrl}">Cliquez ici pour créer votre compte</a></p>
                    <p>Ce lien expire dans 7 jours.</p>
                    <p>Cordialement,<br>L'École Saint-Mathieu</p>
                `
            };

            await transporter.sendMail(mailOptions);

            // Marquer l'email comme envoyé
            await prisma.parentInvitation.update({
                where: { id: invitation.id },
                data: { emailSent: true }
            });

            return true;
        } catch (error) {
            console.error('Erreur envoi email invitation:', error);
            return false;
        }
    }
};

module.exports = parentInvitationController;
