const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const loginController = {
    showLogin: (req, res) => {
        res.render('pages/auth/login.twig', {
            title: 'Connexion - École Saint-Mathieu',
            error: null,
            email: ''
        });
    },

    login: async (req, res) => {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('pages/auth/login.twig', {
                error: 'Veuillez remplir tous les champs',
                email: email || '',
                title: 'Connexion - École Saint-Mathieu'
            });
        }

        // COMPTES TEST TEMPORAIRES - À supprimer quand MySQL sera configuré
        if (email === 'sebcecg@gmail.com' && password === 'Paul3726&') {
            req.session.user = {
                id: 1,
                firstName: 'Sébastien',
                lastName: 'Parent Test',
                email: 'sebcecg@gmail.com',
                role: 'PARENT'
            };

            return res.redirect('/parent/dashboard');
        }

        if (email === 'restaurant@ecole-saint-mathieu.fr' && password === 'Restaurant123!') {
            req.session.user = {
                id: 2,
                firstName: 'Marie',
                lastName: 'Cantinière',
                email: 'restaurant@ecole-saint-mathieu.fr',
                role: 'RESTAURANT'
            };

            return res.redirect('/restaurant/dashboard');
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email: email }
            });


            if (!user) {
                return res.render('pages/auth/login.twig', {
                    error: 'Email ou mot de passe incorrect',
                    email,
                    title: 'Connexion - École Saint-Mathieu'
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.render('pages/auth/login.twig', {
                    error: 'Email ou mot de passe incorrect',
                    email,
                    title: 'Connexion - École Saint-Mathieu'
                });
            }

            req.session.user = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            };


            req.session.save((err) => {
                if (err) {
                    console.error('❌ Erreur sauvegarde session:', err);
                    return res.render('pages/auth/login.twig', {
                        error: 'Erreur de session, veuillez réessayer',
                        email,
                        title: 'Connexion - École Saint-Mathieu'
                    });
                }


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
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Erreur déconnexion:', err);
            }
            res.redirect('/auth/login');
        });
    },

    redirectByRole: (role, res) => {

        switch (role) {
            case 'SUPER_ADMIN':
                res.redirect('/admin/dashboard');
                break;
            case 'DIRECTION': // Corrigé: DIRECTION au lieu de DIRECTEUR
                res.redirect('/directeur/dashboard');
                break;
            case 'ASSISTANT_DIRECTION':
                res.redirect('/admin/dashboard');
                break;
            case 'APEL':
                res.redirect('/parent/dashboard');
                break;
            case 'ADMIN': // Garde compatibilité
                res.redirect('/admin/dashboard');
                break;
            case 'GESTIONNAIRE_SITE':
                res.redirect('/directeur/dashboard');
                break;
            case 'SECRETAIRE_DIRECTION':
                res.redirect('/secretaire/dashboard');
                break;
            case 'ENSEIGNANT':
                res.redirect('/enseignant/dashboard');
                break;
            case 'PARENT':
                res.redirect('/parent/dashboard');
                break;
            default:
                res.redirect('/');
        }
    }
};

module.exports = loginController;
