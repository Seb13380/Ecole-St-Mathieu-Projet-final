const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Version temporaire du contrôleur sans email (pour tests)
class PreInscriptionControllerTemp {

    // Afficher le formulaire de pré-inscription
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

    // Traiter la soumission de pré-inscription (SANS EMAIL pour test)
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

            // SIMULATION d'envoi d'email (sans vraiment envoyer)
            console.log('📧 SIMULATION - Email qui serait envoyé au directeur :');
            console.log(`   À: ${process.env.NODE_ENV === 'production' ? 'lionel@ecole-st-mathieu.fr' : 'sgdigitalweb13@gmail.com'}`);
            console.log(`   Sujet: Nouvelle demande de pré-inscription - École St Mathieu`);
            console.log(`   Contenu: Demande pour ${preInscription.childFirstName} ${preInscription.childLastName}`);
            console.log(`   Parent: ${preInscription.parentFirstName} ${preInscription.parentLastName} (${preInscription.parentEmail})`);

            req.flash('success', 'Votre demande de pré-inscription a été enregistrée. Une notification a été envoyée à la direction (en simulation - email désactivé pour tests).');
            res.redirect('/pre-inscription');

        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            req.flash('errors', 'Erreur lors de l\'envoi de votre demande. Veuillez réessayer.');
            res.redirect('/pre-inscription');
        }
    }

    // Afficher la liste des pré-inscriptions (pour les admins)
    static async listPreInscriptions(req, res) {
        try {
            // Vérifier les permissions (ADMIN ou DIRECTION seulement)
            if (!req.session.user || !['ADMIN', 'DIRECTION'].includes(req.session.user.role)) {
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
                user: req.session.user,
                preInscriptions,
                success: req.flash('success'),
                errors: req.flash('errors')
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des pré-inscriptions:', error);
            res.status(500).render('pages/error', { message: 'Erreur serveur' });
        }
    }

    // Approuver une pré-inscription (SANS EMAIL pour test)
    static async approvePreInscription(req, res) {
        try {
            const { id } = req.params;

            // Vérifier les permissions
            if (!req.session.user || !['ADMIN', 'DIRECTION'].includes(req.session.user.role)) {
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
                    processedBy: req.session.user.id,
                    processedAt: new Date()
                }
            });

            // SIMULATION d'envoi d'email d'approbation
            console.log('📧 SIMULATION - Email d\'approbation qui serait envoyé :');
            console.log(`   À: ${preInscription.parentEmail}`);
            console.log(`   Sujet: Votre pré-inscription a été approuvée - École St Mathieu`);
            console.log(`   Message: Compte parent créé avec succès`);

            req.flash('success', 'Pré-inscription approuvée avec succès. Le compte parent a été créé. (Email d\'approbation simulé)');
            res.redirect('/admin/pre-inscriptions');

        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            req.flash('errors', 'Erreur lors de l\'approbation de la pré-inscription');
            res.redirect('/admin/pre-inscriptions');
        }
    }

    // Rejeter une pré-inscription (SANS EMAIL pour test)
    static async rejectPreInscription(req, res) {
        try {
            const { id } = req.params;

            // Vérifier les permissions
            if (!req.session.user || !['ADMIN', 'DIRECTION'].includes(req.session.user.role)) {
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
                    processedBy: req.session.user.id,
                    processedAt: new Date()
                }
            });

            // SIMULATION d'envoi d'email de rejet
            console.log('📧 SIMULATION - Email de rejet qui serait envoyé :');
            console.log(`   À: ${preInscription.parentEmail}`);
            console.log(`   Sujet: Concernant votre demande de pré-inscription - École St Mathieu`);
            console.log(`   Message: Demande non retenue`);

            req.flash('success', 'Pré-inscription rejetée. (Email de notification simulé)');
            res.redirect('/admin/pre-inscriptions');

        } catch (error) {
            console.error('Erreur lors du rejet:', error);
            req.flash('errors', 'Erreur lors du rejet de la pré-inscription');
            res.redirect('/admin/pre-inscriptions');
        }
    }
}

module.exports = PreInscriptionControllerTemp;
