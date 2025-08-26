const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

/**
 * Créer automatiquement un compte parent et ses enfants
 * @param {Object} inscriptionRequest - Demande d'inscription approuvée
 * @returns {Object} - Compte parent créé avec mot de passe temporaire
 */
async function createParentAccount(inscriptionRequest) {
    try {
        const {
            parentFirstName,
            parentLastName,
            parentEmail,
            parentPhone,
            parentAddress,
            children
        } = inscriptionRequest;

        // Générer un mot de passe temporaire
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Vérifier s'il existe une classe par défaut, sinon la créer
        let defaultClasse = await prisma.classe.findFirst({
            where: { nom: 'Non assigné' }
        });

        if (!defaultClasse) {
            defaultClasse = await prisma.classe.create({
                data: {
                    nom: 'Non assigné',
                    niveau: 'En attente',
                    anneeScolaire: new Date().getFullYear().toString()
                }
            });
        }

        // Créer le compte parent
        const parentUser = await prisma.user.create({
            data: {
                firstName: parentFirstName,
                lastName: parentLastName,
                email: parentEmail,
                phone: parentPhone,
                adress: parentAddress,
                password: hashedPassword,
                role: 'PARENT'
            }
        });

        // Créer les comptes enfants
        const createdChildren = [];
        for (const child of children) {
            const student = await prisma.student.create({
                data: {
                    firstName: child.firstName,
                    lastName: child.lastName,
                    dateNaissance: new Date(child.birthDate),
                    parentId: parentUser.id,
                    classeId: defaultClasse.id
                }
            });
            createdChildren.push(student);
        }

        console.log(`✅ Compte créé pour ${parentFirstName} ${parentLastName} avec ${createdChildren.length} enfant(s)`);

        return {
            success: true,
            parentUser,
            children: createdChildren,
            tempPassword
        };

    } catch (error) {
        console.error('❌ Erreur lors de la création du compte:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

const inscriptionController = {
    // Afficher le formulaire d'inscription
    showRegistrationForm: (req, res) => {
        res.render('pages/auth/register', {
            title: 'Inscription - École Saint-Mathieu',
            error: req.query.error,
            success: req.query.success
        });
    },

    // Créer automatiquement le compte parent et les enfants
    createParentAndStudentAccounts: async (inscriptionRequest) => {
        try {
            console.log('🔄 Création automatique des comptes...');

            // 1. Créer le compte parent
            const parentUser = await prisma.user.create({
                data: {
                    firstName: inscriptionRequest.parentFirstName,
                    lastName: inscriptionRequest.parentLastName,
                    email: inscriptionRequest.parentEmail,
                    phone: inscriptionRequest.parentPhone,
                    adress: inscriptionRequest.parentAddress,
                    password: inscriptionRequest.password, // Déjà hashé
                    role: 'PARENT'
                }
            });

            console.log('✅ Compte parent créé:', parentUser.email);

            // 2. Créer les comptes étudiants pour chaque enfant
            const students = [];
            const children = inscriptionRequest.children;

            // Il faut d'abord récupérer une classe par défaut ou en créer une
            let defaultClasse = await prisma.classe.findFirst({
                where: { nom: 'Non assigné' }
            });

            // Si aucune classe "Non assigné" n'existe, la créer
            if (!defaultClasse) {
                defaultClasse = await prisma.classe.create({
                    data: {
                        nom: 'Non assigné',
                        niveau: 'A définir',
                        anneeScolaire: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
                    }
                });
                console.log('✅ Classe par défaut créée');
            }

            // Créer chaque enfant
            for (const child of children) {
                const student = await prisma.student.create({
                    data: {
                        firstName: child.firstName,
                        lastName: child.lastName,
                        dateNaissance: new Date(child.birthDate),
                        parentId: parentUser.id,
                        classeId: defaultClasse.id
                    }
                });
                students.push(student);
                console.log('✅ Compte enfant créé:', `${student.firstName} ${student.lastName}`);
            }

            console.log('🎉 Tous les comptes ont été créés avec succès !');
            return { parentUser, students };

        } catch (error) {
            console.error('❌ Erreur lors de la création des comptes:', error);
            throw error;
        }
    },

    // Afficher les détails d'une demande
    showRequestDetails: async (req, res) => {
        try {
            const { id } = req.params;

            const request = await prisma.inscriptionRequest.findUnique({
                where: { id: parseInt(id) },
                include: {
                    reviewer: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });

            if (!request) {
                return res.status(404).render('pages/error', {
                    message: 'Demande non trouvée',
                    user: req.session.user
                });
            }

            // Parser les enfants
            let children = [];
            try {
                if (typeof request.children === 'string') {
                    children = JSON.parse(request.children);
                } else {
                    children = request.children || [];
                }
            } catch (e) {
                children = [];
            }

            res.render('pages/admin/inscription-request-details', {
                title: 'Détails de la demande',
                request: {
                    ...request,
                    children: children
                },
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des détails:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des détails',
                user: req.session.user
            });
        }
    },

    // Traiter la demande d'inscription (mise à jour)
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
            const inscriptionRequest = await prisma.inscriptionRequest.create({
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

            // Envoyer l'email de confirmation au parent
            try {
                await emailService.sendConfirmationEmail({
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    children: childrenData
                });
                console.log('✅ Email de confirmation envoyé à:', parentEmail);
            } catch (emailError) {
                console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
            }

            // Envoyer la notification au directeur
            try {
                await emailService.sendNewRequestNotification({
                    parentFirstName,
                    parentLastName,
                    parentEmail,
                    parentPhone,
                    children: childrenData
                });
                console.log('✅ Notification envoyée au directeur');
            } catch (notificationError) {
                console.error('❌ Erreur lors de l\'envoi de la notification au directeur:', notificationError);
            }

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

            // Parser le JSON des enfants pour chaque demande
            const requestsWithParsedChildren = requests.map(request => {
                let children = [];
                try {
                    if (typeof request.children === 'string') {
                        children = JSON.parse(request.children);
                    } else {
                        children = request.children || [];
                    }
                } catch (e) {
                    console.error('Erreur parsing children:', e);
                    children = [];
                }

                return {
                    ...request,
                    children: children
                };
            });

            console.log(`📋 ${requestsWithParsedChildren.length} demandes d'inscription trouvées`);

            res.render('pages/admin/inscription-requests', {
                title: 'Demandes d\'inscription',
                requests: requestsWithParsedChildren,
                user: req.session.user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            res.status(500).render('pages/error', {
                message: 'Erreur lors de la récupération des demandes',
                user: req.session.user
            });
        }
    },

    // Pour l'admin : approuver une demande
    approveRequest: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('📝 Données reçues - req.body:', req.body);
            console.log('📝 Params reçus - req.params:', req.params);

            // Vérification defensive pour req.body
            if (!req.body) {
                console.error('❌ req.body est undefined');
                return res.status(400).json({
                    success: false,
                    message: 'Données de requête manquantes'
                });
            }

            const { comment } = req.body;

            // Récupérer la demande d'inscription
            const request = await prisma.inscriptionRequest.findUnique({
                where: { id: parseInt(id) }
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Demande d\'inscription non trouvée'
                });
            }

            // Vérifier si un compte avec cet email existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: request.parentEmail }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Un compte avec cet email existe déjà'
                });
            }

            // 1. Créer automatiquement les comptes parent et enfants
            const accountCreation = await createParentAccount(request);

            if (!accountCreation.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la création des comptes: ' + accountCreation.error
                });
            }

            console.log('✅ Comptes créés avec succès pour:', request.parentEmail);

            // 2. Mettre à jour le statut de la demande
            await prisma.inscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'APPROVED',
                    reviewedAt: new Date(),
                    reviewedBy: req.session.user.id,
                    reviewComment: comment || 'Demande approuvée'
                }
            });

            // 3. Envoyer l'email d'approbation
            try {
                await emailService.sendApprovalEmail({
                    parentFirstName: request.parentFirstName,
                    parentLastName: request.parentLastName,
                    parentEmail: request.parentEmail,
                    children: request.children
                }, comment);
                console.log('✅ Email d\'approbation envoyé à:', request.parentEmail);
            } catch (emailError) {
                console.error('❌ Erreur lors de l\'envoi de l\'email d\'approbation:', emailError);
            }

            // 4. TODO: Envoyer les identifiants de connexion (à implémenter)
            console.log('🔑 Mot de passe temporaire généré:', accountCreation.tempPassword);

            res.json({
                success: true,
                message: 'Demande approuvée avec succès et comptes créés',
                data: {
                    parentId: accountCreation.parentUser.id,
                    childrenIds: accountCreation.children.map(c => c.id),
                    tempPassword: accountCreation.tempPassword // En développement seulement
                }
            });

        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'approbation: ' + error.message
            });
        }
    },

    // Pour l'admin : rejeter une demande
    rejectRequest: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('📝 Données reçues pour rejet - req.body:', req.body);
            console.log('📝 Params reçus pour rejet - req.params:', req.params);

            // Vérification defensive pour req.body
            if (!req.body) {
                console.error('❌ req.body est undefined pour rejet');
                return res.status(400).json({
                    success: false,
                    message: 'Données de requête manquantes'
                });
            }

            const { comment } = req.body;

            const request = await prisma.inscriptionRequest.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    reviewedAt: new Date(),
                    reviewedBy: req.session.user.id,
                    reviewComment: comment || 'Demande rejetée'
                }
            });

            // Envoyer l'email de rejet
            try {
                await emailService.sendRejectionEmail({
                    parentFirstName: request.parentFirstName,
                    parentLastName: request.parentLastName,
                    parentEmail: request.parentEmail,
                    children: request.children
                }, comment);
                console.log('✅ Email de rejet envoyé à:', request.parentEmail);
            } catch (emailError) {
                console.error('❌ Erreur lors de l\'envoi de l\'email de rejet:', emailError);
            }

            res.json({
                success: true,
                message: 'Demande rejetée'
            });
        } catch (error) {
            console.error('❌ Erreur lors du rejet:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du rejet: ' + error.message
            });
        }
    }
};

module.exports = inscriptionController;
