const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

class PreInscriptionController {
    // Configuration du transporteur email (Nodemailer)
    static getEmailTransporter() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'sgdigitalweb13@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Mot de passe d'application Gmail
            }
        });
    }    // Afficher le formulaire de pré-inscription
    static async showPreInscriptionForm(req, res) {
        try {
            res.render('pages/pre-inscription', {
                title: 'Pré-inscription - École St Mathieu',
                user: req.user || null,
                errors: req.flash('errors'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du formulaire:', error);
            res.status(500).render('pages/error', { message: 'Erreur serveur' });
        }
    }

    // Traiter la soumission de pré-inscription
    static async submitPreInscription(req, res) {
        try {
            const {
                childFirstName,
                childLastName,
                childDateNaissance,
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                parentAdress,
                parentPassword
            } = req.body;

            // Validation des données
            if (!childFirstName || !childLastName || !parentFirstName ||
                !parentLastName || !parentEmail || !parentPhone ||
                !parentAdress || !parentPassword) {
                req.flash('errors', 'Tous les champs sont obligatoires');
                return res.redirect('/pre-inscription');
            }

            // Vérifier si l'email existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: parentEmail }
            });

            const existingPreInscription = await prisma.preInscription.findUnique({
                where: { parentEmail: parentEmail }
            });

            if (existingUser || existingPreInscription) {
                req.flash('errors', 'Cet email est déjà utilisé');
                return res.redirect('/pre-inscription');
            }

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(parentPassword, 10);

            // Créer la pré-inscription
            const preInscription = await prisma.preInscription.create({
                data: {
                    childFirstName,
                    childLastName,
                    childDateNaissance: childDateNaissance ? new Date(childDateNaissance) : null,
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    parentAdress,
                    parentPassword: hashedPassword,
                    status: 'PENDING'
                }
            });

            // Envoyer notification email au directeur
            await this.sendNotificationToDirector(preInscription);

            req.flash('success', 'Votre demande de pré-inscription a été envoyée. Vous recevrez une confirmation par email une fois votre demande traitée.');
            res.redirect('/pre-inscription');

        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            req.flash('errors', 'Erreur lors de l\'envoi de votre demande. Veuillez réessayer.');
            res.redirect('/pre-inscription');
        }
    }

    // Envoyer notification email au directeur
    static async sendNotificationToDirector(preInscription) {
        try {
            const transporter = this.getEmailTransporter();

            // Email de test (votre email pour tous les tests)
            const directorEmail = 'sgdigitalweb13@gmail.com';

            const mailOptions = {
                from: process.env.EMAIL_USER || 'sgdigitalweb13@gmail.com',
                to: directorEmail,
                subject: `🎓 Nouvelle pré-inscription #${preInscription.id} - École St Mathieu`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
            <!-- En-tête -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🎓 École St Mathieu</h1>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Nouvelle demande de pré-inscription</p>
            </div>
            
            <!-- Alerte priorité -->
            <div style="background: #fbbf24; color: #92400e; padding: 1rem; text-align: center; font-weight: bold;">
              ⚡ DEMANDE EN ATTENTE - Action requise
            </div>

            <!-- Contenu principal -->
            <div style="padding: 2rem;">
              <!-- Résumé rapide -->
              <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border-left: 4px solid #667eea;">
                <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📋 Résumé de la demande #${preInscription.id}</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                  <div>
                    <strong style="color: #6b7280;">👶 Enfant:</strong><br>
                    <span style="font-size: 18px; color: #2563eb; font-weight: bold;">${preInscription.childFirstName} ${preInscription.childLastName}</span>
                  </div>
                  <div>
                    <strong style="color: #6b7280;">👨‍👩‍👧‍👦 Parent:</strong><br>
                    <span style="font-size: 18px; color: #059669; font-weight: bold;">${preInscription.parentFirstName} ${preInscription.parentLastName}</span>
                  </div>
                </div>
                <p style="margin: 1rem 0 0 0; color: #6b7280;">
                  <strong>📅 Reçue le:</strong> ${preInscription.createdAt.toLocaleDateString('fr-FR')} à ${preInscription.createdAt.toLocaleTimeString('fr-FR')}
                </p>
              </div>

              <!-- Informations détaillées de l'enfant -->
              <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h3 style="color: #374151; margin-top: 0; display: flex; align-items: center; gap: 0.5rem;">
                  👶 Informations de l'enfant
                </h3>
                <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px;">
                  <p><strong>Prénom:</strong> ${preInscription.childFirstName}</p>
                  <p><strong>Nom:</strong> ${preInscription.childLastName}</p>
                  <p><strong>Date de naissance:</strong> ${preInscription.childDateNaissance ? preInscription.childDateNaissance.toLocaleDateString('fr-FR') : '❌ Non renseignée'}</p>
                  ${preInscription.childDateNaissance ? `<p><strong>Âge approximatif:</strong> ${Math.floor((new Date() - new Date(preInscription.childDateNaissance)) / (365.25 * 24 * 60 * 60 * 1000))} ans</p>` : ''}
                </div>
              </div>

              <!-- Informations détaillées du parent -->
              <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h3 style="color: #374151; margin-top: 0; display: flex; align-items: center; gap: 0.5rem;">
                  👨‍👩‍👧‍👦 Informations du parent/responsable
                </h3>
                <div style="background: #f0fdf4; padding: 1rem; border-radius: 8px;">
                  <p><strong>Prénom:</strong> ${preInscription.parentFirstName}</p>
                  <p><strong>Nom:</strong> ${preInscription.parentLastName}</p>
                  <p><strong>📧 Email:</strong> <a href="mailto:${preInscription.parentEmail}" style="color: #2563eb;">${preInscription.parentEmail}</a></p>
                  <p><strong>📞 Téléphone:</strong> <a href="tel:${preInscription.parentPhone}" style="color: #2563eb;">${preInscription.parentPhone}</a></p>
                  <p><strong>🏠 Adresse:</strong><br>${preInscription.parentAdress.replace(/\n/g, '<br>')}</p>
                </div>
              </div>

              <!-- Actions rapides -->
              <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h3 style="color: #374151; margin-top: 0;">⚡ Actions rapides</h3>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                  
                  <!-- Bouton Approuver -->
                  <a href="${process.env.BASE_URL || 'http://localhost:3007'}/admin/pre-inscriptions/${preInscription.id}/approve-email?token=${Buffer.from(preInscription.id.toString()).toString('base64')}" 
                     style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; margin: 0.5rem;">
                    ✅ APPROUVER cette pré-inscription
                  </a>
                  
                  <!-- Bouton Rejeter -->
                  <a href="${process.env.BASE_URL || 'http://localhost:3007'}/admin/pre-inscriptions/${preInscription.id}/reject-email?token=${Buffer.from(preInscription.id.toString()).toString('base64')}" 
                     style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; margin: 0.5rem;">
                    ❌ REJETER cette pré-inscription
                  </a>
                  
                  <!-- Bouton Dashboard -->
                  <a href="${process.env.BASE_URL || 'http://localhost:3007'}/admin/pre-inscriptions" 
                     style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; margin: 0.5rem;">
                    🎛️ Voir toutes les demandes
                  </a>
                </div>
              </div>

              <!-- Instructions -->
              <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 1rem;">
                <h4 style="color: #92400e; margin-top: 0;">📋 Que faire maintenant ?</h4>
                <ol style="color: #92400e; margin: 0; padding-left: 1.5rem;">
                  <li><strong>Examinez la demande</strong> ci-dessus</li>
                  <li><strong>Cliquez sur "APPROUVER"</strong> pour créer automatiquement le compte parent</li>
                  <li><strong>Ou cliquez sur "REJETER"</strong> si la demande ne peut être acceptée</li>
                  <li><strong>Le parent sera automatiquement notifié</strong> par email de votre décision</li>
                </ol>
              </div>

              <!-- Statistiques -->
              <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem;">
                <h4 style="color: #374151; margin-top: 0;">📊 Accès rapide</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; text-align: center;">
                  <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px;">
                    <a href="${process.env.BASE_URL || 'http://localhost:3007'}/auth/login" style="color: #374151; text-decoration: none;">
                      🔐 <strong>Se connecter</strong><br>
                      <small>Accès admin complet</small>
                    </a>
                  </div>
                  <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px;">
                    <a href="${process.env.BASE_URL || 'http://localhost:3007'}/admin/pre-inscriptions" style="color: #374151; text-decoration: none;">
                      📋 <strong>Dashboard</strong><br>
                      <small>Toutes les pré-inscriptions</small>
                    </a>
                  </div>
                  <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px;">
                    <a href="tel:${preInscription.parentPhone}" style="color: #374151; text-decoration: none;">
                      📞 <strong>Appeler</strong><br>
                      <small>Contact direct parent</small>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pied de page -->
            <div style="background: #374151; color: white; padding: 1.5rem; text-align: center;">
              <p style="margin: 0; opacity: 0.8; font-size: 14px;">
                📧 Email automatique du système de pré-inscription - École St Mathieu<br>
                🕒 Envoyé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        `
            };

            await transporter.sendMail(mailOptions);

            // Marquer la notification comme envoyée
            await prisma.preInscription.update({
                where: { id: preInscription.id },
                data: { notificationSent: true }
            });

            console.log(`📧 Email de notification enrichi envoyé pour la pré-inscription #${preInscription.id}`);

        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            // On ne fait pas planter le processus si l'email échoue
        }
    }    // Afficher la liste des pré-inscriptions (pour les admins)
    static async listPreInscriptions(req, res) {
        try {
            // Vérifier les permissions (ADMIN ou DIRECTION seulement)
            if (!req.user || !['ADMIN', 'DIRECTION'].includes(req.user.role)) {
                return res.status(403).render('pages/error', { message: 'Accès non autorisé' });
            }

            const preInscriptions = await prisma.preInscription.findMany({
                include: {
                    processedByUser: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.render('pages/admin/pre-inscriptions-list', {
                title: 'Gestion des pré-inscriptions',
                user: req.user,
                preInscriptions,
                success: req.flash('success'),
                errors: req.flash('errors')
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des pré-inscriptions:', error);
            res.status(500).render('pages/error', { message: 'Erreur serveur' });
        }
    }

    // Approuver une pré-inscription
    static async approvePreInscription(req, res) {
        try {
            const { id } = req.params;

            // Vérifier les permissions
            if (!req.user || !['ADMIN', 'DIRECTION'].includes(req.user.role)) {
                return res.status(403).json({ error: 'Accès non autorisé' });
            }

            const preInscription = await prisma.preInscription.findUnique({
                where: { id: parseInt(id) }
            });

            if (!preInscription) {
                req.flash('errors', 'Pré-inscription introuvable');
                return res.redirect('/admin/pre-inscriptions');
            }

            if (preInscription.status !== 'PENDING') {
                req.flash('errors', 'Cette pré-inscription a déjà été traitée');
                return res.redirect('/admin/pre-inscriptions');
            }

            // Créer le compte utilisateur
            const newUser = await prisma.user.create({
                data: {
                    firstName: preInscription.parentFirstName,
                    lastName: preInscription.parentLastName,
                    email: preInscription.parentEmail,
                    phone: preInscription.parentPhone,
                    adress: preInscription.parentAdress,
                    password: preInscription.parentPassword, // Déjà hashé
                    role: 'PARENT'
                }
            });

            // Mettre à jour le statut de la pré-inscription
            await prisma.preInscription.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'APPROVED',
                    processedBy: req.user.id,
                    processedAt: new Date()
                }
            });

            // Envoyer email de confirmation au parent
            await this.sendApprovalEmailToParent(preInscription);

            req.flash('success', 'Pré-inscription approuvée avec succès. Le compte parent a été créé.');
            res.redirect('/admin/pre-inscriptions');

        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            req.flash('errors', 'Erreur lors de l\'approbation de la pré-inscription');
            res.redirect('/admin/pre-inscriptions');
        }
    }

    // Rejeter une pré-inscription
    static async rejectPreInscription(req, res) {
        try {
            const { id } = req.params;

            // Vérifier les permissions
            if (!req.user || !['ADMIN', 'DIRECTION'].includes(req.user.role)) {
                return res.status(403).json({ error: 'Accès non autorisé' });
            }

            const preInscription = await prisma.preInscription.findUnique({
                where: { id: parseInt(id) }
            });

            if (!preInscription) {
                req.flash('errors', 'Pré-inscription introuvable');
                return res.redirect('/admin/pre-inscriptions');
            }

            if (preInscription.status !== 'PENDING') {
                req.flash('errors', 'Cette pré-inscription a déjà été traitée');
                return res.redirect('/admin/pre-inscriptions');
            }

            // Mettre à jour le statut
            await prisma.preInscription.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    processedBy: req.user.id,
                    processedAt: new Date()
                }
            });

            // Envoyer email de refus au parent
            await this.sendRejectionEmailToParent(preInscription);

            req.flash('success', 'Pré-inscription rejetée.');
            res.redirect('/admin/pre-inscriptions');

        } catch (error) {
            console.error('Erreur lors du rejet:', error);
            req.flash('errors', 'Erreur lors du rejet de la pré-inscription');
            res.redirect('/admin/pre-inscriptions');
        }
    }

    // Envoyer email d'approbation au parent
    static async sendApprovalEmailToParent(preInscription) {
        try {
            const transporter = this.getEmailTransporter();

            const mailOptions = {
                from: process.env.EMAIL_USER || 'sgdigitalweb13@gmail.com',
                to: preInscription.parentEmail,
                subject: 'Votre pré-inscription a été approuvée - École St Mathieu',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              Félicitations ! Votre pré-inscription a été approuvée
            </h2>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>Bonjour ${preInscription.parentFirstName} ${preInscription.parentLastName},</p>
              <p>Nous avons le plaisir de vous informer que votre demande de pré-inscription pour <strong>${preInscription.childFirstName} ${preInscription.childLastName}</strong> a été approuvée par la direction.</p>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Vos informations de connexion</h3>
              <p><strong>Email:</strong> ${preInscription.parentEmail}</p>
              <p><strong>Mot de passe:</strong> Celui que vous avez choisi lors de la pré-inscription</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.BASE_URL || 'http://localhost:3000'}/login" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Se connecter à votre espace parent
              </a>
            </div>

            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Prochaines étapes</h3>
              <p>Vous pouvez maintenant vous connecter à votre espace parent pour:</p>
              <ul>
                <li>Compléter le profil de votre enfant</li>
                <li>Consulter les actualités de l'école</li>
                <li>Accéder aux informations importantes</li>
              </ul>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p>Bienvenue dans la communauté de l'École St Mathieu !</p>
              <p>Pour toute question, n'hésitez pas à nous contacter.</p>
            </div>
          </div>
        `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email d'approbation envoyé à ${preInscription.parentEmail}`);

        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email d\'approbation:', error);
        }
    }

    // Envoyer email de rejet au parent
    static async sendRejectionEmailToParent(preInscription) {
        try {
            const transporter = this.getEmailTransporter();

            const mailOptions = {
                from: process.env.EMAIL_USER || 'sgdigitalweb13@gmail.com',
                to: preInscription.parentEmail,
                subject: 'Concernant votre demande de pré-inscription - École St Mathieu',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              Concernant votre demande de pré-inscription
            </h2>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>Bonjour ${preInscription.parentFirstName} ${preInscription.parentLastName},</p>
              <p>Nous vous remercions pour votre intérêt porté à l'École St Mathieu.</p>
              <p>Malheureusement, nous ne pouvons pas donner suite à votre demande de pré-inscription pour <strong>${preInscription.childFirstName} ${preInscription.childLastName}</strong> pour le moment.</p>
            </div>

            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>Cela peut être dû à:</p>
              <ul>
                <li>Places limitées pour l'année scolaire en cours</li>
                <li>Critères d'admission spécifiques</li>
                <li>Liste d'attente complète</li>
              </ul>
            </div>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>Pour plus d'informations ou pour discuter de votre situation, n'hésitez pas à nous contacter directement:</p>
              <p><strong>Téléphone:</strong> [Numéro de l'école]</p>
              <p><strong>Email:</strong> contact@ecole-st-mathieu.fr</p>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
              <p>Nous vous souhaitons le meilleur pour la scolarité de votre enfant.</p>
              <p>Cordialement, l'équipe de l'École St Mathieu</p>
            </div>
          </div>
        `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email de rejet envoyé à ${preInscription.parentEmail}`);

        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email de rejet:', error);
        }
    }

    // Approuver depuis l'email (avec token de sécurité)
    static async approveFromEmail(req, res) {
        try {
            const { id } = req.params;

            // Vérification basique du token (décodage base64)
            const expectedToken = Buffer.from(id).toString('base64');
            if (req.query.token !== expectedToken) {
                return res.status(403).render('pages/error', {
                    message: 'Token invalide. Veuillez utiliser le lien depuis votre email.',
                    title: 'Accès refusé'
                });
            }

            const preInscription = await prisma.preInscription.findUnique({
                where: { id: parseInt(id) }
            });

            if (!preInscription) {
                return res.status(404).render('pages/error', {
                    message: 'Pré-inscription introuvable.',
                    title: 'Erreur'
                });
            }

            if (preInscription.status !== 'PENDING') {
                return res.render('pages/pre-inscription-result', {
                    title: 'Déjà traitée',
                    preInscription,
                    status: preInscription.status,
                    message: `Cette pré-inscription a déjà été ${preInscription.status === 'APPROVED' ? 'approuvée' : 'rejetée'}.`
                });
            }

            // Créer le compte utilisateur
            const newUser = await prisma.user.create({
                data: {
                    firstName: preInscription.parentFirstName,
                    lastName: preInscription.parentLastName,
                    email: preInscription.parentEmail,
                    phone: preInscription.parentPhone,
                    adress: preInscription.parentAdress,
                    password: preInscription.parentPassword, // Déjà hashé
                    role: 'PARENT'
                }
            });

            // Mettre à jour le statut de la pré-inscription
            await prisma.preInscription.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'APPROVED',
                    processedAt: new Date()
                }
            });

            // Envoyer email de confirmation au parent
            await this.sendApprovalEmailToParent(preInscription);

            // Page de confirmation
            res.render('pages/pre-inscription-result', {
                title: 'Pré-inscription approuvée',
                preInscription,
                status: 'APPROVED',
                message: 'La pré-inscription a été approuvée avec succès. Le compte parent a été créé et un email de confirmation a été envoyé.',
                newUser
            });

        } catch (error) {
            console.error('Erreur lors de l\'approbation par email:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de l\'approbation de la pré-inscription',
                title: 'Erreur'
            });
        }
    }

    // Rejeter depuis l'email (avec token de sécurité)
    static async rejectFromEmail(req, res) {
        try {
            const { id } = req.params;

            // Vérification basique du token (décodage base64)
            const expectedToken = Buffer.from(id).toString('base64');
            if (req.query.token !== expectedToken) {
                return res.status(403).render('pages/error', {
                    message: 'Token invalide. Veuillez utiliser le lien depuis votre email.',
                    title: 'Accès refusé'
                });
            }

            const preInscription = await prisma.preInscription.findUnique({
                where: { id: parseInt(id) }
            });

            if (!preInscription) {
                return res.status(404).render('pages/error', {
                    message: 'Pré-inscription introuvable.',
                    title: 'Erreur'
                });
            }

            if (preInscription.status !== 'PENDING') {
                return res.render('pages/pre-inscription-result', {
                    title: 'Déjà traitée',
                    preInscription,
                    status: preInscription.status,
                    message: `Cette pré-inscription a déjà été ${preInscription.status === 'APPROVED' ? 'approuvée' : 'rejetée'}.`
                });
            }

            // Mettre à jour le statut
            await prisma.preInscription.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    processedAt: new Date()
                }
            });

            // Envoyer email de refus au parent
            await this.sendRejectionEmailToParent(preInscription);

            // Page de confirmation
            res.render('pages/pre-inscription-result', {
                title: 'Pré-inscription rejetée',
                preInscription,
                status: 'REJECTED',
                message: 'La pré-inscription a été rejetée. Un email d\'information a été envoyé au parent.'
            });

        } catch (error) {
            console.error('Erreur lors du rejet par email:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors du rejet de la pré-inscription',
                title: 'Erreur'
            });
        }
    }
}

module.exports = PreInscriptionController;
