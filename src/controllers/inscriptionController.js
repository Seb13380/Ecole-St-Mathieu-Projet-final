const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const inscriptionController = {
    // Afficher le formulaire d'inscription
    showRegistrationForm: (req, res) => {
        res.render('pages/auth/register', {
            title: 'Inscription - École Saint-Mathieu',
            error: req.query.error,
            success: req.query.success
        });
    },

    // Traiter la demande d'inscription
    processRegistration: async (req, res) => {
        try {
            const {
                parentFirstName,
                parentLastName,
                parentEmail,
                parentPhone,
                parentAddress,
                password,
                confirmPassword,
                children // Tableau des enfants depuis le formulaire
            } = req.body;

            // Validation des mots de passe
            if (password !== confirmPassword) {
                return res.redirect('/auth/register?error=Les mots de passe ne correspondent pas');
            }

            // Validation du mot de passe
            if (password.length < 6) {
                return res.redirect('/auth/register?error=Le mot de passe doit contenir au moins 6 caractères');
            }

            // Vérifier si l'email existe déjà
            const existingRequest = await prisma.inscriptionRequest.findUnique({
                where: { parentEmail }
            });

            if (existingRequest) {
                return res.redirect('/auth/register?error=Une demande avec cet email existe déjà');
            }

            // Vérifier aussi si l'email existe déjà comme utilisateur
            const existingUser = await prisma.user.findUnique({
                where: { email: parentEmail }
            });

            if (existingUser) {
                return res.redirect('/auth/register?error=Un compte avec cet email existe déjà');
            }

            // Hachage du mot de passe
            const hashedPassword = await bcrypt.hash(password, 12);

            // Traitement des enfants - le nouveau format envoie children comme objet
            let childrenData = [];
            if (children) {
                // Convertir l'objet children en tableau
                childrenData = Object.keys(children).map(key => {
                    const child = children[key];
                    return {
                        firstName: child.firstName,
                        lastName: child.lastName,
                        birthDate: child.birthDate
                    };
                }).filter(child => child.firstName && child.lastName && child.birthDate);
            }

            // Vérifier qu'au moins un enfant est présent
            if (childrenData.length === 0) {
                return res.redirect('/auth/register?error=Veuillez ajouter au moins un enfant');
            }

            // Création de la demande d'inscription
            await prisma.inscriptionRequest.create({
                data: {
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    parentAddress,
                    password: hashedPassword,
                    children: childrenData
                }
            });

            res.redirect('/auth/register?success=Votre demande d\'inscription a été envoyée avec succès. Vous recevrez une réponse par email dans les plus brefs délais.');

        } catch (error) {
            console.error('Erreur lors de la création de la demande d\'inscription:', error);
            res.redirect('/auth/register?error=Une erreur est survenue. Veuillez réessayer.');
        }
    },

    // Pour l'admin : afficher toutes les demandes
    showAllRequests: async (req, res) => {
        try {
            const requests = await prisma.inscriptionRequest.findMany({
                include: {
                    reviewer: {
                        select: { firstName: true, lastName: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.render('pages/admin/inscription-requests', {
                title: 'Demandes d\'inscription',
                requests
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des demandes'
            });
        }
    },

    // Pour l'admin : approuver une demande
    approveRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            const request = await prisma.inscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'APPROVED',
                    reviewedAt: new Date(),
                    reviewedBy: req.session.user.id,
                    reviewComment: comment || 'Demande approuvée'
                }
            });

            // TODO: Envoyer un email de confirmation au parent
            // TODO: Créer automatiquement le compte parent dans le système

            res.json({
                success: true,
                message: 'Demande approuvée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'approbation'
            });
        }
    },

    // Pour l'admin : rejeter une demande
    rejectRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            await prisma.inscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    reviewedAt: new Date(),
                    reviewedBy: req.session.user.id,
                    reviewComment: comment || 'Demande rejetée'
                }
            });

            // TODO: Envoyer un email de refus au parent

            res.json({
                success: true,
                message: 'Demande rejetée'
            });
        } catch (error) {
            console.error('Erreur lors du rejet:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du rejet'
            });
        }
    }
};

module.exports = inscriptionController;
