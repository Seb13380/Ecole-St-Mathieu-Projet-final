const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const loginController = {
    showLogin: (req, res) => {
        console.log('🔑 Affichage page connexion');
        res.render('pages/auth/login.twig', {
            title: 'Connexion - École Saint-Mathieu',
            error: null,
            email: ''
        });
    },

    login: async (req, res) => {
        console.log('🔐 Tentative de connexion');
        console.log('📦 Données reçues:', req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            console.log('❌ Champs manquants');
            return res.render('pages/auth/login.twig', {
                error: 'Veuillez remplir tous les champs',
                email: email || '',
                title: 'Connexion - École Saint-Mathieu'
            });
        }

        try {
            console.log('🔍 Recherche utilisateur:', email);
            const user = await prisma.user.findUnique({
                where: { email: email }
            });

            console.log('👤 Utilisateur trouvé:', user ? 'Oui' : 'Non');

            if (!user) {
                console.log('❌ Utilisateur non trouvé:', email);
                return res.render('pages/auth/login.twig', {
                    error: 'Email ou mot de passe incorrect',
                    email,
                    title: 'Connexion - École Saint-Mathieu'
                });
            }

            console.log('🔒 Vérification mot de passe...');
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                console.log('❌ Mot de passe incorrect pour:', email);
                return res.render('pages/auth/login.twig', {
                    error: 'Email ou mot de passe incorrect',
                    email,
                    title: 'Connexion - École Saint-Mathieu'
                });
            }

            console.log('✅ Connexion réussie pour:', email);
            req.session.user = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            };

            console.log('📋 Session créée:', req.session.user);

            req.session.save((err) => {
                if (err) {
                    console.error('❌ Erreur sauvegarde session:', err);
                    return res.render('pages/auth/login.twig', {
                        error: 'Erreur de session, veuillez réessayer',
                        email,
                        title: 'Connexion - École Saint-Mathieu'
                    });
                }

                console.log('💾 Session sauvegardée avec succès');

                loginController.redirectByRole(user.role, res);
            });

        } catch (error) {
            console.error('❌ Erreur connexion:', error);
            res.render('pages/auth/login.twig', {
                error: 'Une erreur est survenue lors de la connexion. Veuillez réessayer.',
                email: req.body.email,
                title: 'Connexion - École Saint-Mathieu'
            });
        }
    },

    logout: (req, res) => {
        console.log('🚪 Déconnexion utilisateur');
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Erreur déconnexion:', err);
            }
            console.log('✅ Session détruite');
            res.redirect('/auth/login');
        });
    },

    redirectByRole: (role, res) => {
        console.log('🎯 Redirection selon le rôle:', role);

        switch (role) {
            case 'SUPER_ADMIN':
                console.log('➡️ Redirection vers tableau de bord super admin');
                res.redirect('/admin/dashboard');
                break;
            case 'DIRECTEUR':
                console.log('➡️ Redirection vers tableau de bord directeur');
                res.redirect('/directeur/dashboard');
                break;
            case 'ASSISTANT_DIRECTION':
                console.log('➡️ Redirection vers tableau de bord assistant direction');
                res.redirect('/admin/dashboard');
                break;
            case 'APEL':
                console.log('➡️ Redirection vers tableau de bord APEL');
                res.redirect('/admin/dashboard');
                break;
            case 'ADMIN': // Garde compatibilité
                console.log('➡️ Redirection vers tableau de bord admin');
                res.redirect('/admin/dashboard');
                break;
            case 'ENSEIGNANT':
                console.log('➡️ Redirection vers tableau de bord enseignant');
                res.redirect('/enseignant/dashboard');
                break;
            case 'PARENT':
                console.log('➡️ Redirection vers tableau de bord parent');
                res.redirect('/parent/dashboard');
                break;
            default:
                console.log('➡️ Redirection vers accueil (rôle inconnu)');
                res.redirect('/');
        }
    }
};

module.exports = loginController;
