const { PrismaClient } = require('@prisma/client');
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
            const {
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                parentAddress,
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
                !studentFirstName || !studentLastName || !studentBirthDate || !requestedClass) {
                req.flash('error', 'Veuillez remplir tous les champs obligatoires.');
                return res.redirect('/pre-inscription');
            }

            // Création de la demande de pré-inscription
            const preInscription = await prisma.preInscriptionRequest.create({
                data: {
                    // Informations parent
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    parentAddress,

                    // Informations élève
                    studentFirstName,
                    studentLastName,
                    studentBirthDate: new Date(studentBirthDate),
                    currentClass: currentClass || null,
                    requestedClass,
                    previousSchool: previousSchool || null,
                    specialNeeds: specialNeeds || null,
                    message: message || null,

                    // Statut
                    status: 'PENDING',
                    submittedAt: new Date()
                }
            });

            console.log('Nouvelle demande de pré-inscription créée:', preInscription.id);

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
