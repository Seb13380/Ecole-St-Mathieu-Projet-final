const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const preInscriptionController = {
    // Affichage du formulaire de pré-inscription
    getPreInscription: async (req, res) => {
        try {
            res.render('pages/pre-inscription', {
                title: 'Pré-inscription - École Saint Mathieu',
                user: req.session.user || null,
                currentUrl: req.originalUrl,
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (error) {
            console.error('Erreur lors du chargement de la page pré-inscription:', error);
            res.status(500).render('error', {
                title: 'Erreur',
                message: 'Une erreur est survenue lors du chargement de la page.',
                user: req.session.user || null
            });
        }
    },

    // Traitement du formulaire de pré-inscription
    postPreInscription: async (req, res) => {
        try {
            // 🛡️ PROTECTION ANTI-BOT 1 : Honeypot (champ invisible)
            if (req.body.website) {
                // Le bot a rempli le champ caché, on rejette silencieusement
                console.log('🤖 Bot détecté (honeypot) - Bloqué');
                return res.redirect('/pre-inscription');
            }

            // 🛡️ PROTECTION ANTI-BOT 2 : Limite de temps (min 3 secondes)
            const formTimestamp = parseInt(req.body.formTimestamp);
            const currentTime = Date.now();
            const timeDiff = (currentTime - formTimestamp) / 1000; // en secondes

            if (isNaN(formTimestamp) || timeDiff < 3) {
                console.log(`🤖 Bot détecté (soumission trop rapide: ${timeDiff}s) - Bloqué`);
                return res.redirect('/pre-inscription');
            }

            const {
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                parentAddress,
                parentPassword,
                confirmPassword,
                studentFirstName,
                studentLastName,
                studentBirthDate,
                currentClass,
                requestedClass,
                previousSchool,
                specialNeeds,
                message
            } = req.body;

            // Validation des champs obligatoires
            if (!parentFirstName || !parentLastName || !parentEmail || !parentPhone ||
                !studentFirstName || !studentLastName || !studentBirthDate || !requestedClass ||
                !parentPassword || !confirmPassword) {
                req.flash('error', 'Veuillez remplir tous les champs obligatoires.');
                return res.redirect('/pre-inscription');
            }

            // Validation du mot de passe
            if (parentPassword !== confirmPassword) {
                req.flash('error', 'Les mots de passe ne correspondent pas.');
                return res.redirect('/pre-inscription');
            }

            if (parentPassword.length < 6) {
                req.flash('error', 'Le mot de passe doit contenir au moins 6 caractères.');
                return res.redirect('/pre-inscription');
            }

            // Validation format mot de passe (majuscule, minuscule, chiffre)
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
            if (!passwordRegex.test(parentPassword)) {
                req.flash('error', 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.');
                return res.redirect('/pre-inscription');
            }

            // Créer l'objet enfant au format JSON attendu par le modèle
            const childrenData = [{
                firstName: studentFirstName,
                lastName: studentLastName,
                birthDate: studentBirthDate,
                currentClass: currentClass || null,
                requestedClass,
                previousSchool: previousSchool || null
            }];

            // Hasher le mot de passe fourni par l'utilisateur
            const hashedPassword = await bcrypt.hash(parentPassword, 12);

            // Création de la demande de pré-inscription
            const preInscription = await prisma.preInscriptionRequest.create({
                data: {
                    // Informations parent
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    parentAddress,
                    parentPassword: hashedPassword,

                    // Informations élève (en JSON)
                    children: childrenData,
                    specialNeeds: specialNeeds || null,
                    message: message || null,

                    // Statut
                    status: 'PENDING',
                    submittedAt: new Date()
                }
            });


            req.flash('success', 'Votre demande de pré-inscription a été envoyée avec succès ! Nous vous recontacterons rapidement.');
            res.redirect('/pre-inscription');

        } catch (error) {
            console.error('Erreur lors de la création de la pré-inscription:', error);
            req.flash('error', 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.');
            res.redirect('/pre-inscription');
        }
    },

    // Administration - Liste des demandes (pour les administrateurs)
    getAdminPreInscriptions: async (req, res) => {
        try {
            const requests = await prisma.preInscriptionRequest.findMany({
                orderBy: { submittedAt: 'desc' }
            });

            res.render('admin/pre-inscriptions', {
                title: 'Gestion des pré-inscriptions',
                user: req.session.user,
                requests,
                currentUrl: req.originalUrl
            });
        } catch (error) {
            console.error('Erreur lors du chargement des pré-inscriptions:', error);
            res.status(500).render('error', {
                title: 'Erreur',
                message: 'Une erreur est survenue lors du chargement.',
                user: req.session.user
            });
        }
    },

    // Mise à jour du statut d'une demande
    updateRequestStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, adminNotes } = req.body;

            await prisma.preInscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status,
                    adminNotes: adminNotes || null,
                    processedAt: status !== 'PENDING' ? new Date() : null,
                    processedBy: req.session.user.id
                }
            });

            req.flash('success', 'Statut mis à jour avec succès.');
            res.redirect('/admin/pre-inscriptions');
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            req.flash('error', 'Erreur lors de la mise à jour du statut.');
            res.redirect('/admin/pre-inscriptions');
        }
    }
};

module.exports = preInscriptionController;
